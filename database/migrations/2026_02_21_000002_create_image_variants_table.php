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
        Schema::create('image_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('image_id')
                ->constrained('converted_images')
                ->cascadeOnDelete();

            // Variant type: thumbnail, small, medium, large, xlarge
            $table->string('size_name', 20);

            // Breakpoint in pixels
            $table->unsignedSmallInteger('breakpoint');

            // Target width
            $table->unsignedInteger('width');

            // Actual dimensions after conversion
            $table->unsignedInteger('actual_width')->nullable();
            $table->unsignedInteger('actual_height')->nullable();

            // File info
            $table->string('path');
            $table->string('format', 10);
            $table->unsignedBigInteger('file_size')->nullable();

            $table->timestamps();

            // Composite unique constraint
            $table->unique(['image_id', 'size_name', 'format']);

            // Index for efficient queries
            $table->index(['image_id', 'breakpoint']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('image_variants');
    }
};
