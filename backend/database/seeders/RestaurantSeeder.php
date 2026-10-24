<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\RestaurantTable;
use App\Models\Stock;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = json_decode(file_get_contents(database_path('seeders/data/menu.json')), true, flags: JSON_THROW_ON_ERROR);

        DB::transaction(function () use ($catalog) {
            foreach (range(1, 16) as $number) {
                RestaurantTable::firstOrCreate(['number' => str_pad((string) $number, 2, '0', STR_PAD_LEFT)]);
            }

            foreach ($catalog as $item) {
                Stock::firstOrCreate(['id' => $item['stock_id']], [
                    'name' => $item['name'],
                    'category' => $item['category_title'],
                    'available' => true,
                ]);
                // Re-running seeds never overwrites edited prices or operational stock.
                MenuItem::firstOrCreate(['channel' => $item['channel'], 'code' => $item['code']], $item);
            }
        });
    }
}
