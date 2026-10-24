<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\RestaurantTable;
use App\Models\Stock;
use Database\Seeders\RestaurantSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RestaurantApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RestaurantSeeder::class);
    }

    private function payload(array $overrides = []): array
    {
        return array_replace([
            'source' => 'Dine-In',
            'tableNumber' => 'Meja 07',
            'customerName' => 'Pelanggan Test',
            'paymentMethod' => 'qris',
            'items' => [['menu_item_id' => 'mie-gacoan', 'quantity' => 2, 'selected_variants' => ['Level 2']]],
        ], $overrides);
    }

    public function test_order_uses_database_prices_and_pending_payment(): void
    {
        $payload = $this->payload(['totalAmount' => 1, 'paymentStatus' => 'PAID']);
        $payload['items'][0]['unit_price'] = 1;
        $payload['items'][0]['ready'] = true;
        $order = $this->postJson('/api/orders', $payload)->assertCreated()
            ->assertJsonPath('totalAmount', 20910)
            ->assertJsonPath('paymentStatus', 'PENDING')
            ->assertJsonPath('items.0.price', 10455)
            ->assertJsonPath('items.0.ready', false)
            ->assertJsonPath('tableNumber', '07')->json();

        $this->assertDatabaseHas('orders', ['public_id' => $order['id'], 'total_amount' => 20910]);
        $this->assertDatabaseHas('restaurant_tables', ['number' => '07', 'status' => 'occupied', 'active_ticket' => $order['ticketNumber']]);
        $this->getJson('/api/orders?id='.$order['ticketNumber'])->assertOk()->assertJsonPath('id', $order['id']);
        $this->getJson('/api/orders?status=active')->assertOk()->assertJsonCount(1);
    }

    public function test_each_channel_uses_its_catalog_and_fees(): void
    {
        $cases = [
            ['Takeaway', 'mie-gacoan', 15000, 0, 0, 'T-'],
            ['Kios Lobby', 'mie-gacoan', 10455, 0, 1046, 'K-'],
            ['Kasir Fisik', 'mie-1', 15000, 2000, 0, 'C-'],
        ];
        foreach ($cases as [$source, $code, $price, $fee, $tax, $prefix]) {
            $order = $this->postJson('/api/orders', $this->payload([
                'source' => $source, 'tableNumber' => null,
                'items' => [['menu_item_id' => $code, 'qty' => 1]],
            ]))->assertCreated()->assertJsonPath('subtotal', $price)
                ->assertJsonPath('serviceFee', $fee)->assertJsonPath('taxAmount', $tax)
                ->assertJsonPath('totalAmount', $price + $fee + $tax)->json();
            $this->assertStringStartsWith($prefix, $order['ticketNumber']);
        }
    }

    public function test_unknown_menu_and_sold_out_menu_leave_no_partial_order(): void
    {
        $this->postJson('/api/orders', $this->payload([
            'items' => [['menu_item_id' => 'mie-gacoan', 'qty' => 1], ['menu_item_id' => 'missing', 'qty' => 1]],
        ]))->assertUnprocessable()->assertJsonValidationErrors('items');

        $this->patchJson('/api/stock', ['id' => 'mie-gacoan', 'available' => false])->assertOk();
        $this->postJson('/api/orders', $this->payload())->assertUnprocessable();
        $this->postJson('/api/orders', $this->payload([
            'source' => 'Kasir Fisik', 'items' => [['menu_item_id' => 'mie-1', 'qty' => 1]],
        ]))->assertUnprocessable();

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertDatabaseHas('restaurant_tables', ['number' => '07', 'status' => 'available']);
    }

    public function test_invalid_payloads_are_rejected(): void
    {
        foreach ([[], null, 'invalid', [['menu_item_id' => 'mie-gacoan', 'qty' => 0]], [['menu_item_id' => 'mie-gacoan', 'qty' => -1]]] as $items) {
            $this->postJson('/api/orders', $this->payload(['items' => $items]))->assertUnprocessable();
        }
        $this->postJson('/api/orders', $this->payload(['tableNumber' => null]))->assertUnprocessable();
        $this->postJson('/api/orders', $this->payload(['tableNumber' => '999']))->assertUnprocessable();
        $this->postJson('/api/orders', $this->payload(['source' => 'invalid']))->assertUnprocessable();
        $this->postJson('/api/orders', $this->payload(['paymentMethod' => []]))->assertUnprocessable();
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_kitchen_updates_only_readiness_and_order_status(): void
    {
        $order = $this->postJson('/api/orders', $this->payload())->json();
        $item = $order['items'][0];
        $this->patchJson('/api/orders', ['id' => $order['id'], 'items' => [
            [...$item, 'ready' => true, 'price' => 1, 'qty' => 99],
        ]])->assertOk()->assertJsonPath('items.0.ready', true)
            ->assertJsonPath('items.0.price', 10455)->assertJsonPath('items.0.qty', 2);

        $this->patchJson('/api/orders', ['id' => $order['id'], 'status' => 'COMPLETED'])->assertUnprocessable();
        $this->patchJson('/api/orders', ['id' => $order['id'], 'status' => 'READY'])->assertOk();
        $this->patchJson('/api/orders', ['id' => $order['id'], 'status' => 'COMPLETED'])->assertOk();
        $this->patchJson('/api/orders', ['id' => $order['id'], 'status' => 'COOKING'])->assertUnprocessable();
        $this->patchJson('/api/orders', ['id' => $order['id'], 'items' => [['id' => $item['id'], 'ready' => false]]])->assertUnprocessable();
        $this->getJson('/api/orders?status=active')->assertJsonCount(0);
        $this->assertDatabaseHas('restaurant_tables', ['number' => '07', 'status' => 'cleaning']);
    }

    public function test_items_cannot_be_moved_between_orders_and_updates_roll_back(): void
    {
        $first = $this->postJson('/api/orders', $this->payload())->json();
        $second = $this->postJson('/api/orders', $this->payload())->json();
        $this->patchJson('/api/orders', ['id' => $first['id'], 'items' => [
            ['id' => $first['items'][0]['id'], 'ready' => true],
            ['id' => $second['items'][0]['id'], 'ready' => true],
        ]])->assertUnprocessable();
        $this->assertDatabaseHas('order_items', ['id' => $first['items'][0]['id'], 'ready' => false]);
    }

    public function test_table_stays_occupied_until_all_orders_are_closed(): void
    {
        $first = $this->postJson('/api/orders', $this->payload())->json();
        $second = $this->postJson('/api/orders', $this->payload())->json();
        $this->assertNotEquals($first['ticketNumber'], $second['ticketNumber']);
        $tableId = RestaurantTable::where('number', '07')->value('id');
        $this->patchJson('/api/tables', ['id' => $tableId, 'status' => 'available'])->assertUnprocessable();
        $this->patchJson('/api/orders', ['id' => $first['id'], 'status' => 'CANCELLED'])->assertOk();
        $this->assertDatabaseHas('restaurant_tables', ['number' => '07', 'status' => 'occupied', 'active_ticket' => $second['ticketNumber']]);
        $this->patchJson('/api/orders', ['id' => $second['id'], 'status' => 'CANCELLED'])->assertOk();
        $this->postJson('/api/orders', $this->payload())->assertUnprocessable();
        $this->patchJson('/api/tables', ['id' => $tableId, 'status' => 'available'])->assertOk()->assertJsonPath('ticket', null);
    }

    public function test_missing_records_and_invalid_updates_return_expected_errors(): void
    {
        $this->getJson('/api/orders?id=missing')->assertNotFound();
        $this->patchJson('/api/orders', ['id' => 'missing', 'status' => 'READY'])->assertNotFound();
        $this->patchJson('/api/orders', ['id' => 'missing'])->assertUnprocessable();
        $this->patchJson('/api/orders', ['id' => 'missing', 'status' => 'BAD'])->assertUnprocessable();
        $this->patchJson('/api/stock', ['id' => 'missing', 'available' => true])->assertNotFound();
        $this->patchJson('/api/stock', ['id' => 'mie-gacoan'])->assertUnprocessable();
        $this->patchJson('/api/tables', ['id' => 999, 'status' => 'available'])->assertNotFound();
        $this->patchJson('/api/tables', ['id' => 1, 'status' => 'BAD'])->assertUnprocessable();
    }

    public function test_catalog_and_stock_responses_match_frontend_contract(): void
    {
        $menu = $this->getJson('/api/menu?channel=dine_in')->assertOk()->json();
        $this->assertSame('gacoan-combat', $menu[0]['id']);
        $this->assertSame('combat-a', $menu[0]['items'][0]['id']);
        $this->assertTrue($menu[0]['items'][0]['available']);
        $this->getJson('/api/tables')->assertOk()->assertJsonCount(16)->assertJsonPath('0.number', '01');
        $this->getJson('/api/stock')->assertOk()->assertJsonStructure([['id', 'name', 'category', 'available']]);
        $this->getJson('/api/menu?channel=invalid')->assertUnprocessable();
    }

    public function test_seeder_is_repeatable_without_resetting_operational_data(): void
    {
        $count = MenuItem::count();
        Stock::findOrFail('mie-gacoan')->update(['available' => false]);
        MenuItem::where('channel', 'dine_in')->where('code', 'mie-gacoan')->update(['price' => 12000]);
        $this->seed(RestaurantSeeder::class);
        $this->assertSame($count, MenuItem::count());
        $this->assertDatabaseHas('stocks', ['id' => 'mie-gacoan', 'available' => false]);
        $this->assertDatabaseHas('menu_items', ['channel' => 'dine_in', 'code' => 'mie-gacoan', 'price' => 12000]);
    }

    public function test_operational_api_is_disabled_in_production_until_staff_auth_is_ready(): void
    {
        $this->app->instance('env', 'production');
        $this->getJson('/api/orders')->assertServiceUnavailable();
        $this->postJson('/api/orders', $this->payload())->assertServiceUnavailable();
        $this->assertSame(0, Order::count());
    }
}
