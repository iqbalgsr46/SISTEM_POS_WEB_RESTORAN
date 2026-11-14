<?php
namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffAuthTest extends TestCase
{
    use RefreshDatabase;

    private function signed(string $method, string $uri, array $body, array $claims): array
    {
        config(['staff.secret' => str_repeat('s', 64)]);
        $payload = rtrim(strtr(base64_encode(json_encode([...$claims, 'exp' => time() + 30, 'method' => $method, 'uri' => $uri, 'body' => hash('sha256', json_encode($body))])), '+/', '-_'), '=');
        return ['X-Staff-Identity' => $payload.'.'.hash_hmac('sha256', $payload, config('staff.secret'))];
    }

    public function test_verified_google_registration_persists_pending_and_exact_bootstrap_only(): void
    {
        $body = ['sub' => 'google-123', 'email' => 'someone@example.com', 'email_verified' => true, 'name' => 'Staff'];
        $headers = $this->signed('POST', '/api/auth/google', $body, ['purpose' => 'provision']);
        $this->postJson('/api/auth/google', $body, $headers)->assertCreated()->assertJsonPath('status', 'pending')->assertJsonPath('role', null);
        $this->assertDatabaseHas('staff_accounts', ['google_sub' => 'google-123', 'status' => 'pending']);
        $body['sub'] = 'bootstrap'; $body['email'] = 'ikbalgsr46@gmail.com';
        $this->postJson('/api/auth/google', $body, $this->signed('POST', '/api/auth/google', $body, ['purpose' => 'provision']))->assertCreated()->assertJsonPath('role', 'admin')->assertJsonPath('status', 'approved');
        $body['sub'] = 'unverified'; $body['email_verified'] = false;
        $this->postJson('/api/auth/google', $body, $this->signed('POST', '/api/auth/google', $body, ['purpose' => 'provision']))->assertUnprocessable();
    }

    public function test_pending_wrong_role_and_revoked_accounts_are_denied_on_every_request(): void
    {
        $account = \App\Models\StaffAccount::create(['google_sub'=>'staff', 'email'=>'staff@example.com', 'name'=>'Staff', 'status'=>'pending']);
        $headers = $this->signed('GET', '/api/orders', [], ['purpose'=>'staff', 'sub'=>'staff']);
        $this->getJson('/api/orders', $headers)->assertForbidden();
        $account->update(['status'=>'approved', 'role'=>'cashier']);
        $this->getJson('/api/orders', $headers)->assertOk();
        $this->patchJson('/api/stock', [], $this->signed('PATCH', '/api/stock', [], ['purpose'=>'staff', 'sub'=>'staff']))->assertForbidden();
        $account->update(['status'=>'disabled']);
        $this->getJson('/api/orders', $headers)->assertForbidden();
        $this->getJson('/api/orders', ['X-Staff-Identity'=>'fabricated.signature'])->assertUnauthorized();
    }

    public function test_admin_can_manage_accounts_but_cannot_remove_last_admin(): void
    {
        $admin = \App\Models\StaffAccount::create(['google_sub'=>'admin', 'email'=>'admin@example.com', 'name'=>'Admin', 'status'=>'approved', 'role'=>'admin']);
        $pending = \App\Models\StaffAccount::create(['google_sub'=>'pending', 'email'=>'pending@example.com', 'name'=>'Pending', 'status'=>'pending']);
        $this->getJson('/api/accounts', $this->signed('GET','/api/accounts',[],['purpose'=>'staff','sub'=>'admin']))->assertOk()->assertJsonCount(2);
        $body = ['id'=>$pending->id, 'status'=>'approved', 'role'=>'cashier'];
        $this->patchJson('/api/accounts', $body, $this->signed('PATCH','/api/accounts',$body,['purpose'=>'staff','sub'=>'admin']))->assertOk()->assertJsonPath('role','cashier');
        $body = ['id'=>$admin->id, 'status'=>'disabled', 'role'=>'admin'];
        $this->patchJson('/api/accounts', $body, $this->signed('PATCH','/api/accounts',$body,['purpose'=>'staff','sub'=>'admin']))->assertStatus(409);
        $this->getJson('/api/accounts', $this->signed('GET','/api/accounts',[],['purpose'=>'staff','sub'=>'pending']))->assertForbidden();
        $this->getJson('/api/auth/me', $this->signed('GET','/api/auth/me',[],['purpose'=>'staff','sub'=>'pending']))->assertOk()->assertJsonPath('role','cashier');
    }

    public function test_customer_can_track_single_order_but_cannot_access_global_orders(): void
    {
        $order = \App\Models\Order::create([
            'public_id' => 'ORD-01ARZ3NDEKTSV4RRFFQ69G5FAV',
            'ticket_number' => 'T-001',
            'source' => 'Takeaway',
            'customer_name' => 'Budi',
            'status' => 'COOKING',
            'payment_method' => 'qris',
            'payment_status' => 'PENDING',
            'total_amount' => 25000,
            'subtotal' => 25000,
            'service_fee' => 0,
            'tax_amount' => 0,
        ]);

        // Direct /api/orders without id is unauthorized
        $this->getJson('/api/orders')->assertUnauthorized();
        $this->getJson('/api/orders?status=active')->assertUnauthorized();

        // Only the unguessable public ID permits anonymous customer tracking.
        $this->getJson('/api/orders?id=T-001')->assertUnauthorized();
        $this->getJson('/api/orders?id='.$order->public_id)->assertOk()->assertJsonPath('ticketNumber', 'T-001');
    }

    public function test_direct_backend_cannot_read_global_orders_or_mutate_staff_resources(): void
    {
        $this->getJson('/api/orders')->assertUnauthorized();
        $this->patchJson('/api/orders', [])->assertUnauthorized();
        $this->patchJson('/api/stock', [])->assertUnauthorized();
        $this->patchJson('/api/tables', [])->assertUnauthorized();
    }
}
