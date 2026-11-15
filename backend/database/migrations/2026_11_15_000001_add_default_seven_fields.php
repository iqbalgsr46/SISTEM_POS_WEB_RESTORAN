<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel-tabel yang ditambahkan 7 default fields.
     */
    private array $tables = [
        'menu_items',
        'restaurant_tables',
        'orders',
        'order_items',
        'stocks',
        'staff_accounts',
    ];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (! Schema::hasColumn($tableName, 'CompanyCode')) {
                    $table->string('CompanyCode', 32)->default('ELON01');
                }
                if (! Schema::hasColumn($tableName, 'Status')) {
                    $table->tinyInteger('Status')->default(1)->nullable();
                }
                if (! Schema::hasColumn($tableName, 'IsDeleted')) {
                    $table->tinyInteger('IsDeleted')->default(0)->nullable();
                }
                if (! Schema::hasColumn($tableName, 'CreatedBy')) {
                    $table->string('CreatedBy', 32)->default('admin')->nullable();
                }
                if (! Schema::hasColumn($tableName, 'CreatedDate')) {
                    $table->dateTime('CreatedDate')->nullable();
                }
                if (! Schema::hasColumn($tableName, 'LastUpdatedBy')) {
                    $table->string('LastUpdatedBy', 32)->nullable();
                }
                if (! Schema::hasColumn($tableName, 'LastUpdatedDate')) {
                    $table->dateTime('LastUpdatedDate')->nullable();
                }
            });

            // Sinkronisasi data awal yang sudah ada di database
            $now = now();
            $updatePayload = [
                'CompanyCode' => 'ELON01',
                'IsDeleted' => 0,
                'CreatedBy' => 'admin',
                'CreatedDate' => $now,
                'LastUpdatedBy' => 'admin',
                'LastUpdatedDate' => $now,
            ];

            // Hanya set Status tinyint jika tabel bukan pemilik domain status string (seperti orders, tables, staff)
            if (! in_array($tableName, ['restaurant_tables', 'orders', 'staff_accounts'], true)) {
                $updatePayload['Status'] = 1;
            }

            DB::table($tableName)->whereNull('CreatedDate')->update($updatePayload);
        }

        // Sinkronisasi data arsip / soft-deleted jika ada
        if (Schema::hasColumn('menu_items', 'deleted_at')) {
            DB::table('menu_items')->whereNotNull('deleted_at')->update([
                'IsDeleted' => 1,
                'Status' => 0,
            ]);
        }

        if (Schema::hasColumn('restaurant_tables', 'deleted_at')) {
            DB::table('restaurant_tables')->whereNotNull('deleted_at')->update([
                'IsDeleted' => 1,
                'Status' => 0,
            ]);
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $columns = ['CompanyCode', 'IsDeleted', 'CreatedBy', 'CreatedDate', 'LastUpdatedBy', 'LastUpdatedDate'];
                if (! in_array($tableName, ['restaurant_tables', 'orders', 'staff_accounts'], true)) {
                    $columns[] = 'Status';
                }
                $existing = array_filter($columns, fn ($col) => Schema::hasColumn($tableName, $col));
                if (! empty($existing)) {
                    $table->dropColumn($existing);
                }
            });
        }
    }
};
