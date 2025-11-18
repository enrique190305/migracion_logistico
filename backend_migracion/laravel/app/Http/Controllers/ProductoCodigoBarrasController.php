<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductoCodigoBarrasController extends Controller
{
    /**
     * Obtener productos NO consumibles
     */
    public function obtenerProductos()
    {
        try {
            $productos = DB::table('producto')
                ->select(
                    'codigo_producto as codigo',
                    'descripcion as nombre',
                    'tipo_producto as tipo',
                    'consumible',
                    'unidad'
                )
                ->where('consumible', '=', 'NO')
                ->orderBy('descripcion', 'ASC')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $productos
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener productos: ' . $e->getMessage()
            ], 500);
        }
    }
}
