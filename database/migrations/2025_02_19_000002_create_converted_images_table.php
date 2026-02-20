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
        Schema::create('converted_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('batch_id')
                ->constrained('conversion_batches')
                ->cascadeOnDelete();

            // Original file info
            $table->string('original_name');
            $table->string('original_path');
            $table->string('original_format', 10);
            $table->unsignedBigInteger('original_size');
            $table->unsignedInteger('original_width')->nullable();
            $table->unsignedInteger('original_height')->nullable();

            // Converted file info
            $table->string('converted_path')->nullable();
            $table->string('converted_format', 10)->nullable();
            $table->unsignedBigInteger('converted_size')->nullable();
            $table->unsignedInteger('converted_width')->nullable();
            $table->unsignedInteger('converted_height')->nullable();

            // SEO metadata
            $table->string('seo_filename')->nullable();
            $table->string('alt_text', 500)->nullable();
            $table->string('title_text', 200)->nullable();
            $table->text('meta_description')->nullable();

            // Status
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->text('error_message')->nullable();

            $table->timestamps();

            $table->index(['batch_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('converted_images');
    }
};
