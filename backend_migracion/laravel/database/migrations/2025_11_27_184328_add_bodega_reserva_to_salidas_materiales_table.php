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
        Schema::table('salidas_materiales', function (Blueprint $table) {
            $table->integer('id_bodega')->nullable()->after('area');
            $table->integer('id_reserva')->nullable()->after('id_bodega');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salidas_materiales', function (Blueprint $table) {
            $table->dropColumn(['id_bodega', 'id_reserva']);
        });
    }
};
