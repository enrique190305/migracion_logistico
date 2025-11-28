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
        // Agregar cantidad_recibida a detalle_oc
        Schema::table('detalle_oc', function (Blueprint $table) {
            $table->decimal('cantidad_recibida', 18, 2)->default(0)->after('cantidad');
        });

        // Agregar cantidad_recibida a detalle_os
        Schema::table('detalle_os', function (Blueprint $table) {
            $table->decimal('cantidad_recibida', 18, 2)->default(0)->after('cantidad');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detalle_oc', function (Blueprint $table) {
            $table->dropColumn('cantidad_recibida');
        });

        Schema::table('detalle_os', function (Blueprint $table) {
            $table->dropColumn('cantidad_recibida');
        });
    }
};
