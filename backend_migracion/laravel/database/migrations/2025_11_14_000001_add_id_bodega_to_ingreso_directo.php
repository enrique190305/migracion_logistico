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
        Schema::table('ingreso_directo', function (Blueprint $table) {
            // Agregar campo id_bodega después de id_proveedor
            $table->unsignedBigInteger('id_bodega')->after('id_proveedor');
            
            // Crear índice
            $table->index('id_bodega', 'fk_ingreso_directo_bodega');
            
            // Agregar clave foránea
            $table->foreign('id_bodega', 'fk_ingreso_directo_bodega')
                  ->references('id_bodega')
                  ->on('bodega')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ingreso_directo', function (Blueprint $table) {
            // Eliminar clave foránea
            $table->dropForeign('fk_ingreso_directo_bodega');
            
            // Eliminar índice
            $table->dropIndex('fk_ingreso_directo_bodega');
            
            // Eliminar columna
            $table->dropColumn('id_bodega');
        });
    }
};
