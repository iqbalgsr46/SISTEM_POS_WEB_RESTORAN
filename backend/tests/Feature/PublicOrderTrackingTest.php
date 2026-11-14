<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\StaffAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PublicOrderTrackingTest extends TestCase
{
    use RefreshDatabase;

    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        // phpunit.xml forces an isolated in-memory SQLite database.
        $this->assertSame('sqlite', config('database.default'));
        $this->assertSame(':memory:', config('database.connections.sqlite.database'));
        config(['staff.secret' => str_repeat('p', 64)]);
        $this->order = Order::create([
            'public_id' => 'ORD-'.Str::ulid(),
            'ticket_number' => 'T-001',
            'source' => 'Takeaway',
            'customer_name' => 'Tracking Customer',
            'status' => 'COOKING',
            'payment_method' => 'qris',
            'payment_status' => 'PENDING',
            'total_amount' => 25000,
            'subtotal' => 25000,
            'service_fee' => 0,
            'tax_amount' => 0,
        ]);
    }

    private function staff(string $status = 'approved', ?string $role = 'cashier'): StaffAccount
    {
        return StaffAccount::create([
            'google_sub' => 'tracking-staff',
            'email' => 'tracking-staff@example.com',
            'name' => 'Tracking Staff',
            'status' => $status,
            'role' => $role,
        ]);
    }

    private function signed(string $uri): array
    {
        $payload = rtrim(strtr(base64_encode(json_encode([
            'purpose' => 'staff',
            'sub' => 'tracking-staff',
            'exp' => time() + 30,
            'method' => 'GET',
            'uri' => $uri,
            'body' => hash('sha256', json_encode([])),
        ])), '+/', '-_'), '=');

        return ['X-Staff-Identity' => $payload.'.'.hash_hmac('sha256', $payload, config('staff.secret'))];
    }

    public function test_anonymous_predictable_ticket_and_numeric_ids_are_rejected(): void
    {
        foreach (['T-001', 'T-999', (string) $this->order->id, 'ORD-not-a-ulid'] as $id) {
            $this->getJson('/api/orders?id='.$id)->assertUnauthorized();
        }
        $this->getJson('/api/orders')->assertUnauthorized();
        $this->getJson('/api/orders?status=active')->assertUnauthorized();
        $this->getJson('/api/orders?id[]=T-001')->assertUnauthorized();
    }

    public function test_anonymous_public_id_returns_only_the_matching_order(): void
    {
        $this->getJson('/api/orders?id='.$this->order->public_id)
            ->assertOk()
            ->assertJsonPath('id', $this->order->public_id)
            ->assertJsonPath('ticketNumber', 'T-001');
    }

    public function test_unknown_public_id_is_not_found_and_never_matches_a_ticket(): void
    {
        $unknown = 'ORD-'.Str::ulid();
        $this->getJson('/api/orders?id='.$unknown)->assertNotFound();
        $this->order->update(['ticket_number' => $unknown]);
        $this->getJson('/api/orders?id='.$unknown)->assertNotFound();
        $this->assertDatabaseHas('orders', ['id' => $this->order->id, 'public_id' => $this->order->public_id]);
    }

    public function test_approved_signed_staff_can_lookup_tickets_and_unknown_tickets_are_not_found(): void
    {
        $this->staff();
        $uri = '/api/orders?id=T-001';
        $this->getJson($uri, $this->signed($uri))->assertOk()->assertJsonPath('id', $this->order->public_id);
        $uri = '/api/orders?id=T-999';
        $this->getJson($uri, $this->signed($uri))->assertNotFound();
    }

    public function test_revoked_staff_cannot_reuse_a_signed_ticket_lookup(): void
    {
        $staff = $this->staff();
        $uri = '/api/orders?id=T-001';
        $headers = $this->signed($uri);
        $this->getJson($uri, $headers)->assertOk();
        $staff->update(['status' => 'disabled']);
        $this->getJson($uri, $headers)->assertForbidden();
        $this->assertDatabaseCount('orders', 1);
    }

    public function test_staff_ticket_lookup_requires_a_valid_signature_and_approved_database_identity(): void
    {
        $uri = '/api/orders?id=T-001';
        $this->getJson($uri, ['X-Staff-Identity' => 'fabricated.signature'])->assertUnauthorized();
        $this->getJson($uri, $this->signed($uri))->assertForbidden();
        $staff = $this->staff('pending', null);
        $this->getJson($uri, $this->signed($uri))->assertForbidden();
        $staff->update(['status' => 'approved', 'role' => null]);
        $this->getJson($uri, $this->signed($uri))->assertForbidden();
    }

    public function test_stale_staff_sessions_can_track_public_ids_but_cannot_bypass_account_auth(): void
    {
        $staff = $this->staff('pending', null);
        $publicUri = '/api/orders?id='.$this->order->public_id;
        $accountUri = '/api/accounts?id='.$this->order->public_id;
        foreach (['pending', 'disabled'] as $status) {
            $staff->update(['status' => $status]);
            $this->getJson($publicUri, $this->signed($publicUri))->assertOk()->assertJsonPath('id', $this->order->public_id);
            $this->getJson($accountUri, $this->signed($accountUri))->assertForbidden();
            $this->getJson('/api/orders', $this->signed('/api/orders'))->assertForbidden();
        }
        $this->getJson($accountUri)->assertUnauthorized();
        $this->patchJson('/api/orders?id='.$this->order->public_id, [])->assertUnauthorized();
    }
}
