<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use App\Models\RestaurantTable;
use App\Models\StaffAccount;
use App\Models\Stock;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArchiveTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['staff.secret' => str_repeat('t', 64)]);
        StaffAccount::create(['google_sub' => 'admin-sub', 'email' => 'admin@example.com', 'name' => 'Admin', 'status' => 'approved', 'role' => 'admin']);
    }

    private function signed(string $method, string $uri, array $body = [], string $sub = 'admin-sub'): array
    {
        $payload = rtrim(strtr(base64_encode(json_encode(['purpose' => 'staff', 'sub' => $sub, 'exp' => time() + 30, 'method' => $method, 'uri' => $uri, 'body' => hash('sha256', json_encode($body))])), '+/', '-_'), '=');
        return ['X-Staff-Identity' => $payload.'.'.hash_hmac('sha256', $payload, config('staff.secret'))];
    }

    public function test_archived_items_can_be_listed_restored_and_purged(): void
    {
        $stock = Stock::create(['id' => 'stk-1', 'name' => 'Test Item', 'category' => 'Mie', 'available' => true]);
        $menu = MenuItem::create([
            'channel' => 'dine_in',
            'code' => 'code-1',
            'stock_id' => $stock->id,
            'name' => 'Mie Uji Coba',
            'category_id' => 'mie',
            'category_title' => 'Mie',
            'price' => 15000,
            'station' => 'kitchen',
            'sort_order' => 1,
        ]);

        $table = RestaurantTable::create(['number' => '99', 'status' => 'available']);

        // 1. Soft delete
        $menu->delete();
        $table->delete();

        // 2. Cek apakah masuk ke daftar arsip
        $response = $this->getJson('/api/archive', $this->signed('GET', '/api/archive'));
        $response->assertOk();
        $response->assertJsonCount(1, 'menus');
        $response->assertJsonCount(1, 'tables');
        $this->assertEquals('Mie Uji Coba', $response->json('menus.0.name'));
        $this->assertEquals('Meja 99', $response->json('tables.0.name'));

        // 3. Restore menu
        $bodyRestore = ['type' => 'menu', 'id' => $menu->id];
        $restoreMenu = $this->postJson('/api/archive/restore', $bodyRestore, $this->signed('POST', '/api/archive/restore', $bodyRestore));
        $restoreMenu->assertOk();
        $this->assertFalse($menu->fresh()->trashed());

        // 4. Force delete (purge) meja
        $bodyPurge = ['type' => 'table', 'id' => $table->id];
        $purgeTable = $this->postJson('/api/archive/purge', $bodyPurge, $this->signed('POST', '/api/archive/purge', $bodyPurge));
        $purgeTable->assertOk();
        $this->assertDatabaseMissing('restaurant_tables', ['id' => $table->id]);
    }
}
