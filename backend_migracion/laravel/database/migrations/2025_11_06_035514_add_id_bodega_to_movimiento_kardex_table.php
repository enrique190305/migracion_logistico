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
        Schema::table('movimiento_kardex', function (Blueprint $table) {
            $table->integer('id_bodega')->unsigned()->nullable()->after('proyecto');
            $table->foreign('id_bodega')->references('id_bodega')->on('bodega')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('movimiento_kardex', function (Blueprint $table) {
            $table->dropForeign(['id_bodega']);
            $table->dropColumn('id_bodega');
        });
    }
};
