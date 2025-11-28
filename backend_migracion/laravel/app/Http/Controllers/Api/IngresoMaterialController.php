<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Exception;
use Barryvdh\DomPDF\Facade\Pdf;

class IngresoMaterialController extends Controller
{
    /**
     * Listar órdenes pendientes (OC y OS con estado APROBADO o PARCIAL)
     * Solo muestra órdenes que tengan productos con saldo > 0
     */
    public function listarOrdenesPendientes()
    {
        try {
            // Obtener OC con productos pendientes (saldo > 0)
            $ordenesCompra = DB::select("
                SELECT DISTINCT oc.correlativo, 'OC' as tipo
                FROM orden_compra oc
                INNER JOIN detalle_oc d ON oc.id_oc = d.id_oc
                WHERE oc.estado IN ('APROBADO', 'PARCIAL')
                AND (d.cantidad - IFNULL(d.cantidad_recibida, 0)) > 0
                ORDER BY oc.correlativo
            ");

            // Obtener OS con servicios pendientes (saldo > 0)
            $ordenesServicio = DB::select("
                SELECT DISTINCT os.correlativo, 'OS' as tipo
                FROM orden_servicio os
                INNER JOIN detalle_os d ON os.id_os = d.id_os
                WHERE os.estado IN ('APROBADO', 'PARCIAL')
                AND (d.cantidad - IFNULL(d.cantidad_recibida, 0)) > 0
                ORDER BY os.correlativo
            ");

            // Combinar ambas colecciones
            $ordenes = array_merge($ordenesCompra, $ordenesServicio);

            return response()->json([
                'success' => true,
                'data' => $ordenes
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener órdenes pendientes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener información de una orden específica (OC o OS)
     */
    public function obtenerInfoOrden(Request $request)
    {
        try {
            $correlativo = $request->input('correlativo');
            
            if (str_starts_with($correlativo, 'OC-')) {
                // Es una Orden de Compra
                $orden = DB::table('orden_compra as oc')
                    ->join('proveedor as p', 'oc.id_proveedor', '=', 'p.id_proveedor')
                    ->join('empresa as e', 'oc.id_empresa', '=', 'e.id_empresa')
                    ->leftJoin('orden_pedido as op', 'oc.id_orden_pedido', '=', 'op.id_orden_pedido')
                    ->leftJoin('bodega as b', 'op.id_bodega', '=', 'b.id_bodega')
                    ->where('oc.correlativo', $correlativo)
                    ->select(
                        'oc.id_oc',
                        'oc.correlativo',
                        'p.nombre as proveedor',
                        'oc.fecha_oc as fecha',
                        'oc.estado',
                        'e.razon_social',
                        'e.id_empresa',
                        'b.id_bodega',
                        'b.nombre as bodega_nombre',
                        'b.ubicacion as bodega_ubicacion',
                        DB::raw("'OC' as tipo")
                    )
                    ->first();
            } else if (str_starts_with($correlativo, 'OS-')) {
                // Es una Orden de Servicio
                $orden = DB::table('orden_servicio as os')
                    ->join('proveedor as p', 'os.id_proveedor', '=', 'p.id_proveedor')
                    ->join('empresa as e', 'os.id_empresa', '=', 'e.id_empresa')
                    ->leftJoin('orden_pedido as op', 'os.id_orden_pedido', '=', 'op.id_orden_pedido')
                    ->leftJoin('bodega as b', 'op.id_bodega', '=', 'b.id_bodega')
                    ->where('os.correlativo', $correlativo)
                    ->select(
                        'os.id_os',
                        'os.correlativo',
                        'p.nombre as proveedor',
                        'os.fecha_servicio as fecha',
                        'os.estado',
                        'e.razon_social',
                        'e.id_empresa',
                        'b.id_bodega',
                        'b.nombre as bodega_nombre',
                        'b.ubicacion as bodega_ubicacion',
                        DB::raw("'OS' as tipo")
                    )
                    ->first();
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Formato de correlativo no válido'
                ], 400);
            }

            if (!$orden) {
                return response()->json([
                    'success' => false,
                    'message' => 'Orden no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $orden
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener información de la orden',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Precargar productos de una orden con saldo pendiente
     */
    public function precargarProductos(Request $request)
    {
        try {
            $correlativo = $request->input('correlativo');
            $productos = [];

            if (str_starts_with($correlativo, 'OC-')) {
                // Obtener id_oc
                $orden = DB::table('orden_compra')->where('correlativo', $correlativo)->first();
                if (!$orden) {
                    return response()->json(['success' => false, 'message' => 'OC no encontrada'], 404);
                }

                // Obtener productos con saldo pendiente
                $productos = DB::select("
                    SELECT 
                        d.codigo_producto,
                        p.descripcion,
                        d.cantidad,
                        IFNULL(d.cantidad_recibida, 0) as cantidad_recibida,
                        (d.cantidad - IFNULL(d.cantidad_recibida, 0)) as saldo,
                        p.unidad,
                        d.precio_unitario
                    FROM detalle_oc d
                    INNER JOIN producto p ON d.codigo_producto = p.codigo_producto
                    WHERE d.id_oc = ?
                    HAVING saldo > 0
                ", [$orden->id_oc]);

            } else if (str_starts_with($correlativo, 'OS-')) {
                // Obtener id_os
                $orden = DB::table('orden_servicio')->where('correlativo', $correlativo)->first();
                if (!$orden) {
                    return response()->json(['success' => false, 'message' => 'OS no encontrada'], 404);
                }

                // Obtener servicios con saldo pendiente
                $productos = DB::select("
                    SELECT 
                        d.codigo_servicio as codigo_producto,
                        d.descripcion_servicio as descripcion,
                        d.cantidad,
                        IFNULL(d.cantidad_recibida, 0) as cantidad_recibida,
                        (d.cantidad - IFNULL(d.cantidad_recibida, 0)) as saldo,
                        d.unidad,
                        d.precio_unitario
                    FROM detalle_os d
                    WHERE d.id_os = ?
                    HAVING saldo > 0
                ", [$orden->id_os]);
            }

            return response()->json([
                'success' => true,
                'data' => $productos
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al precargar productos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar proyectos almacén activos
     */
    public function listarProyectosAlmacen()
    {
        try {
            $proyectos = DB::table('proyecto_almacen')
                ->where('estado', 'ACTIVO')
                ->select('id_proyecto_almacen', 'nombre_proyecto', 'codigo_proyecto')
                ->orderBy('nombre_proyecto')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $proyectos
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener proyectos almacén',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar productos disponibles
     */
    public function listarProductos()
    {
        try {
            $productos = DB::table('producto')
                ->whereNotNull('codigo_producto')
                ->where('codigo_producto', '!=', '')
                ->whereNotNull('descripcion')
                ->where('descripcion', '!=', '')
                ->select('codigo_producto', 'descripcion', 'unidad')
                ->orderBy('descripcion')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $productos
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener productos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar número automático de ingreso
     */
    public function generarNumeroIngreso()
    {
        try {
            // Obtener el máximo número de ingreso_material
            $maxNumero = DB::table('ingreso_material')
                ->where('id_ingreso', 'LIKE', 'NI-%')
                ->selectRaw("COALESCE(MAX(CAST(SUBSTRING(id_ingreso, 4) AS UNSIGNED)), 0) as max_numero")
                ->value('max_numero');

            // Asegurar que sea numérico
            $maxNumero = $maxNumero ?? 0;
            $siguiente = intval($maxNumero) + 1;
            $numeroIngreso = 'NI-' . str_pad($siguiente, 3, '0', STR_PAD_LEFT);

            Log::info("Generando número de ingreso - MAX actual: {$maxNumero}, Siguiente: {$siguiente}, Número generado: {$numeroIngreso}");

            return response()->json([
                'success' => true,
                'data' => ['numero_ingreso' => $numeroIngreso]
            ]);
        } catch (Exception $e) {
            Log::error('Error generando número de ingreso: ' . $e->getMessage());
            // Si hay error, buscar manualmente el último número
            $resultado = DB::select("
                SELECT COALESCE(MAX(CAST(SUBSTRING(id_ingreso, 4) AS UNSIGNED)), 0) as max_num 
                FROM ingreso_material 
                WHERE id_ingreso LIKE 'NI-%'
            ");
            $siguiente = intval($resultado[0]->max_num ?? 0) + 1;
            $numeroIngreso = 'NI-' . str_pad($siguiente, 3, '0', STR_PAD_LEFT);
            
            Log::info("Número de ingreso generado en catch: {$numeroIngreso}");
            
            return response()->json([
                'success' => true,
                'data' => ['numero_ingreso' => $numeroIngreso]
            ]);
        }
    }

    /**
     * Generar número correlativo para Ingreso Directo (ID-001, ID-002, etc.)
     */
    public function generarNumeroIngresoDirecto()
    {
        try {
            // Obtener el máximo correlativo de ingreso_directo con formato ID-XXX
            $maxNumero = DB::table('ingreso_directo')
                ->where('correlativo', 'LIKE', 'ID-%')
                ->selectRaw("COALESCE(MAX(CAST(SUBSTRING(correlativo, 4) AS UNSIGNED)), 0) as max_numero")
                ->value('max_numero');

            $maxNumero = $maxNumero ?? 0;
            $siguiente = intval($maxNumero) + 1;
            $numeroIngresoDirecto = 'ID-' . str_pad($siguiente, 3, '0', STR_PAD_LEFT);

            Log::info("Generando número de ingreso directo - MAX actual: {$maxNumero}, Siguiente: {$siguiente}, Número generado: {$numeroIngresoDirecto}");

            return response()->json([
                'success' => true,
                'data' => ['numero_ingreso' => $numeroIngresoDirecto]
            ]);
        } catch (Exception $e) {
            Log::error('Error generando número de ingreso directo: ' . $e->getMessage());
            
            $resultado = DB::select("
                SELECT COALESCE(MAX(CAST(SUBSTRING(correlativo, 4) AS UNSIGNED)), 0) as max_num 
                FROM ingreso_directo 
                WHERE correlativo LIKE 'ID-%'
            ");
            $siguiente = intval($resultado[0]->max_num ?? 0) + 1;
            $numeroIngresoDirecto = 'ID-' . str_pad($siguiente, 3, '0', STR_PAD_LEFT);
            
            Log::info("Número de ingreso directo generado en catch: {$numeroIngresoDirecto}");
            
            return response()->json([
                'success' => true,
                'data' => ['numero_ingreso' => $numeroIngresoDirecto]
            ]);
        }
    }

    /**
     * Guardar ingreso de material (OC) o conformidad de servicio (OS)
     */
    public function guardarIngreso(Request $request)
    {
        try {
            Log::info('=== Iniciando guardar ingreso ===');
            Log::info('Datos recibidos:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'correlativo' => 'required|string',
                'fecha_ingreso' => 'required|date',
                'num_guia' => 'nullable|string',
                'factura' => 'nullable|string',
                'observaciones' => 'nullable|string',
                'usuario' => 'required|string',
                'id_bodega' => 'required|integer|exists:bodega,id_bodega',        // Nueva validación
                'id_reserva' => 'required|integer|exists:reserva,id_reserva',    // Nueva validación
                'productos' => 'required|array|min:1',
                'productos.*.codigo_producto' => 'required|string',
                'productos.*.cantidad_ingresar' => 'required|numeric|min:0.01',
                'productos.*.observaciones' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                Log::error('Validación fallida:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validación fallida',
                    'errors' => $validator->errors()
                ], 422);
            }

            $correlativo = $request->input('correlativo');
            $esOC = str_starts_with($correlativo, 'OC-');
            $esOS = str_starts_with($correlativo, 'OS-');
            
            Log::info("Tipo de orden detectado - OC: $esOC, OS: $esOS");

            DB::beginTransaction();

            try {
                if ($esOC) {
                    // Guardar como Ingreso de Material
                    Log::info('Guardando como Ingreso de Material (OC)');
                    $resultado = $this->guardarIngresoMaterial($request);
                } else if ($esOS) {
                    // Guardar como Conformidad de Servicio
                    Log::info('Guardando como Conformidad de Servicio (OS)');
                    $resultado = $this->guardarConformidadServicio($request);
                } else {
                    throw new Exception('Tipo de orden no válido');
                }

                DB::commit();
                Log::info('✅ Ingreso guardado exitosamente:', $resultado);

                return response()->json([
                    'success' => true,
                    'message' => '✅ Ingreso guardado correctamente',
                    'data' => $resultado
                ]);

            } catch (Exception $e) {
                DB::rollBack();
                Log::error('Error en transacción:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
                throw $e;
            }

        } catch (Exception $e) {
            Log::error('Error general al guardar ingreso:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar el ingreso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Guardar Ingreso de Material (para OC)
     */
    private function guardarIngresoMaterial(Request $request)
    {
        $correlativo = $request->input('correlativo');
        
        // Obtener ID de la orden de compra
        $orden = DB::table('orden_compra')->where('correlativo', $correlativo)->first();
        if (!$orden) {
            throw new Exception('Orden de compra no encontrada');
        }

        // Generar ID de ingreso
        $numeroIngreso = $this->generarNumeroIngreso()->getData()->data->numero_ingreso;

        // Obtener nombre del proyecto desde proyecto_almacen
        $idBodega = $request->input('id_bodega');
        $idReserva = $request->input('id_reserva');
        
        $proyectoInfo = DB::table('proyecto_almacen')
            ->where('id_bodega', $idBodega)
            ->where('id_reserva', $idReserva)
            ->where('estado', 'ACTIVO')
            ->select('nombre_proyecto')
            ->first();
        
        $nombreProyecto = $proyectoInfo ? $proyectoInfo->nombre_proyecto : null;

        // Insertar ingreso de material
        DB::table('ingreso_material')->insert([
            'id_ingreso' => $numeroIngreso,
            'id_oc' => $orden->id_oc,
            'fecha_ingreso' => $request->input('fecha_ingreso'),
            'num_guia' => $request->input('num_guia'),
            'factura' => $request->input('factura'),
            'proyecto_almacen' => $nombreProyecto,           // ✅ Agregar proyecto_almacen
            'observaciones' => $request->input('observaciones'),
            'usuario' => $request->input('usuario'),
            'id_bodega' => $idBodega,                        // Nueva columna
            'id_reserva' => $idReserva                       // Nueva columna
        ]);

        // Insertar detalles y movimientos kardex
        foreach ($request->input('productos') as $producto) {
            // Insertar detalle
            // NOTA: El trigger 'after_insert_detalle_ingreso_material' actualizará automáticamente bodega_stock
            DB::table('detalle_ingreso_material')->insert([
                'id_ingreso' => $numeroIngreso,
                'codigo_producto' => $producto['codigo_producto'],
                'cantidad_recibida' => $producto['cantidad_ingresar'],
                'observaciones' => $producto['observaciones'] ?? ''
            ]);

            // ✅ Actualizar cantidad_recibida en detalle_oc
            DB::table('detalle_oc')
                ->where('id_oc', $orden->id_oc)
                ->where('codigo_producto', $producto['codigo_producto'])
                ->increment('cantidad_recibida', $producto['cantidad_ingresar']);

            // Obtener precio unitario del detalle de OC
            $detalleOC = DB::table('detalle_oc')
                ->where('id_oc', $orden->id_oc)
                ->where('codigo_producto', $producto['codigo_producto'])
                ->first();

            // Obtener descripción y unidad del producto
            $productoInfo = DB::table('producto')
                ->where('codigo_producto', $producto['codigo_producto'])
                ->first();

            // Insertar en kardex (sin id_movimiento, es auto-increment)
            DB::table('movimiento_kardex')->insert([
                'fecha' => $request->input('fecha_ingreso'),
                'tipo_movimiento' => 'INGRESO',
                'codigo_producto' => $producto['codigo_producto'],
                'descripcion' => $productoInfo->descripcion ?? '',
                'unidad' => $productoInfo->unidad ?? '',
                'cantidad' => $producto['cantidad_ingresar'],
                'proyecto' => $nombreProyecto,                  // ✅ Nombre del proyecto
                'id_bodega' => $idBodega,                       // ✅ ID de la bodega
                'documento' => $numeroIngreso,
                'precio_unitario' => $detalleOC->precio_unitario ?? 0,
                'observaciones' => $producto['observaciones'] ?? ''
            ]);
        }

        // Actualizar estado de la OC
        $this->actualizarEstadoOC($orden->id_oc);

        return [
            'id_ingreso' => $numeroIngreso,
            'tipo' => 'OC'
        ];
    }

    /**
     * Guardar Conformidad de Servicio (para OS)
     */
    private function guardarConformidadServicio(Request $request)
    {
        $correlativo = $request->input('correlativo');
        
        // Obtener ID de la orden de servicio
        $orden = DB::table('orden_servicio')->where('correlativo', $correlativo)->first();
        if (!$orden) {
            throw new Exception('Orden de servicio no encontrada');
        }

        // Insertar conformidad de servicio
        $idConformidad = DB::table('conformidad_servicio')->insertGetId([
            'id_os' => $orden->id_os,
            'fecha_conformidad' => $request->input('fecha_ingreso'),
            'num_doc_servicio' => $request->input('num_guia'),
            'factura' => $request->input('factura'),
            'observaciones' => $request->input('observaciones'),
            'usuario' => $request->input('usuario')
        ]);

        // Insertar detalles
        foreach ($request->input('productos') as $producto) {
            DB::table('detalle_conformidad_servicio')->insert([
                'id_conformidad' => $idConformidad,
                'codigo_servicio' => $producto['codigo_producto'],
                'cantidad_conforme' => $producto['cantidad_ingresar'],
                'observaciones' => $producto['observaciones'] ?? ''
            ]);

            // ✅ Actualizar cantidad_recibida en detalle_os
            DB::table('detalle_os')
                ->where('id_os', $orden->id_os)
                ->where('codigo_servicio', $producto['codigo_producto'])
                ->increment('cantidad_recibida', $producto['cantidad_ingresar']);
        }

        // Actualizar estado de la OS
        $this->actualizarEstadoOS($orden->id_os);

        return [
            'id_conformidad' => $idConformidad,
            'tipo' => 'OS'
        ];
    }

    /**
     * Actualizar estado de Orden de Compra
     */
    private function actualizarEstadoOC($idOC)
    {
        // Verificar si quedan productos pendientes usando cantidad_recibida
        $pendientes = DB::select("
            SELECT COUNT(*) as total
            FROM detalle_oc d
            WHERE d.id_oc = ?
            AND (IFNULL(d.cantidad, 0) - IFNULL(d.cantidad_recibida, 0)) > 0
        ", [$idOC]);

        $nuevoEstado = ($pendientes[0]->total == 0) ? 'COMPLETADA' : 'PARCIAL';

        DB::table('orden_compra')
            ->where('id_oc', $idOC)
            ->update(['estado' => $nuevoEstado]);
    }

    /**
     * Actualizar estado de Orden de Servicio
     */
    private function actualizarEstadoOS($idOS)
    {
        // Verificar si quedan servicios pendientes usando cantidad_recibida
        $pendientes = DB::select("
            SELECT COUNT(*) as total
            FROM detalle_os d
            WHERE d.id_os = ?
            AND (IFNULL(d.cantidad, 0) - IFNULL(d.cantidad_recibida, 0)) > 0
        ", [$idOS]);

        $nuevoEstado = ($pendientes[0]->total == 0) ? 'COMPLETADA' : 'PARCIAL';

        DB::table('orden_servicio')
            ->where('id_os', $idOS)
            ->update(['estado' => $nuevoEstado]);
    }

    /**
     * Obtener historial de ingresos de materiales (OC)
     */
    public function obtenerHistorialIngresos(Request $request)
    {
        try {
            $query = DB::table('ingreso_material as im')
                ->join('orden_compra as oc', 'im.id_oc', '=', 'oc.id_oc')
                ->join('proveedor as p', 'oc.id_proveedor', '=', 'p.id_proveedor')
                ->leftJoin('bodega as b', 'im.id_bodega', '=', 'b.id_bodega')
                ->leftJoin('detalle_ingreso_material as dim', 'im.id_ingreso', '=', 'dim.id_ingreso')
                ->select(
                    'im.id_ingreso',
                    'oc.correlativo',
                    'im.fecha_ingreso',
                    'p.nombre as proveedor',
                    'b.nombre as bodega',
                    'im.id_bodega',
                    DB::raw("'COMPRA' as tipo_ingreso"),
                    'oc.estado',
                    'im.num_guia',
                    'im.factura',
                    'im.usuario',
                    DB::raw('COUNT(DISTINCT dim.codigo_producto) as total_productos')
                )
                ->groupBy(
                    'im.id_ingreso',
                    'oc.correlativo',
                    'im.fecha_ingreso',
                    'p.nombre',
                    'b.nombre',
                    'im.id_bodega',
                    'oc.estado',
                    'im.num_guia',
                    'im.factura',
                    'im.usuario'
                )
                ->orderBy('im.fecha_ingreso', 'desc');

            // Aplicar filtros de fecha si existen
            if ($request->has('fecha_desde')) {
                $query->where('im.fecha_ingreso', '>=', $request->input('fecha_desde'));
            }
            if ($request->has('fecha_hasta')) {
                $query->where('im.fecha_ingreso', '<=', $request->input('fecha_hasta'));
            }

            $historial = $query->get();

            return response()->json([
                'success' => true,
                'data' => $historial
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial de ingresos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener historial de conformidades de servicio (OS)
     */
    public function obtenerHistorialServicios(Request $request)
    {
        try {
            $query = DB::table('conformidad_servicio as cs')
                ->join('orden_servicio as os', 'cs.id_os', '=', 'os.id_os')
                ->join('proveedor as p', 'os.id_proveedor', '=', 'p.id_proveedor')
                ->select(
                    'cs.id_conformidad',
                    'os.correlativo',
                    'cs.fecha_conformidad',
                    'p.nombre as proveedor',
                    'cs.proyecto_almacen',
                    'os.estado',
                    'cs.num_doc_servicio',
                    'cs.factura',
                    'cs.usuario'
                )
                ->orderBy('cs.fecha_conformidad', 'desc');

            // Aplicar filtros de fecha si existen
            if ($request->has('fecha_desde')) {
                $query->where('cs.fecha_conformidad', '>=', $request->input('fecha_desde'));
            }
            if ($request->has('fecha_hasta')) {
                $query->where('cs.fecha_conformidad', '<=', $request->input('fecha_hasta'));
            }

            $historial = $query->get();

            return response()->json([
                'success' => true,
                'data' => $historial
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial de servicios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar empresas para ingreso directo
     */
    public function listarEmpresas()
    {
        try {
            $empresas = DB::table('empresa')
                ->select(
                    'id_empresa', 
                    'razon_social as nombre_empresa',
                    'ruc'
                )
                ->orderBy('razon_social')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $empresas
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener empresas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar proveedores para ingreso directo
     */
    public function listarProveedores()
    {
        try {
            $proveedores = DB::table('proveedor')
                ->select(
                    'id_proveedor',
                    'nombre as razon_social',
                    'ruc'
                )
                ->orderBy('nombre')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $proveedores
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener proveedores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar monedas para ingreso directo
     */
    public function listarMonedas()
    {
        try {
            $monedas = DB::table('moneda')
                ->select(
                    'id_moneda',
                    'tipo_moneda',
                    DB::raw("CASE 
                        WHEN tipo_moneda = 'SOLES' THEN 'Soles Peruanos (S/)'
                        WHEN tipo_moneda = 'DOLARES' THEN 'Dólares Americanos ($)'
                        ELSE tipo_moneda
                    END as descripcion")
                )
                ->orderBy('tipo_moneda')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $monedas
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener monedas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Guardar ingreso directo (sin OC/OS)
     */
    public function guardarIngresoDirecto(Request $request)
    {
        try {
            \Log::info('📥 Datos recibidos en guardarIngresoDirecto:', $request->all());
            
            // Validación
            $validator = Validator::make($request->all(), [
                'numero_ingreso' => 'required',
                'id_empresa' => 'required|exists:empresa,id_empresa',
                'id_proveedor' => 'required|exists:proveedor,id_proveedor',
                'id_bodega' => 'required|exists:bodega,id_bodega',
                'moneda' => 'required',
                'fecha_ingreso' => 'required|date',
                'productos' => 'required|array|min:1',
                'productos.*.codigo_producto' => 'required',
                'productos.*.cantidad' => 'required|numeric|min:0.01',
                'productos.*.precio_unitario' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                \Log::error('❌ Errores de validación:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            \Log::info('✅ Validación pasada, iniciando transacción');
            DB::beginTransaction();

            // Calcular total
            $total = 0;
            foreach ($request->productos as $producto) {
                $subtotal = ($producto['cantidad'] * $producto['precio_unitario']);
                $total += $subtotal;
            }

            // Validación: El total no debe exceder los S/ 500.00
            if ($total > 500) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'El total del ingreso directo no puede exceder los S/ 500.00',
                    'total_calculado' => 'S/ ' . number_format($total, 2)
                ], 400);
            }

            // Insertar ingreso directo
            \Log::info('💾 Insertando en ingreso_directo...');
            $idIngresoDirecto = DB::table('ingreso_directo')->insertGetId([
                'correlativo' => $request->numero_ingreso,
                'id_empresa' => $request->id_empresa,
                'id_proveedor' => $request->id_proveedor,
                'id_bodega' => $request->id_bodega,
                'id_moneda' => is_numeric($request->moneda) ? $request->moneda : (DB::table('moneda')->where('tipo_moneda', $request->moneda)->value('id_moneda') ?? 1),
                'fecha_servicio' => $request->fecha_ingreso,
                'fecha_oc' => $request->fecha_ingreso,
                'fecha_requerida' => $request->fecha_ingreso,
                'igv' => $total * 0.18,
                'total_general' => $total,
                'estado' => 'ACTIVO',
                'usuario_creacion' => auth()->user()->name ?? auth()->user()->email ?? 'sistema',
                'fecha_creacion' => now()
            ]);

            \Log::info('✅ Ingreso directo insertado con ID: ' . $idIngresoDirecto);

            // Insertar detalles
            \Log::info('📦 Procesando productos...');
            foreach ($request->productos as $producto) {
                \Log::info('🔍 Procesando producto: ' . $producto['codigo_producto']);
                
                // Obtener info del producto
                $productoInfo = DB::table('producto')
                    ->where('codigo_producto', $producto['codigo_producto'])
                    ->first();

                if (!$productoInfo) {
                    throw new Exception("Producto no encontrado: {$producto['codigo_producto']}");
                }

                $cantidad = $producto['cantidad'];
                $precioUnitario = $producto['precio_unitario'];
                $subtotal = $cantidad * $precioUnitario;

                // Insertar detalle
                DB::table('detalle_ingreso_directo')->insert([
                    'id_ingreso_directo' => $idIngresoDirecto,
                    'codigo_producto' => $producto['codigo_producto'],
                    'descripcion' => $productoInfo->descripcion,
                    'unidad' => $productoInfo->unidad,
                    'cantidad' => $cantidad,
                    'precio_unitario' => $precioUnitario,
                    'subtotal' => $subtotal,
                    'total' => $subtotal
                ]);
                \Log::info('✅ Detalle insertado');

                // Actualizar o insertar en bodega_stock (tabla correcta)
                // Nota: id_reserva = 1 es la reserva por defecto para ingreso directo
                $stockBodega = DB::table('bodega_stock')
                    ->where('codigo_producto', $producto['codigo_producto'])
                    ->where('id_bodega', $request->id_bodega)
                    ->where('id_reserva', 1)
                    ->first();

                if ($stockBodega) {
                    DB::table('bodega_stock')
                        ->where('codigo_producto', $producto['codigo_producto'])
                        ->where('id_bodega', $request->id_bodega)
                        ->where('id_reserva', 1)
                        ->update([
                            'cantidad_disponible' => $stockBodega->cantidad_disponible + $cantidad
                        ]);
                } else {
                    DB::table('bodega_stock')->insert([
                        'id_bodega' => $request->id_bodega,
                        'id_reserva' => 1,
                        'codigo_producto' => $producto['codigo_producto'],
                        'cantidad_disponible' => $cantidad,
                        'cantidad_reservada' => 0
                    ]);
                }
                \Log::info('✅ Stock bodega actualizado');

                // Insertar movimiento en kardex
                \Log::info('📝 Insertando en kardex...');
                DB::table('movimiento_kardex')->insert([
                    'fecha' => now(),
                    'tipo_movimiento' => 'INGRESO',
                    'codigo_producto' => $producto['codigo_producto'],
                    'descripcion' => $productoInfo->descripcion,
                    'unidad' => $productoInfo->unidad,
                    'cantidad' => $cantidad,
                    'proyecto' => 'Ingreso Directo',
                    'id_bodega' => $request->id_bodega,
                    'documento' => $request->numero_ingreso,
                    'precio_unitario' => $precioUnitario,
                    'observaciones' => "Ingreso Directo {$request->numero_ingreso} | Guía Remisión: {$request->num_guia} | Factura: {$request->factura}"
                ]);
                \Log::info('✅ Kardex insertado');
            }

            \Log::info('🎉 Todos los productos procesados, haciendo commit');
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ingreso directo guardado correctamente',
                'data' => [
                    'id_ingreso' => $idIngresoDirecto,
                    'numero_ingreso' => $request->numero_ingreso
                ]
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('❌ Error al guardar ingreso directo:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar ingreso directo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener historial de ingresos directos
     */
    public function obtenerHistorialDirectos(Request $request)
    {
        try {
            $fechaDesde = $request->input('fecha_desde');
            $fechaHasta = $request->input('fecha_hasta');

            $query = DB::table('ingreso_directo as id')
                ->join('empresa as e', 'id.id_empresa', '=', 'e.id_empresa')
                ->join('proveedor as p', 'id.id_proveedor', '=', 'p.id_proveedor')
                ->leftJoin('moneda as m', 'id.id_moneda', '=', 'm.id_moneda')
                ->select(
                    'id.correlativo as id_ingreso',
                    'id.fecha_oc as fecha_ingreso',
                    'e.razon_social as empresa',
                    'p.nombre as proveedor',
                    'id.destino as proyecto_almacen',
                    'id.total_general as total',
                    'm.tipo_moneda as moneda',
                    DB::raw("'-' as num_guia"),
                    DB::raw("'-' as factura"),
                    'id.usuario_creacion as usuario'
                )
                ->orderBy('id.fecha_oc', 'desc');

            // Aplicar filtros de fecha si existen
            if ($fechaDesde) {
                $query->where('id.fecha_oc', '>=', $fechaDesde);
            }
            if ($fechaHasta) {
                $query->where('id.fecha_oc', '<=', $fechaHasta);
            }

            $historial = $query->get();

            return response()->json([
                'success' => true,
                'data' => $historial
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial de ingresos directos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar PDF de Ingreso de Material
     */
    public function generarPDF($idIngreso)
    {
        try {
            // Intentar obtener usuario autenticado (opcional)
            $firma_usuario = null;
            try {
                $user = JWTAuth::parseToken()->authenticate();
                $firma_usuario = $user->firma ?? null;
            } catch (\Exception $e) {
                // Si no hay token o falla la autenticación, continuar sin firma
                Log::info('PDF generado sin firma - Usuario no autenticado');
            }
            
            // Obtener datos del ingreso
            $ingreso = DB::table('ingreso_material as im')
                ->leftJoin('orden_compra as oc', 'im.id_oc', '=', 'oc.id_oc')
                ->leftJoin('proveedor as p', 'oc.id_proveedor', '=', 'p.id_proveedor')
                ->leftJoin('bodega as b', 'im.id_bodega', '=', 'b.id_bodega')
                ->select(
                    'im.*',
                    'oc.correlativo as correlativo_oc',
                    'p.nombre as razon_social',
                    'p.ruc',
                    'b.nombre as nombre_bodega',
                    'b.ubicacion as ubicacion_bodega'
                )
                ->where('im.id_ingreso', $idIngreso)
                ->first();

            if (!$ingreso) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ingreso no encontrado'
                ], 404);
            }

            // Obtener detalles con información del producto
            $detalles = DB::table('detalle_ingreso_material as dim')
                ->join('producto as prod', 'dim.codigo_producto', '=', 'prod.codigo_producto')
                ->leftJoin('detalle_oc as doc', function($join) use ($ingreso) {
                    $join->on('dim.codigo_producto', '=', 'doc.codigo_producto')
                         ->where('doc.id_oc', '=', $ingreso->id_oc);
                })
                ->select(
                    'dim.*',
                    'prod.descripcion',
                    'prod.unidad',
                    'doc.precio_unitario',
                    DB::raw('dim.cantidad_recibida * COALESCE(doc.precio_unitario, 0) as total')
                )
                ->where('dim.id_ingreso', $idIngreso)
                ->get();

            // Calcular totales
            $subtotal = $detalles->sum('total');
            $igv = $subtotal * 0.18;
            $total = $subtotal + $igv;

            $data = [
                'ingreso' => $ingreso,
                'detalles' => $detalles,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
                'firma_usuario' => $firma_usuario // Firma del usuario logueado (puede ser null)
            ];

            $pdf = PDF::loadView('pdf.ingreso_material', $data);
            return $pdf->stream("Ingreso_Material_{$idIngreso}.pdf");

        } catch (Exception $e) {
            Log::error('Error al generar PDF de ingreso:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al generar PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener reservas disponibles para una bodega específica
     * Retorna TODAS las reservas distintas asociadas a esa bodega
     */
    public function obtenerReservasPorBodega($idBodega)
    {
        try {
            // Obtener TODAS las reservas distintas de la bodega desde proyecto_almacen
            $reservas = DB::table('proyecto_almacen as pa')
                ->join('reserva as r', 'pa.id_reserva', '=', 'r.id_reserva')
                ->where('pa.id_bodega', $idBodega)
                ->where('r.estado', 'ACTIVO')
                ->select('r.id_reserva', 'r.tipo_reserva')
                ->distinct()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reservas
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener reservas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
