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
        Schema::create('image_favicons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('image_id')->constrained('converted_images')->cascadeOnDelete();
            $table->string('size_name', 50);      // 'favicon-16x16', 'apple-touch-icon'
            $table->unsignedSmallInteger('size'); // 16, 32, 180, 192, 512
            $table->string('path');
            $table->string('format', 10)->default('png');
            $table->unsignedBigInteger('file_size')->nullable();
            $table->timestamps();

            $table->unique(['image_id', 'size_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('image_favicons');
    }
};
