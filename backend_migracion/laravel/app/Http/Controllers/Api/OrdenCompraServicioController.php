<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\Proveedor;
use App\Models\Producto;
use App\Models\Moneda;
use App\Models\OrdenCompra;
use App\Models\OrdenServicio;
use App\Models\DetalleOrdenCompra;
use App\Models\DetalleOrdenServicio;
use App\Models\OrdenPedido;
use App\Models\DetalleOrdenPedido;
use App\Models\ProyectoAlmacen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;

class OrdenCompraServicioController extends Controller
{
    /**
     * Obtener todas las empresas
     */
    public function obtenerEmpresas()
    {
        try {
            $empresas = Empresa::select('id_empresa as id', 'razon_social as razonSocial')
                ->orderBy('razon_social')
                ->get();

            return response()->json($empresas, 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al obtener empresas',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todos los proveedores
     */
    public function obtenerProveedores()
    {
        try {
            $proveedores = Proveedor::select(
                    'id_proveedor as id',
                    'nombre',
                    'ruc',
                    'direccion',
                    'contacto',
                    'celular',
                    'correo',
                    'forma_pago as formaPago',
                    'servicio'
                )
                ->orderBy('nombre')
                ->get();

            return response()->json($proveedores, 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al obtener proveedores',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener información detallada de un proveedor
     */
    public function obtenerDetalleProveedor($id)
    {
        try {
            $proveedor = Proveedor::where('id_proveedor', $id)->first();

            if (!$proveedor) {
                return response()->json([
                    'error' => 'Proveedor no encontrado'
                ], 404);
            }

            return response()->json([
                'id' => $proveedor->id_proveedor,
                'nombre' => $proveedor->nombre,
                'ruc' => $proveedor->ruc,
                'direccion' => $proveedor->direccion,
                'contacto' => $proveedor->contacto,
                'celular' => $proveedor->celular,
                'correo' => $proveedor->correo,
                'formaPago' => $proveedor->forma_pago,
                'servicio' => $proveedor->servicio
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al obtener detalle del proveedor',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todos los productos
     */
    public function obtenerProductos()
    {
        try {
            $productos = Producto::select(
                    'codigo_producto as codigo',
                    'descripcion',
                    'unidad',
                    'tipo_producto as tipoProducto'
                )
                ->orderBy('descripcion')
                ->get();

            return response()->json($productos, 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al obtener productos',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar productos por código o descripción (para autocompletado)
     */
    public function buscarProductos(Request $request)
    {
        try {
            $termino = $request->query('termino', '');
            
            $productos = Producto::buscar($termino)
                ->select(
                    'codigo_producto as codigo',
                    'descripcion',
                    'unidad',
                    'tipo_producto as tipoProducto'
                )
                ->limit(20)
                ->get();

            return response()->json($productos, 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al buscar productos',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener producto por código exacto
     */
    public function obtenerProductoPorCodigo($codigo)
    {
        try {
            $producto = Producto::where('codigo_producto', $codigo)->first();

            if (!$producto) {
                return response()->json([
                    'error' => 'Producto no encontrado'
                ], 404);
            }

            return response()->json([
                'codigo' => $producto->codigo_producto,
                'descripcion' => $producto->descripcion,
                'unidad' => $producto->unidad,
                'tipoProducto' => $producto->tipo_producto
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al obtener producto',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validar si un producto existe por código
     */
    public function validarProducto($codigo)
    {
        try {
            $existe = Producto::where('codigo_producto', $codigo)->exists();

            return response()->json([
                'existe' => $existe
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al validar producto',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todas las monedas
     */
    public function obtenerMonedas()
    {
        try {
            $monedas = Moneda::all()->map(function ($moneda) {
                // Determinar el símbolo según el tipo de moneda
                $simbolo = 'S/'; // Por defecto SOLES
                if (stripos($moneda->tipo_moneda, 'DOLAR') !== false || 
                    stripos($moneda->tipo_moneda, 'DÓLAR') !== false) {
                    $simbolo = '$';
                }
                
                return [
                    'id' => $moneda->id_moneda,
                    'nombre' => $moneda->tipo_moneda,
                    'simbolo' => $simbolo
                ];
            });

            return response()->json($monedas, 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al obtener monedas',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener órdenes de pedido en estado PENDIENTE
     */
    public function obtenerOrdenesPedidoPendientes()
    {
        try {
            $ordenes = OrdenPedido::with(['empresa', 'proyecto', 'detalles.producto'])
                ->where('estado', 'PENDIENTE')
                ->orderBy('fecha_pedido', 'desc')
                ->get()
                ->map(function ($orden) {
                    return [
                        'id_orden_pedido' => $orden->id_orden_pedido,
                        'correlativo' => $orden->correlativo,
                        'id_empresa' => $orden->id_empresa,
                        'razon_social' => $orden->empresa ? $orden->empresa->razon_social : null,
                        'id_proyecto_almacen' => $orden->id_proyecto_almacen,
                        'proyecto_nombre' => $orden->proyectoAlmacen ? $orden->proyectoAlmacen->nombre_proyecto : null,
                        'codigo_proyecto' => $orden->proyectoAlmacen ? $orden->proyectoAlmacen->codigo_proyecto : null,
                        'tipo_movil' => $orden->proyectoAlmacen ? $orden->proyectoAlmacen->tipo_movil : null,
                        'fecha_pedido' => $orden->fecha_pedido,
                        'observacion' => $orden->observacion,
                        'detalles' => $orden->detalles->map(function ($detalle) {
                            return [
                                'id_detalle' => $detalle->id_detalle_pedido,
                                'codigo_producto' => $detalle->codigo_producto,
                                'descripcion' => $detalle->producto ? $detalle->producto->descripcion : null,
                                'unidad_medida' => $detalle->producto ? $detalle->producto->unidad : null,
                                'cantidad_solicitada' => $detalle->cantidad_solicitada,
                                'observacion' => $detalle->observacion
                            ];
                        })
                    ];
                });

            return response()->json($ordenes, 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al obtener órdenes de pedido pendientes',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalle de una orden de pedido específica
     */
    public function obtenerOrdenPedido($id)
    {
        try {
            $orden = OrdenPedido::with(['empresa', 'proyectoAlmacen', 'detalles.producto'])
                ->where('id_orden_pedido', $id)
                ->first();

            if (!$orden) {
                return response()->json([
                    'error' => 'Orden de pedido no encontrada'
                ], 404);
            }

            // Obtener el proyecto almacen y su bodega
            $proyectoAlmacen = $orden->proyectoAlmacen;
            $bodega = null;
            if ($proyectoAlmacen && $proyectoAlmacen->id_bodega) {
                $bodega = DB::table('bodega')
                    ->where('id_bodega', $proyectoAlmacen->id_bodega)
                    ->first();
            }

            return response()->json([
                'id_orden_pedido' => $orden->id_orden_pedido,
                'correlativo' => $orden->correlativo,
                'id_empresa' => $orden->id_empresa,
                'razon_social' => $orden->empresa ? $orden->empresa->razon_social : null,
                'id_proyecto_almacen' => $orden->id_proyecto, // Campo correcto
                'proyecto_nombre' => $proyectoAlmacen ? $proyectoAlmacen->nombre_proyecto : null,
                'proyecto_bodega' => $bodega ? $bodega->nombre : null, // Agregar nombre de bodega
                'codigo_proyecto' => $proyectoAlmacen ? $proyectoAlmacen->codigo_proyecto : null,
                'tipo_movil' => $proyectoAlmacen ? $proyectoAlmacen->tipo_movil : null,
                'fecha_pedido' => $orden->fecha_pedido,
                'observacion' => $orden->observacion,
                'estado' => $orden->estado,
                'detalles' => $orden->detalles->map(function ($detalle) {
                    return [
                        'id_detalle' => $detalle->id_detalle_pedido,
                        'codigo_producto' => $detalle->codigo_producto,
                        'descripcion' => $detalle->producto ? $detalle->producto->descripcion : null,
                        'unidad_medida' => $detalle->producto ? $detalle->producto->unidad : null,
                        'cantidad_solicitada' => $detalle->cantidad_solicitada,
                        'observacion' => $detalle->observacion
                    ];
                })
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al obtener orden de pedido',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener siguiente correlativo para Orden de Compra
     */
    public function obtenerSiguienteCorrelativoOC()
    {
        try {
            $ultimaOrden = OrdenCompra::orderBy('id_oc', 'desc')->first();
            
            if (!$ultimaOrden) {
                $correlativo = 'OC-0001';
            } else {
                // Extraer el número del último correlativo
                $ultimoNumero = intval(substr($ultimaOrden->correlativo, 3));
                $nuevoNumero = $ultimoNumero + 1;
                $correlativo = 'OC-' . str_pad($nuevoNumero, 4, '0', STR_PAD_LEFT);
            }
            
            return response()->json([
                'correlativo' => $correlativo
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al obtener correlativo',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener siguiente correlativo para Orden de Servicio
     */
    public function obtenerSiguienteCorrelativoOS()
    {
        try {
            $ultimaOrden = OrdenServicio::orderBy('id_os', 'desc')->first();
            
            if (!$ultimaOrden) {
                $correlativo = 'OS-0001';
            } else {
                // Extraer el número del último correlativo
                $ultimoNumero = intval(substr($ultimaOrden->correlativo, 3));
                $nuevoNumero = $ultimoNumero + 1;
                $correlativo = 'OS-' . str_pad($nuevoNumero, 4, '0', STR_PAD_LEFT);
            }
            
            return response()->json([
                'correlativo' => $correlativo
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al obtener correlativo',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Guardar Orden de Compra con sus detalles
     * Incluye lógica de compra directa (<= 500) y vinculación con Orden de Pedido
     */
    public function guardarOrdenCompra(Request $request)
    {
        // Validación de datos
        $validator = Validator::make($request->all(), [
            'id_orden_pedido' => 'nullable|integer|exists:orden_pedido,id_orden_pedido',
            'correlativo' => 'required|string|max:20',
            'id_empresa' => 'required|integer|exists:empresa,id_empresa',
            'id_proveedor' => 'required|integer|exists:proveedor,id_proveedor',
            'id_moneda' => 'required|integer|exists:moneda,id_moneda',
            'fecha_oc' => 'required|date',
            'fecha_requerida' => 'nullable|date',
            'igv' => 'required|numeric|min:0',
            'total_general' => 'required|numeric|min:0',
            'estado' => 'nullable|string|max:50',
            'detalles' => 'required|array|min:1',
            'detalles.*.codigo_producto' => 'required|string|exists:producto,codigo_producto',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
            'detalles.*.subtotal' => 'required|numeric|min:0',
            'detalles.*.total' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Datos inválidos',
                'errores' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Si tiene orden de pedido, validar que esté pendiente y obtener proyecto
            $ordenPedido = null;
            $nombreProyecto = null;
            
            if ($request->id_orden_pedido) {
                $ordenPedido = OrdenPedido::with('proyecto')
                    ->where('id_orden_pedido', $request->id_orden_pedido)
                    ->where('estado', 'PENDIENTE')
                    ->first();

                if (!$ordenPedido) {
                    return response()->json([
                        'error' => 'Orden de pedido no válida',
                        'mensaje' => 'La orden de pedido no existe o ya fue procesada'
                    ], 422);
                }

                // Obtener nombre del proyecto
                if ($ordenPedido->proyecto) {
                    $nombreProyecto = $ordenPedido->proyecto->nombre_proyecto;
                }
            }

            // Determinar si es compra directa (total <= 500) y tiene orden de pedido
            $esCompraDirecta = $request->total_general <= 500 && $ordenPedido;

            if ($esCompraDirecta) {
                // COMPRA DIRECTA: Registrar directamente en Kardex como INGRESO
                
                // Obtener el proveedor para el documento
                $proveedor = Proveedor::find($request->id_proveedor);
                $documentoCompra = "CD-{$request->correlativo}";
                
                // Registrar cada producto en el Kardex
                foreach ($request->detalles as $detalle) {
                    // Obtener información del producto
                    $producto = Producto::where('codigo_producto', $detalle['codigo_producto'])->first();
                    
                    if (!$producto) {
                        throw new Exception("Producto no encontrado: {$detalle['codigo_producto']}");
                    }

                    // Insertar movimiento de INGRESO en Kardex
                    DB::table('movimiento_kardex')->insert([
                        'fecha' => now(),
                        'tipo_movimiento' => 'INGRESO',
                        'codigo_producto' => $detalle['codigo_producto'],
                        'descripcion' => $producto->descripcion,
                        'unidad' => $producto->unidad,
                        'cantidad' => $detalle['cantidad'],
                        'proyecto' => $nombreProyecto ?? 'Sin proyecto',
                        'documento' => $documentoCompra,
                        'precio_unitario' => $detalle['precio_unitario'],
                        'observaciones' => "COMPRA DIRECTA - Proveedor: {$proveedor->nombre} - Total: S/ {$request->total_general}"
                    ]);
                }
                
                // Actualizar estado de orden de pedido a COMPLETADO
                $ordenPedido->update([
                    'estado_compra' => 'COMPRA_DIRECTA',
                    'estado' => 'COMPLETADO',
                    'fecha_modificacion' => now(),
                    'usuario_modificacion' => $request->usuario ?? 'sistema'
                ]);

                DB::commit();

                return response()->json([
                    'mensaje' => 'Compra directa registrada exitosamente en Kardex',
                    'tipo' => 'COMPRA_DIRECTA',
                    'total' => $request->total_general,
                    'orden_pedido' => $ordenPedido->correlativo,
                    'proyecto' => $nombreProyecto,
                    'documento' => $documentoCompra,
                    'productos_registrados' => count($request->detalles)
                ], 201);

            } else {
                // ORDEN DE COMPRA NORMAL
                $ordenCompra = OrdenCompra::create([
                    'correlativo' => $request->correlativo,
                    'id_empresa' => $request->id_empresa,
                    'id_orden_pedido' => $request->id_orden_pedido,
                    'id_proveedor' => $request->id_proveedor,
                    'id_moneda' => $request->id_moneda,
                    'fecha_oc' => $request->fecha_oc,
                    'fecha_requerida' => $request->fecha_requerida,
                    'igv' => $request->igv,
                    'total_general' => $request->total_general,
                    'estado' => $request->estado ?? 'PENDIENTE',
                    'usuario_creacion' => $request->usuario ?? 'sistema',
                    'fecha_creacion' => now()
                ]);

                // Crear detalles de la orden
                foreach ($request->detalles as $detalle) {
                    DetalleOrdenCompra::create([
                        'id_oc' => $ordenCompra->id_oc,
                        'codigo_producto' => $detalle['codigo_producto'],
                        'cantidad' => $detalle['cantidad'],
                        'precio_unitario' => $detalle['precio_unitario'],
                        'subtotal' => $detalle['subtotal'],
                        'total' => $detalle['total']
                    ]);
                }

                // Si tiene orden de pedido, actualizar su estado a COMPLETADO
                if ($ordenPedido) {
                    $ordenPedido->update([
                        'estado_compra' => 'OC_GENERADA',
                        'estado' => 'COMPLETADO',
                        'fecha_modificacion' => now(),
                        'usuario_modificacion' => $request->usuario ?? 'sistema'
                    ]);
                }

                DB::commit();

                return response()->json([
                    'mensaje' => 'Orden de compra creada exitosamente',
                    'tipo' => 'ORDEN_COMPRA',
                    'id' => $ordenCompra->id_oc, // Para el frontend
                    'id_oc' => $ordenCompra->id_oc,
                    'correlativo' => $ordenCompra->correlativo,
                    'total' => $ordenCompra->total_general,
                    'orden_pedido' => $ordenPedido ? $ordenPedido->correlativo : null,
                    'estado_compra' => $ordenPedido ? 'COMPLETADO' : null
                ], 201);
            }

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al procesar la orden',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Guardar Orden de Servicio con sus detalles
     */
    public function guardarOrdenServicio(Request $request)
    {
        // Validación de datos
        $validator = Validator::make($request->all(), [
            'id_orden_pedido' => 'nullable|integer|exists:orden_pedido,id_orden_pedido',
            'correlativo' => 'required|string|max:20',
            'id_empresa' => 'required|integer|exists:empresa,id_empresa',
            'id_proveedor' => 'required|integer|exists:proveedor,id_proveedor',
            'id_moneda' => 'required|integer|exists:moneda,id_moneda',
            'fecha_servicio' => 'required|date',
            'fecha_requerida' => 'nullable|date',
            'contacto' => 'nullable|string|max:100',
            'celular' => 'nullable|string|max:20',
            'correo' => 'nullable|email|max:100',
            'destino' => 'nullable|string|max:255',
            'latitud' => 'nullable|string|max:50',
            'longitud' => 'nullable|string|max:50',
            'igv' => 'required|numeric|min:0',
            'total_general' => 'required|numeric|min:0',
            'estado' => 'nullable|string|max:50',
            'detalles' => 'required|array|min:1',
            'detalles.*.codigo_servicio' => 'required|string|max:20',
            'detalles.*.descripcion' => 'required|string|max:255',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.unidad' => 'required|string|max:20',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
            'detalles.*.subtotal' => 'required|numeric|min:0',
            'detalles.*.total' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Datos inválidos',
                'errores' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Crear Orden de Servicio
            $ordenServicio = OrdenServicio::create([
                'correlativo' => $request->correlativo,
                'id_empresa' => $request->id_empresa,
                'id_orden_pedido' => $request->id_orden_pedido,
                'id_proveedor' => $request->id_proveedor,
                'id_moneda' => $request->id_moneda,
                'fecha_servicio' => $request->fecha_servicio,
                'fecha_requerida' => $request->fecha_requerida,
                'contacto' => $request->contacto,
                'celular' => $request->celular,
                'correo' => $request->correo,
                'destino' => $request->destino,
                'latitud' => $request->latitud,
                'longitud' => $request->longitud,
                'igv' => $request->igv,
                'total_general' => $request->total_general,
                'estado' => $request->estado ?? 'PENDIENTE',
                'usuario_creacion' => $request->usuario ?? 'sistema',
                'fecha_creacion' => now()
            ]);

            // Crear detalles de la orden
            foreach ($request->detalles as $detalle) {
                DetalleOrdenServicio::create([
                    'id_os' => $ordenServicio->id_os,
                    'codigo_servicio' => $detalle['codigo_servicio'],
                    'descripcion' => $detalle['descripcion'],
                    'cantidad' => $detalle['cantidad'],
                    'unidad' => $detalle['unidad'],
                    'precio_unitario' => $detalle['precio_unitario'],
                    'subtotal' => $detalle['subtotal'],
                    'total' => $detalle['total']
                ]);
            }

            // Si tiene orden de pedido, actualizar su estado a COMPLETADO
            if ($request->id_orden_pedido) {
                $ordenPedido = OrdenPedido::find($request->id_orden_pedido);
                if ($ordenPedido) {
                    $ordenPedido->update([
                        'estado_compra' => 'OS_GENERADA',
                        'estado' => 'COMPLETADO',
                        'fecha_modificacion' => now(),
                        'usuario_modificacion' => $request->usuario ?? 'sistema'
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'mensaje' => 'Orden de servicio creada exitosamente',
                'tipo' => 'ORDEN_SERVICIO',
                'id' => $ordenServicio->id_os, // Para el frontend
                'id_os' => $ordenServicio->id_os,
                'correlativo' => $ordenServicio->correlativo,
                'total' => $ordenServicio->total_general,
                'estado_compra' => $request->id_orden_pedido ? 'COMPLETADO' : null
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al guardar orden de servicio',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar todas las Órdenes de Compra
     * GET /api/ordenes/compra
     */
    public function listarOrdenesCompra()
    {
        try {
            $ordenesCompra = OrdenCompra::with(['proveedor:id_proveedor,nombre,ruc', 'empresa:id_empresa,razon_social'])
                ->where('estado', '!=', 'ANULADO') // Filtrar órdenes anuladas
                ->select(
                    'id_oc',
                    'correlativo',
                    'id_proveedor',
                    'id_empresa',
                    'fecha_oc',
                    'total_general',
                    'estado'
                )
                ->orderBy('fecha_oc', 'desc')
                ->get()
                ->map(function($oc) {
                    return [
                        'id' => $oc->id_oc,
                        'correlativo' => $oc->correlativo,
                        'proveedor' => [
                            'id' => $oc->proveedor->id_proveedor ?? null,
                            'nombre' => $oc->proveedor->nombre ?? 'N/A',
                            'ruc' => $oc->proveedor->ruc ?? 'N/A'
                        ],
                        'empresa' => [
                            'id' => $oc->empresa->id_empresa ?? null,
                            'razon_social' => $oc->empresa->razon_social ?? 'N/A'
                        ],
                        'fecha_emision' => $oc->fecha_oc,
                        'total_general' => $oc->total_general,
                        'estado' => $oc->estado
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $ordenesCompra,
                'total' => $ordenesCompra->count()
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al listar órdenes de compra',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar todas las Órdenes de Servicio
     * GET /api/ordenes/servicio
     */
    public function listarOrdenesServicio()
    {
        try {
            $ordenesServicio = OrdenServicio::with(['proveedor:id_proveedor,nombre,ruc', 'empresa:id_empresa,razon_social'])
                ->where('estado', '!=', 'ANULADO') // Filtrar órdenes anuladas
                ->select(
                    'id_os',
                    'correlativo',
                    'id_proveedor',
                    'id_empresa',
                    'fecha_servicio',
                    'total_general',
                    'estado'
                )
                ->orderBy('fecha_servicio', 'desc')
                ->get()
                ->map(function($os) {
                    return [
                        'id' => $os->id_os,
                        'correlativo' => $os->correlativo,
                        'proveedor' => [
                            'id' => $os->proveedor->id_proveedor ?? null,
                            'nombre' => $os->proveedor->nombre ?? 'N/A',
                            'ruc' => $os->proveedor->ruc ?? 'N/A'
                        ],
                        'empresa' => [
                            'id' => $os->empresa->id_empresa ?? null,
                            'razon_social' => $os->empresa->razon_social ?? 'N/A'
                        ],
                        'fecha_emision' => $os->fecha_servicio,
                        'total_general' => $os->total_general,
                        'estado' => $os->estado
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $ordenesServicio,
                'total' => $ordenesServicio->count()
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al listar órdenes de servicio',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar Órdenes de Compra PENDIENTES (para interfaz de Eliminar)
     * GET /api/ordenes/compra/pendientes
     */
    public function listarOrdenesCompraPendientes()
    {
        try {
            $ordenesCompra = OrdenCompra::with(['proveedor:id_proveedor,nombre,ruc', 'empresa:id_empresa,razon_social'])
                ->where('estado', 'PENDIENTE') // Solo PENDIENTES
                ->select(
                    'id_oc',
                    'correlativo',
                    'id_proveedor',
                    'id_empresa',
                    'fecha_oc',
                    'total_general',
                    'estado'
                )
                ->orderBy('fecha_oc', 'desc')
                ->get()
                ->map(function($oc) {
                    return [
                        'id' => $oc->id_oc,
                        'correlativo' => $oc->correlativo,
                        'proveedor' => [
                            'id' => $oc->proveedor->id_proveedor ?? null,
                            'nombre' => $oc->proveedor->nombre ?? 'N/A',
                            'ruc' => $oc->proveedor->ruc ?? 'N/A'
                        ],
                        'empresa' => [
                            'id' => $oc->empresa->id_empresa ?? null,
                            'razon_social' => $oc->empresa->razon_social ?? 'N/A'
                        ],
                        'fecha_emision' => $oc->fecha_oc,
                        'total_general' => $oc->total_general,
                        'estado' => $oc->estado
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $ordenesCompra,
                'total' => $ordenesCompra->count()
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al listar órdenes de compra pendientes',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar Órdenes de Servicio PENDIENTES (para interfaz de Eliminar)
     * GET /api/ordenes/servicio/pendientes
     */
    public function listarOrdenesServicioPendientes()
    {
        try {
            $ordenesServicio = OrdenServicio::with(['proveedor:id_proveedor,nombre,ruc', 'empresa:id_empresa,razon_social'])
                ->where('estado', 'PENDIENTE') // Solo PENDIENTES
                ->select(
                    'id_os',
                    'correlativo',
                    'id_proveedor',
                    'id_empresa',
                    'fecha_servicio',
                    'total_general',
                    'estado'
                )
                ->orderBy('fecha_servicio', 'desc')
                ->get()
                ->map(function($os) {
                    return [
                        'id' => $os->id_os,
                        'correlativo' => $os->correlativo,
                        'proveedor' => [
                            'id' => $os->proveedor->id_proveedor ?? null,
                            'nombre' => $os->proveedor->nombre ?? 'N/A',
                            'ruc' => $os->proveedor->ruc ?? 'N/A'
                        ],
                        'empresa' => [
                            'id' => $os->empresa->id_empresa ?? null,
                            'razon_social' => $os->empresa->razon_social ?? 'N/A'
                        ],
                        'fecha_emision' => $os->fecha_servicio,
                        'total_general' => $os->total_general,
                        'estado' => $os->estado
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $ordenesServicio,
                'total' => $ordenesServicio->count()
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al listar órdenes de servicio pendientes',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar Órdenes de Compra para HISTORIAL/REPORTERÍA (incluye ANULADO)
     * GET /api/ordenes/compra/historial
     */
    public function listarOrdenesCompraHistorial()
    {
        try {
            $ordenesCompra = OrdenCompra::with(['proveedor:id_proveedor,nombre,ruc', 'empresa:id_empresa,razon_social'])
                // Sin filtro de estado - muestra TODOS incluyendo ANULADO
                ->select(
                    'id_oc',
                    'correlativo',
                    'id_proveedor',
                    'id_empresa',
                    'fecha_oc',
                    'total_general',
                    'estado'
                )
                ->orderBy('fecha_oc', 'desc')
                ->get()
                ->map(function($oc) {
                    return [
                        'id' => $oc->id_oc,
                        'correlativo' => $oc->correlativo,
                        'proveedor' => [
                            'id' => $oc->proveedor->id_proveedor ?? null,
                            'nombre' => $oc->proveedor->nombre ?? 'N/A',
                            'ruc' => $oc->proveedor->ruc ?? 'N/A'
                        ],
                        'empresa' => [
                            'id' => $oc->empresa->id_empresa ?? null,
                            'razon_social' => $oc->empresa->razon_social ?? 'N/A'
                        ],
                        'fecha_emision' => $oc->fecha_oc,
                        'total_general' => $oc->total_general,
                        'estado' => $oc->estado
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $ordenesCompra,
                'total' => $ordenesCompra->count()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al listar historial de órdenes de compra',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar Órdenes de Servicio para HISTORIAL/REPORTERÍA (incluye ANULADO)
     * GET /api/ordenes/servicio/historial
     */
    public function listarOrdenesServicioHistorial()
    {
        try {
            $ordenesServicio = OrdenServicio::with(['proveedor:id_proveedor,nombre,ruc', 'empresa:id_empresa,razon_social'])
                // Sin filtro de estado - muestra TODOS incluyendo ANULADO
                ->select(
                    'id_os',
                    'correlativo',
                    'id_proveedor',
                    'id_empresa',
                    'fecha_servicio',
                    'total_general',
                    'estado'
                )
                ->orderBy('fecha_servicio', 'desc')
                ->get()
                ->map(function($os) {
                    return [
                        'id' => $os->id_os,
                        'correlativo' => $os->correlativo,
                        'proveedor' => [
                            'id' => $os->proveedor->id_proveedor ?? null,
                            'nombre' => $os->proveedor->nombre ?? 'N/A',
                            'ruc' => $os->proveedor->ruc ?? 'N/A'
                        ],
                        'empresa' => [
                            'id' => $os->empresa->id_empresa ?? null,
                            'razon_social' => $os->empresa->razon_social ?? 'N/A'
                        ],
                        'fecha_emision' => $os->fecha_servicio,
                        'total_general' => $os->total_general,
                        'estado' => $os->estado
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $ordenesServicio,
                'total' => $ordenesServicio->count()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al listar historial de órdenes de servicio',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalle de una Orden de Compra específica
     * GET /api/ordenes/compra/{id}
     */
    public function obtenerDetalleOrdenCompra($id)
    {
        try {
            $ordenCompra = OrdenCompra::with([
                'proveedor:id_proveedor,nombre,ruc,direccion,celular',
                'empresa:id_empresa,razon_social',
                'moneda:id_moneda,tipo_moneda',
                'detalles.producto'
            ])->findOrFail($id);

            $detalles = $ordenCompra->detalles->map(function($detalle) {
                return [
                    'id' => $detalle->id_detalle,
                    'codigo' => $detalle->codigo_producto ?? 'N/A', // Usar codigo_producto del detalle
                    'descripcion' => $detalle->producto->descripcion ?? 'N/A',
                    'cantidad' => $detalle->cantidad,
                    'unidad' => $detalle->producto->unidad ?? 'UND',
                    'precio' => $detalle->precio_unitario,
                    'subtotal' => $detalle->subtotal,
                    'total' => $detalle->total
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $ordenCompra->id_oc,
                    'correlativo' => $ordenCompra->correlativo,
                    'proveedor' => [
                        'id' => $ordenCompra->proveedor->id_proveedor ?? null,
                        'nombre' => $ordenCompra->proveedor->nombre ?? 'N/A',
                        'ruc' => $ordenCompra->proveedor->ruc ?? 'N/A',
                        'direccion' => $ordenCompra->proveedor->direccion ?? 'N/A',
                        'celular' => $ordenCompra->proveedor->celular ?? 'N/A'
                    ],
                    'empresa' => [
                        'id' => $ordenCompra->empresa->id_empresa ?? null,
                        'razon_social' => $ordenCompra->empresa->razon_social ?? 'N/A'
                    ],
                    'moneda' => [
                        'id' => $ordenCompra->moneda->id_moneda ?? null,
                        'tipo_moneda' => $ordenCompra->moneda->tipo_moneda ?? 'SOLES'
                    ],
                    'fecha_emision' => $ordenCompra->fecha_oc,
                    'total_general' => $ordenCompra->total_general,
                    'estado' => $ordenCompra->estado,
                    'detalles' => $detalles,
                    'total_items' => $detalles->count()
                ]
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener detalle de orden de compra',
                'mensaje' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Obtener detalle de una Orden de Servicio específica
     * GET /api/ordenes/servicio/{id}
     */
    public function obtenerDetalleOrdenServicio($id)
    {
        try {
            $ordenServicio = OrdenServicio::with([
                'proveedor:id_proveedor,nombre,ruc,direccion,celular',
                'empresa:id_empresa,razon_social',
                'moneda:id_moneda,tipo_moneda',
                'detalles' // Sin producto porque OS no tiene esa relación
            ])->findOrFail($id);

            $detalles = $ordenServicio->detalles->map(function($detalle) {
                return [
                    'id' => $detalle->id_detalle_os,
                    'codigo' => $detalle->codigo_servicio ?? 'N/A', // Usar codigo_servicio del detalle
                    'descripcion' => $detalle->descripcion ?? 'N/A',
                    'cantidad' => $detalle->cantidad,
                    'unidad' => $detalle->unidad ?? 'UND',
                    'precio' => $detalle->precio_unitario,
                    'subtotal' => $detalle->subtotal,
                    'total' => $detalle->total
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $ordenServicio->id_os,
                    'correlativo' => $ordenServicio->correlativo,
                    'proveedor' => [
                        'id' => $ordenServicio->proveedor->id_proveedor ?? null,
                        'nombre' => $ordenServicio->proveedor->nombre ?? 'N/A',
                        'ruc' => $ordenServicio->proveedor->ruc ?? 'N/A',
                        'direccion' => $ordenServicio->proveedor->direccion ?? 'N/A',
                        'celular' => $ordenServicio->proveedor->celular ?? 'N/A'
                    ],
                    'empresa' => [
                        'id' => $ordenServicio->empresa->id_empresa ?? null,
                        'razon_social' => $ordenServicio->empresa->razon_social ?? 'N/A'
                    ],
                    'moneda' => [
                        'id' => $ordenServicio->moneda->id_moneda ?? null,
                        'tipo_moneda' => $ordenServicio->moneda->tipo_moneda ?? 'SOLES'
                    ],
                    'fecha_emision' => $ordenServicio->fecha_servicio,
                    'total_general' => $ordenServicio->total_general,
                    'estado' => $ordenServicio->estado,
                    'detalles' => $detalles,
                    'total_items' => $detalles->count()
                ]
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener detalle de orden de servicio',
                'mensaje' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Eliminar Orden de Compra
     * DELETE /api/ordenes/compra/{id}
     */
    public function eliminarOrdenCompra($id)
    {
        DB::beginTransaction();
        
        try {
            // Buscar la orden de compra
            $ordenCompra = OrdenCompra::findOrFail($id);
            
            // Validar que se pueda anular (solo si está en estado PENDIENTE)
            if ($ordenCompra->estado !== 'PENDIENTE') {
                return response()->json([
                    'success' => false,
                    'error' => 'No se puede anular',
                    'mensaje' => 'Solo se pueden anular órdenes en estado PENDIENTE. Estado actual: ' . $ordenCompra->estado
                ], 400);
            }

            // Obtener información antes de anular
            $correlativo = $ordenCompra->correlativo;
            $cantidadDetalles = $ordenCompra->detalles()->count();
            $totalGeneral = $ordenCompra->total_general;

            // Cambiar estado a ANULADO en lugar de eliminar
            $ordenCompra->estado = 'ANULADO';
            $ordenCompra->fecha_modificacion = now();
            $ordenCompra->usuario_modificacion = 'admin'; // TODO: Obtener usuario autenticado
            $ordenCompra->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'mensaje' => 'Orden de Compra anulada correctamente',
                'data' => [
                    'id' => $id,
                    'correlativo' => $correlativo,
                    'detalles' => $cantidadDetalles,
                    'total_general' => $totalGeneral,
                    'estado' => 'ANULADO'
                ]
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Orden de Compra no encontrada',
                'mensaje' => 'No existe una orden de compra con el ID: ' . $id
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al anular orden de compra',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar Orden de Servicio
     * DELETE /api/ordenes/servicio/{id}
     */
    public function eliminarOrdenServicio($id)
    {
        DB::beginTransaction();
        
        try {
            // Buscar la orden de servicio
            $ordenServicio = OrdenServicio::findOrFail($id);
            
            // Validar que se pueda anular (solo si está en estado PENDIENTE)
            if ($ordenServicio->estado !== 'PENDIENTE') {
                return response()->json([
                    'success' => false,
                    'error' => 'No se puede anular',
                    'mensaje' => 'Solo se pueden anular órdenes en estado PENDIENTE. Estado actual: ' . $ordenServicio->estado
                ], 400);
            }

            // Obtener información antes de anular
            $correlativo = $ordenServicio->correlativo;
            $cantidadDetalles = $ordenServicio->detalles()->count();
            $totalGeneral = $ordenServicio->total_general;

            // Cambiar estado a ANULADO en lugar de eliminar
            $ordenServicio->estado = 'ANULADO';
            $ordenServicio->fecha_modificacion = now();
            $ordenServicio->usuario_modificacion = 'admin'; // TODO: Obtener usuario autenticado
            $ordenServicio->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'mensaje' => 'Orden de Servicio anulada correctamente',
                'data' => [
                    'id' => $id,
                    'correlativo' => $correlativo,
                    'detalles' => $cantidadDetalles,
                    'total_general' => $totalGeneral,
                    'estado' => 'ANULADO'
                ]
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Orden de Servicio no encontrada',
                'mensaje' => 'No existe una orden de servicio con el ID: ' . $id
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al anular orden de servicio',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar PDF de Orden de Compra
     * 
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function generarPDFOrdenCompra($id)
    {
        try {
            // Obtener la orden con sus relaciones
            $orden = OrdenCompra::with(['empresa', 'proveedor.banco', 'moneda', 'detalles'])
                ->findOrFail($id);

            // Generar el PDF con la vista
            $pdf = Pdf::loadView('pdf.orden_compra', [
                'orden' => $orden
            ]);

            // Configurar orientación y tamaño de página
            $pdf->setPaper('A4', 'portrait');

            // Descargar el PDF
            return $pdf->download("Orden_Compra_{$orden->correlativo}.pdf");

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de Compra no encontrada'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar PDF de Orden de Servicio
     * 
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function generarPDFOrdenServicio($id)
    {
        try {
            // Obtener la orden con sus relaciones
            $orden = OrdenServicio::with(['empresa', 'proveedor.banco', 'moneda', 'detalles'])
                ->findOrFail($id);

            // Generar el PDF con la vista
            $pdf = Pdf::loadView('pdf.orden_servicio', [
                'orden' => $orden
            ]);

            // Configurar orientación y tamaño de página
            $pdf->setPaper('A4', 'portrait');

            // Descargar el PDF
            return $pdf->download("Orden_Servicio_{$orden->numero_os}.pdf");

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de Servicio no encontrada'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el PDF: ' . $e->getMessage()
            ], 500);
        }
    }
}
