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
            $monedas = Moneda::select('id_moneda as id', 'tipo_moneda as nombre')
                ->orderBy('tipo_moneda')
                ->get();

            return response()->json($monedas, 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al obtener monedas',
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
     */
    public function guardarOrdenCompra(Request $request)
    {
        // Validación de datos
        $validator = Validator::make($request->all(), [
            'correlativo' => 'required|string|max:20',
            'id_empresa' => 'required|integer|exists:EMPRESA,id_empresa',
            'id_proveedor' => 'required|integer|exists:PROVEEDOR,id_proveedor',
            'id_moneda' => 'required|integer|exists:MONEDA,id_moneda',
            'fecha_oc' => 'required|date',
            'fecha_requerida' => 'nullable|date',
            'igv' => 'required|numeric|min:0',
            'total_general' => 'required|numeric|min:500', // MÍNIMO 500
            'detalles' => 'required|array|min:1',
            'detalles.*.codigo_producto' => 'required|string|exists:PRODUCTO,codigo_producto',
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
        
        // VALIDACIÓN ADICIONAL: Verificar monto mínimo de 500
        if ($request->total_general < 500) {
            return response()->json([
                'error' => 'Monto mínimo no alcanzado',
                'mensaje' => 'El total de la orden debe ser mayor o igual a S/. 500.00'
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Crear Orden de Compra
            $ordenCompra = OrdenCompra::create([
                'correlativo' => $request->correlativo,
                'id_empresa' => $request->id_empresa,
                'id_proveedor' => $request->id_proveedor,
                'id_moneda' => $request->id_moneda,
                'fecha_oc' => $request->fecha_oc,
                'fecha_requerida' => $request->fecha_requerida,
                'igv' => $request->igv,
                'total_general' => $request->total_general,
                'estado' => 'pendiente',
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

            DB::commit();

            return response()->json([
                'mensaje' => 'Orden de compra creada exitosamente',
                'id_oc' => $ordenCompra->id_oc,
                'correlativo' => $ordenCompra->correlativo
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al guardar orden de compra',
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
            'correlativo' => 'required|string|max:20',
            'id_empresa' => 'required|integer|exists:EMPRESA,id_empresa',
            'id_proveedor' => 'required|integer|exists:PROVEEDOR,id_proveedor',
            'id_moneda' => 'required|integer|exists:MONEDA,id_moneda',
            'fecha_servicio' => 'required|date',
            'fecha_requerida' => 'nullable|date',
            'contacto' => 'nullable|string|max:100',
            'celular' => 'nullable|string|max:20',
            'correo' => 'nullable|email|max:100',
            'destino' => 'nullable|string|max:255',
            'latitud' => 'nullable|string|max:50',
            'longitud' => 'nullable|string|max:50',
            'igv' => 'required|numeric|min:0',
            'total_general' => 'required|numeric|min:500', // MÍNIMO 500
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
        
        // VALIDACIÓN ADICIONAL: Verificar monto mínimo de 500
        if ($request->total_general < 500) {
            return response()->json([
                'error' => 'Monto mínimo no alcanzado',
                'mensaje' => 'El total de la orden debe ser mayor o igual a S/. 500.00'
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Crear Orden de Servicio
            $ordenServicio = OrdenServicio::create([
                'correlativo' => $request->correlativo,
                'id_empresa' => $request->id_empresa,
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
                'estado' => 'pendiente',
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

            DB::commit();

            return response()->json([
                'mensaje' => 'Orden de servicio creada exitosamente',
                'id_os' => $ordenServicio->id_os,
                'correlativo' => $ordenServicio->correlativo
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
