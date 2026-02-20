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
        Schema::table('free_usages', function (Blueprint $table) {
            $table->unsignedInteger('bg_removal_count')->default(0)->after('images_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('free_usages', function (Blueprint $table) {
            $table->dropColumn('bg_removal_count');
        });
    }
};
