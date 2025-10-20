<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KardexController extends Controller
{
    /**
     * Obtener inventario actual
     */
    public function getInventario(Request $request)
    {
        try {
            Log::info('=== Obteniendo inventario actual ===');

            // ✅ Usar la tabla movimiento_kardex que SÍ existe en tu BD
            $inventario = DB::select("
                SELECT 
                    COALESCE(mk.proyecto, 'Sin proyecto') as proyecto,
                    mk.codigo_producto,
                    COALESCE(mk.descripcion, 'Sin descripción') as descripcion,
                    mk.unidad,
                    SUM(CASE 
                        WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                        ELSE -mk.cantidad 
                    END) as stock,
                    AVG(COALESCE(mk.precio_unitario, 0)) as precio_unitario,
                    SUM(CASE 
                        WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                        ELSE -mk.cantidad 
                    END) * AVG(COALESCE(mk.precio_unitario, 0)) as precio_total,
                    'SOLES' as moneda
                FROM movimiento_kardex mk
                GROUP BY mk.codigo_producto, mk.proyecto, mk.descripcion, mk.unidad
                HAVING SUM(CASE 
                    WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                    ELSE -mk.cantidad 
                END) > 0
                ORDER BY proyecto, descripcion
            ");

            Log::info('Inventario obtenido: ' . count($inventario) . ' productos');

            return response()->json($inventario, 200);

        } catch (\Exception $e) {
            Log::error('Error en getInventario: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([], 200);
        }
    }

    /**
     * Obtener historial de movimientos
     */
    public function getHistorial(Request $request)
    {
        try {
            Log::info('=== Obteniendo historial de movimientos ===');

            $fechaInicio = $request->input('fecha_inicio', now()->subDays(30)->format('Y-m-d'));
            $fechaFin = $request->input('fecha_fin', now()->format('Y-m-d'));

            Log::info("Rango de fechas: {$fechaInicio} - {$fechaFin}");

            // ✅ Usar la tabla movimiento_kardex
            $historial = DB::select("
                SELECT 
                    mk.fecha as fecha,
                    mk.tipo_movimiento,
                    mk.codigo_producto,
                    COALESCE(mk.descripcion, 'Sin descripción') as descripcion,
                    mk.unidad,
                    mk.cantidad,
                    COALESCE(mk.proyecto, 'Sin proyecto') as proyecto,
                    COALESCE(mk.documento, 'N/A') as documento,
                    COALESCE(mk.observaciones, 'N/A') as observaciones
                FROM movimiento_kardex mk
                WHERE DATE(mk.fecha) BETWEEN ? AND ?
                ORDER BY mk.fecha DESC, mk.id_movimiento DESC
                LIMIT 1000
            ", [$fechaInicio, $fechaFin]);

            Log::info('Historial obtenido: ' . count($historial) . ' movimientos');

            return response()->json($historial, 200);

        } catch (\Exception $e) {
            Log::error('Error en getHistorial: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([], 200);
        }
    }

    /**
     * Obtener kardex de un producto específico
     */
    public function getKardexProducto($codigoProducto)
    {
        try {
            Log::info("=== Obteniendo kardex del producto: {$codigoProducto} ===");

            $kardex = DB::select("
                SELECT 
                    mk.fecha as fecha_movimiento,
                    mk.tipo_movimiento,
                    mk.cantidad,
                    COALESCE(mk.precio_unitario, 0) as precio_unitario,
                    mk.cantidad * COALESCE(mk.precio_unitario, 0) as subtotal,
                    COALESCE(mk.proyecto, 'Sin proyecto') as proyecto,
                    COALESCE(mk.documento, 'N/A') as documento,
                    COALESCE(mk.observaciones, 'N/A') as observaciones,
                    COALESCE(mk.descripcion, 'Sin descripción') as descripcion,
                    mk.unidad as unidad_medida
                FROM movimiento_kardex mk
                WHERE mk.codigo_producto = ?
                ORDER BY mk.fecha DESC, mk.id_movimiento DESC
            ", [$codigoProducto]);

            // Calcular saldo acumulado
            $saldoActual = 0;
            $kardexConSaldo = [];
            
            foreach ($kardex as $item) {
                if ($item->tipo_movimiento === 'INGRESO') {
                    $saldoActual += $item->cantidad;
                } else {
                    $saldoActual -= $item->cantidad;
                }
                
                $itemArray = (array) $item;
                $itemArray['saldo'] = $saldoActual;
                $kardexConSaldo[] = $itemArray;
            }

            Log::info('Kardex del producto obtenido: ' . count($kardex) . ' movimientos');

            return response()->json($kardexConSaldo, 200);

        } catch (\Exception $e) {
            Log::error("Error en getKardexProducto({$codigoProducto}): " . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([], 200);
        }
    }

    /**
     * Obtener stock actual de un producto
     */
    public function getStockProducto($codigoProducto, $idProyecto = null)
    {
        try {
            $sql = "
                SELECT 
                    SUM(CASE 
                        WHEN tipo_movimiento = 'INGRESO' THEN cantidad 
                        ELSE -cantidad 
                    END) as stock_actual
                FROM movimiento_kardex
                WHERE codigo_producto = ?
            ";

            $params = [$codigoProducto];

            if ($idProyecto) {
                $sql .= " AND proyecto = ?";
                $params[] = $idProyecto;
            }

            $result = DB::select($sql, $params);

            return response()->json([
                'codigo_producto' => $codigoProducto,
                'id_proyecto' => $idProyecto,
                'stock_actual' => $result[0]->stock_actual ?? 0
            ], 200);

        } catch (\Exception $e) {
            Log::error("Error en getStockProducto({$codigoProducto}, {$idProyecto}): " . $e->getMessage());
            
            return response()->json([
                'codigo_producto' => $codigoProducto,
                'id_proyecto' => $idProyecto,
                'stock_actual' => 0
            ], 200);
        }
    }
}