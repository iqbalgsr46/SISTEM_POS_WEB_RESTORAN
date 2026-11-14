<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_items', fn (Blueprint $table) => $table->softDeletes());
        Schema::table('restaurant_tables', fn (Blueprint $table) => $table->softDeletes());
        // A single locked row serializes number allocation, including an empty restaurant.
        Schema::create('restaurant_sequences', function (Blueprint $table) {
            $table->string('name')->primary();
            $table->unsignedInteger('value')->default(0);
        });
        DB::table('restaurant_sequences')->insert(['name' => 'table', 'value' => 0]);
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_sequences');
        Schema::table('restaurant_tables', fn (Blueprint $table) => $table->dropSoftDeletes());
        Schema::table('menu_items', fn (Blueprint $table) => $table->dropSoftDeletes());
    }
};
