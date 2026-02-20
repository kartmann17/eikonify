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
        Schema::create('free_usages', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45);
            $table->string('fingerprint')->nullable();
            $table->integer('images_count')->default(0);
            $table->date('date');
            $table->timestamps();

            $table->unique(['ip_address', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('free_usages');
    }
};
