<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Table pour tracker l'usage quotidien/mensuel
        Schema::create('usage_tracking', function (Blueprint $table) {
            $table->id();
            $table->string('fingerprint', 64)->index(); // Hash IP + User-Agent
            $table->date('date')->index();
            $table->unsignedInteger('images_count')->default(0);
            $table->timestamps();

            $table->unique(['fingerprint', 'date']);
        });

        // Table pour les clés API Pro
        Schema::create('api_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key', 64)->unique();
            $table->string('name');
            $table->string('email')->nullable();
            $table->enum('plan', ['free', 'pro'])->default('free');
            $table->unsignedInteger('monthly_quota')->default(2000);
            $table->unsignedInteger('monthly_used')->default(0);
            $table->timestamp('billing_cycle_start')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_keys');
        Schema::dropIfExists('usage_tracking');
    }
};
