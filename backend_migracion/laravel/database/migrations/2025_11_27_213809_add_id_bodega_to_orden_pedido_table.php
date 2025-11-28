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
        Schema::table('orden_pedido', function (Blueprint $table) {
            // Agregar columna id_bodega después de id_empresa (tipo INT para coincidir con bodega)
            $table->unsignedInteger('id_bodega')->nullable()->after('id_empresa');
            
            // Agregar foreign key a tabla bodega
            $table->foreign('id_bodega')
                  ->references('id_bodega')
                  ->on('bodega')
                  ->onDelete('restrict');
            
            // Hacer id_proyecto opcional (para compatibilidad con datos existentes)
            // Comentado por ahora para evitar problemas con datos existentes
            // $table->unsignedBigInteger('id_proyecto')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orden_pedido', function (Blueprint $table) {
            // Eliminar foreign key y columna
            $table->dropForeign(['id_bodega']);
            $table->dropColumn('id_bodega');
        });
    }
};
