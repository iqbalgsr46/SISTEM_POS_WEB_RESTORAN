<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use App\Models\RestaurantTable;
use App\Models\StaffAccount;
use App\Models\Stock;
use Database\Seeders\RestaurantSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['staff.secret' => str_repeat('t', 64)]);
        foreach (['admin', 'cashier', 'kitchen'] as $role) {
            StaffAccount::create(['google_sub' => $role, 'email' => $role.'@example.com', 'name' => $role, 'status' => 'approved', 'role' => $role]);
        }
    }

    private function signed(string $method, string $uri, array $body = [], string $sub = 'admin', string $purpose = 'staff'): array
    {
        $payload = rtrim(strtr(base64_encode(json_encode(['purpose' => $purpose, 'sub' => $sub, 'exp' => time() + 30, 'method' => $method, 'uri' => $uri, 'body' => hash('sha256', json_encode($body))])), '+/', '-_'), '=');
        return ['X-Staff-Identity' => $payload.'.'.hash_hmac('sha256', $payload, config('staff.secret'))];
    }

    private function menu(array $overrides = []): array
    {
        return array_replace(['channel' => 'dine_in', 'name' => 'Menu Baru', 'category_id' => 'mie', 'category_title' => 'Mie', 'price' => 24000, 'station' => 'kitchen', 'image' => '/images/menu/elon-dark-matter.png'], $overrides);
    }

    private function createMenu(array $overrides = []): array
    {
        $body = $this->menu($overrides);
        return $this->postJson('/api/menu', $body, $this->signed('POST', '/api/menu', $body))->assertCreated()->json();
    }

    private function order(string $code, string $source = 'Takeaway', ?string $number = null): array
    {
        return $this->postJson('/api/orders', ['source' => $source, 'tableNumber' => $number, 'paymentMethod' => 'qris', 'items' => [['menu_item_id' => $code, 'quantity' => 2, 'unit_price' => 1]]])->assertCreated()->json();
    }

    public function test_admin_menu_create_edit_archive_preserves_shared_stock_history_and_server_price(): void
    {
        $item = $this->createMenu(['channel' => 'takeaway']);
        $dish = MenuItem::findOrFail($item['adminId']);
        $dish->update(['details' => [...$dish->details, 'variants' => ['Level 1', 'Level 2']]]);
        $copy = $dish->replicate();
        $copy->channel = 'pos';
        $copy->save();
        $order = $this->order($item['id']);
        $this->assertSame(48000, $order['subtotal']);
        $this->assertSame('PENDING', $order['paymentStatus']);
        $body = ['id' => $item['adminId'], 'name' => 'Menu Diubah', 'price' => 30000, 'description' => 'Deskripsi'];
        $this->patchJson('/api/menu', $body, $this->signed('PATCH', '/api/menu', $body))->assertOk()->assertJsonPath('price', 30000)->assertJsonPath('variants.0', 'Level 1');
        $this->getJson('/api/menu?channel=takeaway')->assertOk()->assertJsonPath('0.items.0.name', 'Menu Diubah');
        $this->assertSame(60000, $this->order($item['id'])['subtotal']);
        $body = ['id' => $item['adminId']];
        $this->deleteJson('/api/menu', $body, $this->signed('DELETE', '/api/menu', $body))->assertOk();
        $this->assertSoftDeleted('menu_items', ['id' => $item['adminId']]);
        $this->assertDatabaseHas('stocks', ['id' => $item['stockId'], 'available' => true]);
        $this->getJson('/api/menu?channel=takeaway')->assertOk()->assertExactJson([]);
        $this->getJson('/api/menu?channel=pos')->assertOk()->assertJsonCount(1, '0.items');
        $this->getJson('/api/orders?id='.$order['id'])->assertOk()->assertJsonPath('items.0.price', 24000)->assertJsonPath('items.0.name', '2x Menu Baru');
        $this->postJson('/api/orders', ['source' => 'Takeaway', 'paymentMethod' => 'qris', 'items' => [['menu_item_id' => $item['id'], 'quantity' => 1]]])->assertUnprocessable();
    }

    public function test_catalog_mutations_require_admin_and_reject_invalid_prices_images_and_fields(): void
    {
        $body = $this->menu();
        $this->postJson('/api/menu', $body)->assertUnauthorized();
        $this->postJson('/api/menu', $body, $this->signed('POST', '/api/menu', $body, 'cashier'))->assertForbidden();
        foreach ([['price' => -1], ['price' => 2.5], ['price' => 10000001], ['station' => 'other'], ['image' => 'https://example.com/x.png'], ['image' => '/images/../secret.png'], ['image' => '/images/not-found.png'], ['name' => '   ']] as $invalid) {
            $body = $this->menu($invalid);
            $this->postJson('/api/menu', $body, $this->signed('POST', '/api/menu', $body))->assertUnprocessable();
        }
        $this->assertDatabaseCount('menu_items', 0);
        $this->assertDatabaseCount('stocks', 0);
        $body = $this->menu(['stock_id' => 'injected', 'code' => 'injected', 'details' => ['price' => 1]]);
        $response = $this->postJson('/api/menu', $body, $this->signed('POST', '/api/menu', $body))->assertCreated();
        $this->assertNotSame('injected', $response->json('stockId'));
        $this->assertSame(24000, $response->json('price'));
    }

    public function test_tables_allocate_without_reusing_archived_numbers_and_keep_order_history(): void
    {
        $menu = $this->createMenu();
        $this->postJson('/api/tables', [], $this->signed('POST', '/api/tables'))->assertCreated()->assertJsonPath('number', '01');
        $table = RestaurantTable::firstOrFail();
        $order = $this->order($menu['id'], 'Dine-In', '01');
        $body = ['id' => $table->id];
        $this->deleteJson('/api/tables', $body, $this->signed('DELETE', '/api/tables', $body))->assertUnprocessable();
        $cancel = ['id' => $order['id'], 'status' => 'CANCELLED'];
        $this->patchJson('/api/orders', $cancel, $this->signed('PATCH', '/api/orders', $cancel))->assertOk();
        $this->deleteJson('/api/tables', $body, $this->signed('DELETE', '/api/tables', $body))->assertOk();
        $this->getJson('/api/tables')->assertOk()->assertExactJson([]);
        $this->getJson('/api/orders?id='.$order['id'])->assertOk()->assertJsonPath('tableNumber', '01');
        // Retrying cancellation after archiving its table remains idempotent.
        $this->patchJson('/api/orders', $cancel, $this->signed('PATCH', '/api/orders', $cancel))->assertOk();
        $this->postJson('/api/tables', [], $this->signed('POST', '/api/tables'))->assertCreated()->assertJsonPath('number', '02');
        $this->postJson('/api/orders', ['source' => 'Dine-In', 'tableNumber' => '01', 'paymentMethod' => 'qris', 'items' => [['menu_item_id' => $menu['id'], 'quantity' => 1]]])->assertUnprocessable();
        $this->patchJson('/api/tables', ['id' => $table->id, 'status' => 'available'], $this->signed('PATCH', '/api/tables', ['id' => $table->id, 'status' => 'available']))->assertNotFound();
    }

    public function test_cancellation_is_admin_or_cashier_only_and_terminal_orders_cannot_reopen(): void
    {
        $menu = $this->createMenu(['channel' => 'takeaway']);
        $order = $this->order($menu['id']);
        $body = ['id' => $order['id'], 'status' => 'CANCELLED'];
        $this->patchJson('/api/orders', $body, $this->signed('PATCH', '/api/orders', $body, 'kitchen'))->assertForbidden();
        $this->patchJson('/api/orders', $body, $this->signed('PATCH', '/api/orders', $body, 'cashier'))->assertOk()->assertJsonPath('status', 'CANCELLED');
        $body['status'] = 'READY';
        $this->patchJson('/api/orders', $body, $this->signed('PATCH', '/api/orders', $body))->assertUnprocessable();
        $uri = '/api/orders?status=CANCELLED&source=Takeaway&date='.now('Asia/Jakarta')->format('Y-m-d');
        $this->getJson($uri, $this->signed('GET', $uri))->assertOk()->assertJsonCount(1);
        $this->assertDatabaseCount('order_items', 1);
    }

    public function test_revocation_blocks_existing_signed_identity_and_cannot_be_reprovisioned_or_self_removed(): void
    {
        $cashier = StaffAccount::where('google_sub', 'cashier')->firstOrFail();
        $existing = $this->signed('GET', '/api/orders', [], 'cashier');
        $this->getJson('/api/orders', $existing)->assertOk();
        $body = ['id' => $cashier->id];
        $this->deleteJson('/api/accounts', $body, $this->signed('DELETE', '/api/accounts', $body))->assertOk()->assertJsonPath('status', 'disabled');
        $this->getJson('/api/orders', $existing)->assertForbidden();
        $provision = ['sub' => 'cashier', 'email' => 'cashier@example.com', 'email_verified' => true, 'name' => 'Cashier'];
        $this->postJson('/api/auth/google', $provision, $this->signed('POST', '/api/auth/google', $provision, 'cashier', 'provision'))->assertOk()->assertJsonPath('status', 'disabled');
        $body = ['id' => StaffAccount::where('google_sub', 'admin')->value('id')];
        $this->deleteJson('/api/accounts', $body, $this->signed('DELETE', '/api/accounts', $body))->assertStatus(409);
        StaffAccount::create(['google_sub' => 'other', 'email' => 'other@example.com', 'name' => 'Other', 'status' => 'approved', 'role' => 'admin']);
        $this->deleteJson('/api/accounts', $body, $this->signed('DELETE', '/api/accounts', $body))->assertStatus(409);
        $body += ['status' => 'approved', 'role' => 'cashier'];
        $this->patchJson('/api/accounts', $body, $this->signed('PATCH', '/api/accounts', $body))->assertStatus(409);
    }

    public function test_id_query_never_bypasses_accounts_authorization_and_all_new_mutations_are_protected(): void
    {
        $this->getJson('/api/accounts?id=1')->assertUnauthorized();
        $this->getJson('/api/orders?id=')->assertUnauthorized();
        foreach (['menu', 'tables', 'accounts'] as $resource) {
            $this->deleteJson('/api/'.$resource, ['id' => 1])->assertUnauthorized();
            $this->deleteJson('/api/'.$resource, ['id' => 1], $this->signed('DELETE', '/api/'.$resource, ['id' => 1], 'cashier'))->assertForbidden();
        }
        $this->postJson('/api/tables')->assertUnauthorized();
        $this->patchJson('/api/menu', ['id' => 1])->assertUnauthorized();
    }

    public function test_reseeding_does_not_restore_archived_catalog_or_tables(): void
    {
        $this->seed(RestaurantSeeder::class);
        $menu = MenuItem::firstOrFail();
        $table = RestaurantTable::firstOrFail();
        $menu->delete();
        $table->delete();
        $count = MenuItem::withTrashed()->count();
        $this->seed(RestaurantSeeder::class);
        $this->assertSame($count, MenuItem::withTrashed()->count());
        $this->assertSoftDeleted($menu);
        $this->assertSoftDeleted($table);
    }
    public function test_shared_stock_and_full_order_lifecycle_propagate_across_all_channels(): void
    {
        $this->seed(RestaurantSeeder::class);
        // Seeded products share a stock id across all four channel-specific menus.
        $dish = MenuItem::where('channel', 'dine_in')->firstOrFail();
        $stockId = $dish->stock_id;
        $channels = ['dine_in' => 'Dine-In', 'takeaway' => 'Takeaway', 'kios' => 'Kios Lobby', 'pos' => 'Kasir Fisik'];
        $body = ['id' => $stockId, 'available' => false];
        $this->patchJson('/api/stock', $body, $this->signed('PATCH', '/api/stock', $body, 'kitchen'))->assertOk();
        foreach ($channels as $channel => $source) {
            $menu = MenuItem::where('stock_id', $stockId)->where('channel', $channel)->firstOrFail();
            $catalog = collect($this->getJson('/api/menu?channel='.$channel)->assertOk()->json())->flatMap(fn ($category) => $category['items']);
            $this->assertFalse($catalog->firstWhere('id', $menu->code)['available']);
            $payload = ['source' => $source, 'tableNumber' => $channel === 'dine_in' ? '01' : null, 'paymentMethod' => 'CASH', 'items' => [['menu_item_id' => $menu->code, 'quantity' => 1]]];
            $this->postJson('/api/orders', $payload)->assertUnprocessable();
        }
        $this->assertDatabaseCount('orders', 0);
        $body['available'] = true;
        $this->patchJson('/api/stock', $body, $this->signed('PATCH', '/api/stock', $body))->assertOk();
        foreach ($channels as $channel => $source) {
            $menu = MenuItem::where('stock_id', $stockId)->where('channel', $channel)->firstOrFail();
            $order = $this->order($menu->code, $source, '01');
            $this->assertSame($menu->station, $order['items'][0]['station']);
            $this->assertSame('PENDING', $order['paymentStatus']);
            $body = ['id' => $order['id'], 'status' => 'READY'];
            $this->patchJson('/api/orders', $body, $this->signed('PATCH', '/api/orders', $body, 'kitchen'))->assertOk()->assertJsonPath('items.0.ready', true);
            $body['status'] = 'COMPLETED';
            $this->patchJson('/api/orders', $body, $this->signed('PATCH', '/api/orders', $body, 'cashier'))->assertOk();
            $this->getJson('/api/orders?id='.$order['id'])->assertOk()->assertJsonPath('status', 'COMPLETED')->assertJsonPath('paymentStatus', 'PENDING');
            $this->assertDatabaseHas('restaurant_tables', ['number' => '01', 'status' => 'cleaning']);
            $table = RestaurantTable::where('number', '01')->firstOrFail();
            $body = ['id' => $table->id, 'status' => 'available'];
            $this->patchJson('/api/tables', $body, $this->signed('PATCH', '/api/tables', $body, 'cashier'))->assertOk();
        }
        $this->assertDatabaseCount('orders', 4);
        $this->assertDatabaseCount('order_items', 4);
    }

    public function test_admin_date_filter_matches_jakarta_calendar_boundaries(): void
    {
        $menu = $this->createMenu(['channel' => 'takeaway']);
        $before = $this->order($menu['id']);
        $included = $this->order($menu['id']);
        $after = $this->order($menu['id']);
        \App\Models\Order::where('public_id', $before['id'])->update(['created_at' => '2026-11-13 16:59:59']);
        \App\Models\Order::where('public_id', $included['id'])->update(['created_at' => '2026-11-13 17:00:00']);
        \App\Models\Order::where('public_id', $after['id'])->update(['created_at' => '2026-11-14 17:00:00']);
        $uri = '/api/orders?date=2026-11-14';
        $this->getJson($uri, $this->signed('GET', $uri))->assertOk()->assertJsonCount(1)->assertJsonPath('0.id', $included['id']);
    }

}
