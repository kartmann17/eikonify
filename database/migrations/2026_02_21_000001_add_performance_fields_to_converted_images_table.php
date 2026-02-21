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
        Schema::table('converted_images', function (Blueprint $table) {
            // BlurHash for placeholder blur effect
            $table->string('blur_hash', 100)->nullable()->after('meta_description');

            // LQIP (Low Quality Image Placeholder) - Base64 tiny image
            $table->text('lqip_data_uri')->nullable()->after('blur_hash');

            // Dominant color as hex (e.g., "#3B82F6")
            $table->string('dominant_color', 7)->nullable()->after('lqip_data_uri');

            // Color palette as JSON array of hex colors
            $table->json('color_palette')->nullable()->after('dominant_color');

            // Transparency detection
            $table->boolean('has_transparency')->default(false)->after('color_palette');

            // Aspect ratio for CLS prevention (e.g., "16:9", "4:3")
            $table->string('aspect_ratio', 10)->nullable()->after('has_transparency');

            // Indexes
            $table->index('has_transparency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('converted_images', function (Blueprint $table) {
            $table->dropIndex(['has_transparency']);
            $table->dropColumn([
                'blur_hash',
                'lqip_data_uri',
                'dominant_color',
                'color_palette',
                'has_transparency',
                'aspect_ratio',
            ]);
        });
    }
};
