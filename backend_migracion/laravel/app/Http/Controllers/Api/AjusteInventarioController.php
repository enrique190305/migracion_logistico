<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Exception;

class AjusteInventarioController extends Controller
{
    /**
     * Obtener lista de bodegas para el filtro
     */
    public function obtenerBodegas()
    {
        try {
            $bodegas = DB::table('bodega')
                ->select('id_bodega', 'nombre')
                ->where('estado', 'ACTIVO')
                ->orderBy('nombre', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'bodegas' => $bodegas
            ]);
        } catch (Exception $e) {
            Log::error("Error al obtener bodegas: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener bodegas'
            ], 500);
        }
    }

    /**
     * Obtener lista de reservas para el filtro
     */
    public function obtenerReservas()
    {
        try {
            $reservas = DB::table('reserva')
                ->select('id_reserva', 'tipo_reserva')
                ->where('estado', 'ACTIVO')
                ->orderBy('tipo_reserva', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'reservas' => $reservas
            ]);
        } catch (Exception $e) {
            Log::error("Error al obtener reservas: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener reservas'
            ], 500);
        }
    }

    /**
     * Obtener inventario con filtros
     * MEJORADO: Ahora calcula desde movimiento_kardex igual que Kardex
     */
    public function obtenerInventario(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_bodega' => 'nullable|integer',
                'id_reserva' => 'nullable|integer',
                'buscar' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // NUEVO: Calcular inventario desde movimiento_kardex (igual que Kardex)
            // Sin duplicar por reservas - muestra 1 producto por bodega
            $sql = "
                SELECT 
                    mk.id_bodega,
                    mk.codigo_producto,
                    COALESCE(p.descripcion, mk.descripcion, 'Sin descripción') as nombre_producto,
                    COALESCE(p.unidad, mk.unidad, 'UND') as unidad_medida,
                    COALESCE(b.nombre, 'Sin bodega') as nombre_bodega,
                    SUM(CASE 
                        WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                        ELSE -mk.cantidad 
                    END) as cantidad_disponible,
                    0 as cantidad_reservada,
                    SUM(CASE 
                        WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                        ELSE -mk.cantidad 
                    END) as cantidad_total,
                    AVG(COALESCE(mk.precio_unitario, 0)) as precio_unitario,
                    SUM(CASE 
                        WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                        ELSE -mk.cantidad 
                    END) * AVG(COALESCE(mk.precio_unitario, 0)) as valor_total,
                    MAX(mk.fecha) as fecha_ultima_actualizacion,
                    0 as id_stock,
                    0 as id_reserva,
                    'N/A' as tipo_reserva
                FROM movimiento_kardex mk
                LEFT JOIN bodega b ON mk.id_bodega = b.id_bodega
                LEFT JOIN producto p ON mk.codigo_producto = p.codigo_producto
                WHERE 1=1
            ";

            // Aplicar filtros
            $params = [];
            if ($request->filled('id_bodega')) {
                $sql .= " AND mk.id_bodega = ?";
                $params[] = $request->id_bodega;
            }

            if ($request->filled('buscar')) {
                $buscar = $request->buscar;
                $sql .= " AND (mk.codigo_producto LIKE ? OR COALESCE(p.descripcion, mk.descripcion) LIKE ?)";
                $params[] = "%{$buscar}%";
                $params[] = "%{$buscar}%";
            }

            $sql .= "
                GROUP BY mk.codigo_producto, mk.id_bodega, b.nombre, 
                         p.descripcion, mk.descripcion, p.unidad, mk.unidad
                HAVING SUM(CASE 
                    WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                    ELSE -mk.cantidad 
                END) > 0
                ORDER BY nombre_producto ASC, nombre_bodega ASC
            ";

            $inventario = DB::select($sql, $params);

            return response()->json([
                'success' => true,
                'inventario' => $inventario
            ]);

        } catch (Exception $e) {
            Log::error("Error al obtener inventario: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener inventario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalle de un producto específico
     */
    public function obtenerDetalleProducto($codigo_producto, $id_bodega)
    {
        try {
            // Calcular desde kardex (igual que la consulta principal)
            $detalleKardex = DB::select("
                SELECT 
                    mk.id_bodega,
                    mk.codigo_producto,
                    COALESCE(p.descripcion, mk.descripcion, 'Sin descripción') as nombre_producto,
                    COALESCE(p.unidad, mk.unidad, 'UND') as unidad_medida,
                    COALESCE(b.nombre, 'Sin bodega') as nombre_bodega,
                    SUM(CASE 
                        WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                        ELSE -mk.cantidad 
                    END) as cantidad_disponible,
                    0 as cantidad_reservada,
                    SUM(CASE 
                        WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                        ELSE -mk.cantidad 
                    END) as cantidad_total,
                    AVG(COALESCE(mk.precio_unitario, 0)) as precio_unitario,
                    SUM(CASE 
                        WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                        ELSE -mk.cantidad 
                    END) * AVG(COALESCE(mk.precio_unitario, 0)) as valor_total,
                    MAX(mk.fecha) as fecha_ultima_actualizacion,
                    0 as id_stock,
                    0 as id_reserva,
                    'N/A' as tipo_reserva
                FROM movimiento_kardex mk
                LEFT JOIN bodega b ON mk.id_bodega = b.id_bodega
                LEFT JOIN producto p ON mk.codigo_producto = p.codigo_producto
                WHERE mk.codigo_producto = ?
                    AND mk.id_bodega = ?
                GROUP BY mk.id_bodega, mk.codigo_producto, p.descripcion, mk.descripcion,
                         p.unidad, mk.unidad, b.nombre
                HAVING cantidad_disponible > 0
            ", [$codigo_producto, $id_bodega]);

            if (empty($detalleKardex)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Producto no encontrado o sin stock'
                ], 404);
            }

            $detalle = $detalleKardex[0];

            // Obtener historial de movimientos recientes
            $historial = DB::table('movimiento_kardex')
                ->where('codigo_producto', $detalle->codigo_producto)
                ->orderBy('fecha', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'detalle' => $detalle,
                'historial' => $historial
            ]);

        } catch (Exception $e) {
            Log::error("Error al obtener detalle del producto: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalle del producto'
            ], 500);
        }
    }

    /**
     * Realizar ajuste de inventario
     * MEJORADO: Trabaja con kardex y sincroniza bodega_stock
     */
    public function realizarAjuste(Request $request)
    {
        try {
            Log::info("=== Iniciando Ajuste de Inventario ===");
            Log::info("Datos recibidos: " . json_encode($request->all()));

            $validator = Validator::make($request->all(), [
                'codigo_producto' => 'required|string',
                'id_bodega' => 'required|integer',
                'id_reserva' => 'nullable|integer',
                'tipo_ajuste' => 'required|in:CANTIDAD,VALORACION,AMBOS',
                'cantidad_nueva' => 'nullable|numeric|min:0',
                'precio_nuevo' => 'nullable|numeric|min:0',
                'motivo' => 'required|string|max:255',
                'observaciones' => 'nullable|string|max:500',
                'documento_referencia' => 'nullable|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Obtener stock actual calculado desde kardex
            $stockKardex = DB::select("
                SELECT 
                    mk.codigo_producto,
                    mk.id_bodega,
                    COALESCE(p.descripcion, mk.descripcion) as nombre_producto,
                    COALESCE(p.unidad, mk.unidad) as unidad_medida,
                    COALESCE(b.nombre, mk.proyecto) as nombre_bodega,
                    SUM(CASE 
                        WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                        ELSE -mk.cantidad 
                    END) as cantidad_actual
                FROM movimiento_kardex mk
                LEFT JOIN producto p ON mk.codigo_producto = p.codigo_producto
                LEFT JOIN bodega b ON mk.id_bodega = b.id_bodega
                WHERE mk.codigo_producto = ?
                    AND mk.id_bodega = ?
                GROUP BY mk.codigo_producto, mk.id_bodega, p.descripcion, 
                         mk.descripcion, p.unidad, mk.unidad, b.nombre, mk.proyecto
            ", [$request->codigo_producto, $request->id_bodega]);

            if (empty($stockKardex)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Producto no encontrado en inventario'
                ], 404);
            }

            $stockActual = $stockKardex[0];

            // Obtener precio unitario actual del kardex
            $precioActual = DB::table('movimiento_kardex')
                ->where('codigo_producto', $request->codigo_producto)
                ->whereNotNull('precio_unitario')
                ->where('precio_unitario', '>', 0)
                ->orderBy('fecha', 'desc')
                ->value('precio_unitario') ?? 0;

            $cantidadAnterior = $stockActual->cantidad_actual;
            $cantidadNueva = $cantidadAnterior;
            $precioNuevo = $precioActual;
            $diferenciaCantidad = 0;
            $tipoMovimiento = 'AJUSTE';

            Log::info("=== CÁLCULOS DE AJUSTE ===");
            Log::info("Cantidad anterior (desde kardex): {$cantidadAnterior}");
            Log::info("Cantidad nueva (solicitada): {$request->cantidad_nueva}");
            
            // Procesar según el tipo de ajuste
            if ($request->tipo_ajuste === 'CANTIDAD' || $request->tipo_ajuste === 'AMBOS') {
                $cantidadNueva = $request->cantidad_nueva;
                $diferenciaCantidad = $cantidadNueva - $cantidadAnterior;
                
                Log::info("Diferencia calculada: {$diferenciaCantidad}");
                
                // Determinar tipo de movimiento
                if ($diferenciaCantidad > 0) {
                    $tipoMovimiento = 'INGRESO';
                    Log::info("Tipo de movimiento: INGRESO (diferencia positiva)");
                } else if ($diferenciaCantidad < 0) {
                    $tipoMovimiento = 'SALIDA';
                    $diferenciaCantidad = abs($diferenciaCantidad);
                    Log::info("Tipo de movimiento: SALIDA (diferencia negativa), cantidad absoluta: {$diferenciaCantidad}");
                } else {
                    Log::info("Sin diferencia de cantidad");
                }
            }

            if ($request->tipo_ajuste === 'VALORACION' || $request->tipo_ajuste === 'AMBOS') {
                $precioNuevo = $request->precio_nuevo;
            }

            // Registrar en kardex el ajuste
            if ($request->tipo_ajuste === 'CANTIDAD' || $request->tipo_ajuste === 'AMBOS') {
                if ($diferenciaCantidad != 0) {
                    $ultimoId = DB::table('movimiento_kardex')->max('id_movimiento') ?? 0;
                    $nuevoId = $ultimoId + 1;
                    $documento = $request->documento_referencia ?? 'AJUSTE-' . date('YmdHis');

                    DB::table('movimiento_kardex')->insert([
                        'id_movimiento' => $nuevoId,
                        'fecha' => now(),
                        'tipo_movimiento' => $tipoMovimiento,
                        'codigo_producto' => $request->codigo_producto,
                        'descripcion' => $stockActual->nombre_producto,
                        'unidad' => $stockActual->unidad_medida,
                        'cantidad' => abs($diferenciaCantidad),
                        'id_bodega' => $request->id_bodega,
                        'proyecto' => $stockActual->nombre_bodega,
                        'documento' => $documento,
                        'precio_unitario' => $precioNuevo,
                        'observaciones' => "AJUSTE: {$request->motivo} | {$request->observaciones}"
                    ]);

                    Log::info("Movimiento kardex registrado con ID: {$nuevoId}");
                }
            }

            // Sincronizar bodega_stock
            $idReserva = $request->id_reserva ?? 0;
            $bodegaStock = DB::table('bodega_stock')
                ->where('codigo_producto', $request->codigo_producto)
                ->where('id_bodega', $request->id_bodega)
                ->where('id_reserva', $idReserva)
                ->first();

            if ($bodegaStock) {
                // Actualizar registro existente
                DB::table('bodega_stock')
                    ->where('id_stock', $bodegaStock->id_stock)
                    ->update([
                        'cantidad_disponible' => $cantidadNueva,
                        'fecha_ultima_actualizacion' => now()
                    ]);
                Log::info("bodega_stock actualizado para id_stock: {$bodegaStock->id_stock}");
            } else {
                // Crear nuevo registro en bodega_stock
                DB::table('bodega_stock')->insert([
                    'id_bodega' => $request->id_bodega,
                    'id_reserva' => $idReserva,
                    'codigo_producto' => $request->codigo_producto,
                    'cantidad_disponible' => $cantidadNueva,
                    'cantidad_reservada' => 0,
                    'fecha_ultima_actualizacion' => now()
                ]);
                Log::info("Nuevo registro creado en bodega_stock");
            }

            DB::commit();

            Log::info("=== Ajuste de Inventario Completado ===");

            return response()->json([
                'success' => true,
                'message' => 'Ajuste de inventario realizado exitosamente',
                'detalles' => [
                    'producto' => $stockActual->nombre_producto,
                    'cantidad_anterior' => $cantidadAnterior,
                    'cantidad_nueva' => $cantidadNueva,
                    'precio_anterior' => $precioActual,
                    'precio_nuevo' => $precioNuevo,
                    'diferencia' => $diferenciaCantidad,
                    'tipo_movimiento' => $tipoMovimiento
                ]
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error al realizar ajuste: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al realizar ajuste: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar auditoría del ajuste
     */
    private function registrarAuditoriaAjuste($stockActual, $request, $cantidadAnterior, $cantidadNueva, $precioAnterior, $precioNuevo)
    {
        try {
            // Verificar si existe tabla de auditoría
            $tablaExiste = DB::select("SHOW TABLES LIKE 'auditoria_ajustes'");
            
            if (!empty($tablaExiste)) {
                DB::table('auditoria_ajustes')->insert([
                    'fecha_ajuste' => now(),
                    'codigo_producto' => $stockActual->codigo_producto,
                    'nombre_producto' => $stockActual->nombre_producto,
                    'bodega' => $stockActual->nombre_bodega,
                    'tipo_ajuste' => $request->tipo_ajuste,
                    'cantidad_anterior' => $cantidadAnterior,
                    'cantidad_nueva' => $cantidadNueva,
                    'precio_anterior' => $precioAnterior,
                    'precio_nuevo' => $precioNuevo,
                    'motivo' => $request->motivo,
                    'observaciones' => $request->observaciones,
                    'documento_referencia' => $request->documento_referencia,
                    'usuario' => 'admin' // Cambiar por el usuario autenticado
                ]);
            }
        } catch (Exception $e) {
            Log::warning("No se pudo registrar auditoría: " . $e->getMessage());
        }
    }

    /**
     * Obtener estadísticas del inventario
     */
    public function obtenerEstadisticas()
    {
        try {
            // Total de productos en inventario (TODOS, no solo con stock > 0)
            $totalProductos = DB::table('bodega_stock')
                ->count();

            // Valor total del inventario
            $inventario = DB::table('bodega_stock as bs')
                ->join('producto as p', 'bs.codigo_producto', '=', 'p.codigo_producto')
                ->select('bs.codigo_producto', 'bs.cantidad_disponible')
                ->get();

            $valorTotal = 0;
            foreach ($inventario as $item) {
                $precio = DB::table('movimiento_kardex')
                    ->where('codigo_producto', $item->codigo_producto)
                    ->whereNotNull('precio_unitario')
                    ->where('precio_unitario', '>', 0)
                    ->orderBy('fecha', 'desc')
                    ->value('precio_unitario') ?? 0;
                
                $valorTotal += $item->cantidad_disponible * $precio;
            }

            // Productos por bodega (TODOS)
            $productosPorBodega = DB::table('bodega_stock as bs')
                ->join('bodega as b', 'bs.id_bodega', '=', 'b.id_bodega')
                ->select('b.nombre', DB::raw('COUNT(*) as cantidad'))
                ->groupBy('b.id_bodega', 'b.nombre')
                ->get();

            // Productos con stock bajo (menos de 10 unidades, pero mayor a 0)
            $stockBajo = DB::table('bodega_stock')
                ->where('cantidad_disponible', '>', 0)
                ->where('cantidad_disponible', '<', 10)
                ->count();

            // Últimos ajustes realizados
            $ultimosAjustes = DB::table('movimiento_kardex')
                ->where('tipo_movimiento', 'AJUSTE')
                ->orWhere('documento', 'LIKE', 'AJUSTE-%')
                ->orderBy('fecha', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'estadisticas' => [
                    'total_productos' => $totalProductos,
                    'valor_total' => round($valorTotal, 2),
                    'productos_por_bodega' => $productosPorBodega,
                    'productos_stock_bajo' => $stockBajo,
                    'ultimos_ajustes' => $ultimosAjustes
                ]
            ]);

        } catch (Exception $e) {
            Log::error("Error al obtener estadísticas: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas'
            ], 500);
        }
    }

    /**
     * Exportar inventario a Excel/CSV
     */
    public function exportarInventario(Request $request)
    {
        try {
            $query = DB::table('bodega_stock as bs')
                ->join('bodega as b', 'bs.id_bodega', '=', 'b.id_bodega')
                ->join('reserva as r', 'bs.id_reserva', '=', 'r.id_reserva')
                ->join('producto as p', 'bs.codigo_producto', '=', 'p.codigo_producto')
                ->select(
                    'bs.codigo_producto',
                    'p.descripcion as nombre_producto',
                    'p.unidad as unidad_medida',
                    'b.nombre as bodega',
                    'r.tipo_reserva as reserva',
                    'bs.cantidad_disponible',
                    'bs.cantidad_reservada',
                    DB::raw('(bs.cantidad_disponible + bs.cantidad_reservada) as cantidad_total')
                );
                // REMOVIDO: ->where('bs.cantidad_disponible', '>', 0)

            // Aplicar filtros si existen
            if ($request->filled('id_bodega')) {
                $query->where('bs.id_bodega', $request->id_bodega);
            }

            if ($request->filled('id_reserva')) {
                $query->where('bs.id_reserva', $request->id_reserva);
            }

            $datos = $query->orderBy('p.descripcion', 'asc')->get();

            // Agregar precios
            foreach ($datos as $item) {
                $precio = DB::table('movimiento_kardex')
                    ->where('codigo_producto', $item->codigo_producto)
                    ->whereNotNull('precio_unitario')
                    ->where('precio_unitario', '>', 0)
                    ->orderBy('fecha', 'desc')
                    ->value('precio_unitario') ?? 0;
                
                $item->precio_unitario = $precio;
                $item->valor_total = $item->cantidad_disponible * $precio;
            }

            return response()->json([
                'success' => true,
                'datos' => $datos,
                'total_registros' => count($datos)
            ]);

        } catch (Exception $e) {
            Log::error("Error al exportar inventario: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar inventario'
            ], 500);
        }
    }
}
