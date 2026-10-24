<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_tables', function (Blueprint $table) {
            $table->id();
            $table->string('number', 3)->unique();
            $table->string('status', 20)->default('available');
            $table->string('active_ticket')->nullable();
            $table->timestamp('occupied_at')->nullable();
            $table->timestamps();
        });

        Schema::create('stocks', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->string('name');
            $table->string('category');
            $table->boolean('available')->default(true);
            $table->timestamps();
        });

        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('channel', 20);
            $table->string('code', 80);
            $table->string('stock_id', 80);
            $table->foreign('stock_id')->references('id')->on('stocks')->restrictOnDelete();
            $table->string('name');
            $table->string('category_id', 80);
            $table->string('category_title');
            $table->unsignedInteger('price');
            $table->string('station', 20);
            $table->unsignedInteger('sort_order')->default(0);
            $table->json('details')->nullable();
            $table->timestamps();
            $table->unique(['channel', 'code']);
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 40)->unique();
            $table->string('ticket_number')->nullable()->unique();
            $table->string('source', 20);
            $table->foreignId('restaurant_table_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('customer_name', 120);
            $table->string('customer_phone', 30)->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('COOKING');
            $table->string('payment_method', 20);
            $table->string('payment_status', 20)->default('PENDING');
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('service_fee')->default(0);
            $table->unsignedInteger('tax_amount')->default(0);
            $table->unsignedInteger('total_amount');
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_item_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->unsignedSmallInteger('quantity');
            $table->unsignedInteger('unit_price');
            $table->string('station', 20);
            $table->boolean('ready')->default(false);
            $table->json('selected_variants')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('stocks');
        Schema::dropIfExists('restaurant_tables');
    }
};
