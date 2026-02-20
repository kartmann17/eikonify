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
        Schema::create('conversion_batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('session_id')->index();
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->json('settings'); // format, quality, dimensions
            $table->json('keywords')->nullable();
            $table->unsignedInteger('total_images')->default(0);
            $table->unsignedInteger('processed_images')->default(0);
            $table->timestamp('expires_at')->index();
            $table->timestamps();

            $table->index(['session_id', 'status']);
            $table->index(['expires_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversion_batches');
    }
};
