<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BodegaStock;
use App\Models\Bodega;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BodegaStockController extends Controller
{
    /**
     * Obtener stock de una bodega específica
     * GET /api/stock/bodega/{idBodega}
     */
    public function getStockPorBodega($idBodega)
    {
        try {
            // Verificar que la bodega existe
            $bodega = Bodega::find($idBodega);
            if (!$bodega) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bodega no encontrada'
                ], 404);
            }

            // Obtener stock con relaciones
            $stock = BodegaStock::with(['producto', 'reserva'])
                ->porBodega($idBodega)
                ->conStock()
                ->get();

            return response()->json([
                'success' => true,
                'bodega' => $bodega,
                'stock' => $stock,
                'total_productos' => $stock->count(),
                'cantidad_total' => $stock->sum('cantidad_disponible')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener stock de bodega',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener stock de una reserva específica
     * GET /api/stock/reserva/{idReserva}
     */
    public function getStockPorReserva($idReserva)
    {
        try {
            // Verificar que la reserva existe
            $reserva = Reserva::with('bodega')->find($idReserva);
            if (!$reserva) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reserva no encontrada'
                ], 404);
            }

            // Obtener stock con relaciones
            $stock = BodegaStock::with(['producto', 'bodega'])
                ->porReserva($idReserva)
                ->conStock()
                ->get();

            return response()->json([
                'success' => true,
                'reserva' => $reserva,
                'stock' => $stock,
                'total_productos' => $stock->count(),
                'cantidad_total' => $stock->sum('cantidad_disponible')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener stock de reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener stock de un producto específico en todas las bodegas
     * GET /api/stock/producto/{codigoProducto}
     */
    public function getStockProducto($codigoProducto)
    {
        try {
            // Obtener stock del producto con relaciones
            $stock = BodegaStock::with(['bodega', 'reserva', 'producto'])
                ->porProducto($codigoProducto)
                ->conStock()
                ->get();

            if ($stock->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró stock para este producto'
                ], 404);
            }

            // Calcular totales
            $cantidadTotal = $stock->sum('cantidad_disponible');
            $cantidadReservada = $stock->sum('cantidad_reservada');

            return response()->json([
                'success' => true,
                'producto' => $stock->first()->producto,
                'stock_por_ubicacion' => $stock,
                'total_bodegas' => $stock->groupBy('id_bodega')->count(),
                'cantidad_disponible_total' => $cantidadTotal,
                'cantidad_reservada_total' => $cantidadReservada,
                'cantidad_total' => $cantidadTotal + $cantidadReservada
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener stock del producto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener resumen de stock general
     * GET /api/stock/resumen
     */
    public function getResumenStock()
    {
        try {
            $resumen = DB::table('bodega_stock')
                ->select(
                    DB::raw('COUNT(DISTINCT id_bodega) as total_bodegas'),
                    DB::raw('COUNT(DISTINCT id_reserva) as total_reservas'),
                    DB::raw('COUNT(DISTINCT codigo_producto) as total_productos'),
                    DB::raw('SUM(cantidad_disponible) as cantidad_total_disponible'),
                    DB::raw('SUM(cantidad_reservada) as cantidad_total_reservada')
                )
                ->first();

            return response()->json([
                'success' => true,
                'resumen' => $resumen
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener resumen de stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar disponibilidad de stock para traslado
     * POST /api/stock/verificar-disponibilidad
     */
    public function verificarDisponibilidad(Request $request)
    {
        try {
            $request->validate([
                'id_reserva' => 'required|integer',
                'codigo_producto' => 'required|string',
                'cantidad' => 'required|numeric|min:0.01'
            ]);

            $stock = BodegaStock::where('id_reserva', $request->id_reserva)
                ->where('codigo_producto', $request->codigo_producto)
                ->first();

            if (!$stock) {
                return response()->json([
                    'success' => false,
                    'disponible' => false,
                    'message' => 'No hay stock del producto en esta reserva',
                    'cantidad_disponible' => 0
                ]);
            }

            $disponible = $stock->cantidad_disponible >= $request->cantidad;

            return response()->json([
                'success' => true,
                'disponible' => $disponible,
                'cantidad_disponible' => $stock->cantidad_disponible,
                'cantidad_reservada' => $stock->cantidad_reservada,
                'cantidad_solicitada' => $request->cantidad,
                'message' => $disponible 
                    ? 'Stock disponible para el traslado' 
                    : 'Stock insuficiente para el traslado'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar disponibilidad',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
