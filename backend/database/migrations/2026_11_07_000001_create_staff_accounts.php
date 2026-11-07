<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void {
  Schema::create('staff_accounts', function (Blueprint $table) {
   $table->id(); $table->string('google_sub')->unique(); $table->string('email')->unique();
   $table->string('name'); $table->string('status')->default('pending'); $table->string('role')->nullable(); $table->timestamps();
  });
 }
 public function down(): void { Schema::dropIfExists('staff_accounts'); }
};
