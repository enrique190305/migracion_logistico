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
                        'id_proyecto' => $orden->id_proyecto,
                        'proyecto_nombre' => $orden->proyecto ? $orden->proyecto->nombre_proyecto : null,
                        'proyecto_bodega' => $orden->proyecto ? $orden->proyecto->bodega : null,
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
            $orden = OrdenPedido::with(['empresa', 'proyecto', 'detalles.producto'])
                ->where('id_orden_pedido', $id)
                ->first();

            if (!$orden) {
                return response()->json([
                    'error' => 'Orden de pedido no encontrada'
                ], 404);
            }

            return response()->json([
                'id_orden_pedido' => $orden->id_orden_pedido,
                'correlativo' => $orden->correlativo,
                'id_empresa' => $orden->id_empresa,
                'razon_social' => $orden->empresa ? $orden->empresa->razon_social : null,
                'id_proyecto' => $orden->id_proyecto,
                'proyecto_nombre' => $orden->proyecto ? $orden->proyecto->nombre_proyecto : null,
                'proyecto_bodega' => $orden->proyecto ? $orden->proyecto->bodega : null,
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
            // Si tiene orden de pedido, validar que esté pendiente
            $ordenPedido = null;
            if ($request->id_orden_pedido) {
                $ordenPedido = OrdenPedido::where('id_orden_pedido', $request->id_orden_pedido)
                    ->where('estado', 'PENDIENTE')
                    ->first();

                if (!$ordenPedido) {
                    return response()->json([
                        'error' => 'Orden de pedido no válida',
                        'mensaje' => 'La orden de pedido no existe o ya fue procesada'
                    ], 422);
                }
            }

            // Determinar si es compra directa (total <= 500) y tiene orden de pedido
            $esCompraDirecta = $request->total_general <= 500 && $ordenPedido;

            if ($esCompraDirecta) {
                // COMPRA DIRECTA: Registrar directamente en Kardex/Ingreso Directo
                // TODO: Implementar lógica de ingreso directo al Kardex
                
                // Actualizar estado de orden de pedido a COMPLETADO
                $ordenPedido->update([
                    'estado_compra' => 'COMPRA_DIRECTA',
                    'estado' => 'COMPLETADO',
                    'fecha_modificacion' => now(),
                    'usuario_modificacion' => $request->usuario ?? 'sistema'
                ]);

                DB::commit();

                return response()->json([
                    'mensaje' => 'Compra directa registrada exitosamente',
                    'tipo' => 'COMPRA_DIRECTA',
                    'total' => $request->total_general,
                    'orden_pedido' => $ordenPedido->correlativo
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
}
