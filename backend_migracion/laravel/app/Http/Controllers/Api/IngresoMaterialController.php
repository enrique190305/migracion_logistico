<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Exception;

class IngresoMaterialController extends Controller
{
    /**
     * Listar órdenes pendientes (OC y OS con estado APROBADO o PARCIAL)
     */
    public function listarOrdenesPendientes()
    {
        try {
            // Obtener OC con estado APROBADO o PARCIAL
            $ordenesCompra = DB::table('orden_compra')
                ->whereIn('estado', ['APROBADO', 'PARCIAL'])
                ->select('correlativo', DB::raw("'OC' as tipo"))
                ->orderBy('correlativo')
                ->get();

            // Obtener OS con estado APROBADO o PARCIAL
            $ordenesServicio = DB::table('orden_servicio')
                ->whereIn('estado', ['APROBADO', 'PARCIAL'])
                ->select('correlativo', DB::raw("'OS' as tipo"))
                ->orderBy('correlativo')
                ->get();

            // Combinar ambas colecciones
            $ordenes = $ordenesCompra->concat($ordenesServicio);

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
                    ->where('oc.correlativo', $correlativo)
                    ->select(
                        'oc.id_oc',
                        'oc.correlativo',
                        'p.nombre as proveedor',
                        'oc.fecha_oc as fecha',
                        'oc.estado',
                        'e.razon_social',
                        'e.id_empresa',
                        DB::raw("'OC' as tipo")
                    )
                    ->first();
            } else if (str_starts_with($correlativo, 'OS-')) {
                // Es una Orden de Servicio
                $orden = DB::table('orden_servicio as os')
                    ->join('proveedor as p', 'os.id_proveedor', '=', 'p.id_proveedor')
                    ->join('empresa as e', 'os.id_empresa', '=', 'e.id_empresa')
                    ->where('os.correlativo', $correlativo)
                    ->select(
                        'os.id_os',
                        'os.correlativo',
                        'p.nombre as proveedor',
                        'os.fecha_servicio as fecha',
                        'os.estado',
                        'e.razon_social',
                        'e.id_empresa',
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
                        IFNULL((
                            SELECT SUM(di.cantidad_recibida) 
                            FROM detalle_ingreso_material di
                            INNER JOIN ingreso_material im ON di.id_ingreso = im.id_ingreso
                            WHERE im.id_oc = d.id_oc 
                            AND di.codigo_producto = d.codigo_producto
                        ), 0) as cantidad_recibida,
                        (d.cantidad - IFNULL((
                            SELECT SUM(di.cantidad_recibida) 
                            FROM detalle_ingreso_material di
                            INNER JOIN ingreso_material im ON di.id_ingreso = im.id_ingreso
                            WHERE im.id_oc = d.id_oc 
                            AND di.codigo_producto = d.codigo_producto
                        ), 0)) as saldo,
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
                        IFNULL((
                            SELECT SUM(dc.cantidad_conforme) 
                            FROM detalle_conformidad_servicio dc
                            INNER JOIN conformidad_servicio cs ON dc.id_conformidad = cs.id_conformidad
                            WHERE cs.id_os = d.id_os 
                            AND dc.codigo_servicio = d.codigo_servicio
                        ), 0) as cantidad_recibida,
                        (d.cantidad - IFNULL((
                            SELECT SUM(dc.cantidad_conforme) 
                            FROM detalle_conformidad_servicio dc
                            INNER JOIN conformidad_servicio cs ON dc.id_conformidad = cs.id_conformidad
                            WHERE cs.id_os = d.id_os 
                            AND dc.codigo_servicio = d.codigo_servicio
                        ), 0)) as saldo,
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
            // Obtener el máximo de INGRESO_MATERIAL
            $maxIngreso = DB::table('ingreso_material')
                ->where('id_ingreso', 'LIKE', 'NI-%')
                ->selectRaw("IFNULL(MAX(CAST(SUBSTRING(id_ingreso, 4) AS UNSIGNED)), 0) as max_numero")
                ->value('max_numero');

            // Obtener el máximo de INGRESO_DIRECTO
            $maxDirecto = DB::table('ingreso_directo')
                ->where('id_ingreso', 'LIKE', 'NI-%')
                ->selectRaw("IFNULL(MAX(CAST(SUBSTRING(id_ingreso, 4) AS UNSIGNED)), 0) as max_numero")
                ->value('max_numero');

            $siguiente = max($maxIngreso, $maxDirecto) + 1;
            $numeroIngreso = 'NI-' . str_pad($siguiente, 3, '0', STR_PAD_LEFT);

            return response()->json([
                'success' => true,
                'data' => ['numero_ingreso' => $numeroIngreso]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => true,
                'data' => ['numero_ingreso' => 'NI-001']
            ]);
        }
    }

    /**
     * Guardar ingreso de material (OC) o conformidad de servicio (OS)
     */
    public function guardarIngreso(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'correlativo' => 'required|string',
                'proyecto_almacen' => 'required|string',
                'fecha_ingreso' => 'required|date',
                'num_guia' => 'nullable|string',
                'factura' => 'nullable|string',
                'observaciones' => 'nullable|string',
                'usuario' => 'required|string',
                'productos' => 'required|array|min:1',
                'productos.*.codigo_producto' => 'required|string',
                'productos.*.cantidad_ingresar' => 'required|numeric|min:0.01',
                'productos.*.observaciones' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validación fallida',
                    'errors' => $validator->errors()
                ], 422);
            }

            $correlativo = $request->input('correlativo');
            $esOC = str_starts_with($correlativo, 'OC-');
            $esOS = str_starts_with($correlativo, 'OS-');

            DB::beginTransaction();

            try {
                if ($esOC) {
                    // Guardar como Ingreso de Material
                    $resultado = $this->guardarIngresoMaterial($request);
                } else if ($esOS) {
                    // Guardar como Conformidad de Servicio
                    $resultado = $this->guardarConformidadServicio($request);
                } else {
                    throw new Exception('Tipo de orden no válido');
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => '✅ Ingreso guardado correctamente',
                    'data' => $resultado
                ]);

            } catch (Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (Exception $e) {
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

        // Insertar ingreso de material
        DB::table('ingreso_material')->insert([
            'id_ingreso' => $numeroIngreso,
            'id_oc' => $orden->id_oc,
            'fecha_ingreso' => $request->input('fecha_ingreso'),
            'num_guia' => $request->input('num_guia'),
            'factura' => $request->input('factura'),
            'observaciones' => $request->input('observaciones'),
            'usuario' => $request->input('usuario'),
            'proyecto_almacen' => $request->input('proyecto_almacen')
        ]);

        // Insertar detalles y movimientos kardex
        foreach ($request->input('productos') as $producto) {
            // Insertar detalle
            DB::table('detalle_ingreso_material')->insert([
                'id_ingreso' => $numeroIngreso,
                'codigo_producto' => $producto['codigo_producto'],
                'cantidad_recibida' => $producto['cantidad_ingresar'],
                'observaciones' => $producto['observaciones'] ?? ''
            ]);

            // Obtener precio unitario del detalle de OC
            $detalleOC = DB::table('detalle_oc')
                ->where('id_oc', $orden->id_oc)
                ->where('codigo_producto', $producto['codigo_producto'])
                ->first();

            // Obtener descripción y unidad del producto
            $productoInfo = DB::table('producto')
                ->where('codigo_producto', $producto['codigo_producto'])
                ->first();

            // Insertar en kardex
            DB::table('movimiento_kardex')->insert([
                'fecha' => $request->input('fecha_ingreso'),
                'tipo_movimiento' => 'INGRESO',
                'codigo_producto' => $producto['codigo_producto'],
                'descripcion' => $productoInfo->descripcion ?? '',
                'unidad' => $productoInfo->unidad ?? '',
                'cantidad' => $producto['cantidad_ingresar'],
                'proyecto' => $request->input('proyecto_almacen'),
                'documento' => $numeroIngreso,
                'precio_unitario' => $detalleOC->precio_unitario ?? null,
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
            'usuario' => $request->input('usuario'),
            'proyecto_almacen' => $request->input('proyecto_almacen')
        ]);

        // Insertar detalles
        foreach ($request->input('productos') as $producto) {
            DB::table('detalle_conformidad_servicio')->insert([
                'id_conformidad' => $idConformidad,
                'codigo_servicio' => $producto['codigo_producto'],
                'cantidad_conforme' => $producto['cantidad_ingresar'],
                'observaciones' => $producto['observaciones'] ?? ''
            ]);
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
        // Verificar si quedan productos pendientes
        $pendientes = DB::select("
            SELECT COUNT(*) as total
            FROM detalle_oc d
            WHERE d.id_oc = ?
            AND (IFNULL(d.cantidad, 0) - IFNULL((
                SELECT SUM(di.cantidad_recibida)
                FROM detalle_ingreso_material di
                INNER JOIN ingreso_material im ON di.id_ingreso = im.id_ingreso
                WHERE im.id_oc = d.id_oc
                AND di.codigo_producto = d.codigo_producto
            ), 0)) > 0
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
        // Verificar si quedan servicios pendientes
        $pendientes = DB::select("
            SELECT COUNT(*) as total
            FROM detalle_os d
            WHERE d.id_os = ?
            AND (IFNULL(d.cantidad, 0) - IFNULL((
                SELECT SUM(dc.cantidad_conforme)
                FROM detalle_conformidad_servicio dc
                INNER JOIN conformidad_servicio cs ON dc.id_conformidad = cs.id_conformidad
                WHERE cs.id_os = d.id_os
                AND dc.codigo_servicio = d.codigo_servicio
            ), 0)) > 0
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
                ->select(
                    'im.id_ingreso',
                    'oc.correlativo',
                    'im.fecha_ingreso',
                    'p.nombre as proveedor',
                    'im.proyecto_almacen',
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
                    'tipo_moneda as codigo',
                    'tipo_moneda as descripcion'
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
            // Validación
            $validator = Validator::make($request->all(), [
                'numero_ingreso' => 'required',
                'id_empresa' => 'required|exists:empresa,id_empresa',
                'id_proveedor' => 'required|exists:proveedor,id_proveedor',
                'moneda' => 'required',
                'proyecto_almacen' => 'required',
                'fecha_ingreso' => 'required|date',
                'productos' => 'required|array|min:1',
                'productos.*.codigo_producto' => 'required',
                'productos.*.cantidad' => 'required|numeric|min:0.01',
                'productos.*.precio_unitario' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Calcular total
            $total = 0;
            foreach ($request->productos as $producto) {
                $subtotal = ($producto['cantidad'] * $producto['precio_unitario']);
                $total += $subtotal;
            }

            // Insertar ingreso directo
            $idIngresoDirecto = DB::table('ingreso_directo')->insertGetId([
                'correlativo' => $request->numero_ingreso,
                'id_empresa' => $request->id_empresa,
                'id_proveedor' => $request->id_proveedor,
                'id_moneda' => DB::table('moneda')->where('tipo_moneda', $request->moneda)->value('id_moneda') ?? 1,
                'fecha_oc' => $request->fecha_ingreso,
                'total_general' => $total,
                'estado' => 'COMPLETADO',
                'usuario_creacion' => 'admin', // Temporal
                'fecha_creacion' => now()
            ]);

            // Insertar detalles
            foreach ($request->productos as $producto) {
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

                // Actualizar stock del producto
                $stockActual = $productoInfo->stock_actual ?? 0;
                DB::table('producto')
                    ->where('codigo_producto', $producto['codigo_producto'])
                    ->update([
                        'stock_actual' => $stockActual + $cantidad
                    ]);

                // Insertar movimiento en kardex
                DB::table('movimiento_kardex')->insert([
                    'codigo_producto' => $producto['codigo_producto'],
                    'tipo_movimiento' => 'INGRESO',
                    'documento_referencia' => $request->numero_ingreso,
                    'cantidad' => $cantidad,
                    'precio_unitario' => $precioUnitario,
                    'stock_anterior' => $stockActual,
                    'stock_nuevo' => $stockActual + $cantidad,
                    'fecha_movimiento' => $request->fecha_ingreso,
                    'proyecto_almacen' => $request->proyecto_almacen,
                    'observaciones' => "Ingreso Directo - {$request->num_guia}",
                    'usuario_registro' => 'admin',
                    'fecha_registro' => now()
                ]);
            }

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
}
