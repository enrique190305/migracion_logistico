<?php

namespace App\Http\Controllers;

use App\Models\OrdenPedido;
use App\Models\DetalleOrdenPedido;
use App\Models\Empresa;
use App\Models\ProyectoAlmacen;
use App\Models\EmpresaProyecto;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrdenPedidoController extends Controller
{
    /**
     * Obtener todas las empresas
     */
    public function getEmpresas()
    {
        try {
            $empresas = Empresa::select('id_empresa', 'razon_social', 'ruc', 'nombre_comercial')
                ->orderBy('razon_social')
                ->get();

            return response()->json($empresas);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener empresas: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Obtener proyectos por empresa (directamente desde proyecto_almacen)
     */
    public function getProyectosByEmpresa($id_empresa)
    {
        try {
            // Obtener proyectos de la empresa directamente desde proyecto_almacen
            $proyectos = DB::table('proyecto_almacen')
                ->select(
                    'id_proyecto_almacen',
                    'nombre_proyecto',
                    'codigo_proyecto',
                    'tipo_movil',
                    'estado',
                    'id_empresa'
                )
                ->where('id_empresa', $id_empresa)
                ->where('estado', 'ACTIVO')
                ->orderBy('nombre_proyecto', 'ASC')
                ->get();

            return response()->json($proyectos);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener proyectos: ' . $e->getMessage(),
                'id_empresa' => $id_empresa
            ], 500);
        }
    }

    /**
     * Obtener todos los productos activos
     */
    public function getProductos()
    {
        try {
            $productos = Producto::select('codigo_producto', 'descripcion', 'unidad')
                ->orderBy('descripcion')
                ->get();

            return response()->json($productos);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener productos: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Generar siguiente correlativo
     */
    public function getCorrelativo()
    {
        try {
            $ultimaOrden = OrdenPedido::orderBy('id_orden_pedido', 'desc')->first();
            
            if ($ultimaOrden && $ultimaOrden->correlativo) {
                // Extraer el número del correlativo (ej: OP-0001 -> 1)
                $numero = intval(substr($ultimaOrden->correlativo, 3));
                $nuevoNumero = $numero + 1;
            } else {
                $nuevoNumero = 1;
            }
            
            $correlativo = 'OP-' . str_pad($nuevoNumero, 4, '0', STR_PAD_LEFT);
            
            return response()->json(['correlativo' => $correlativo]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al generar correlativo: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Listar todas las órdenes de pedido
     */
    public function index()
    {
        try {
            $ordenes = OrdenPedido::with(['empresa', 'proyectoAlmacen', 'detalles.producto'])
                ->orderBy('fecha_creacion', 'desc')
                ->get();

            return response()->json($ordenes);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al listar órdenes: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Guardar nueva orden de pedido
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'correlativo' => 'required|unique:orden_pedido,correlativo',
                'id_empresa' => 'required|exists:empresa,id_empresa',
                'id_proyecto_almacen' => 'required|exists:proyecto_almacen,id_proyecto_almacen',
                'fecha_pedido' => 'required|date',
                'observacion' => 'nullable|string',
                'detalles' => 'required|array|min:1',
                'detalles.*.codigo_producto' => 'required|exists:producto,codigo_producto',
                'detalles.*.cantidad_solicitada' => 'required|numeric|min:0.01',
                'detalles.*.observacion' => 'nullable|string'
            ]);

            DB::beginTransaction();

            // Crear orden de pedido (usar id_proyecto en vez de id_proyecto_almacen)
            $orden = OrdenPedido::create([
                'correlativo' => $validated['correlativo'],
                'id_empresa' => $validated['id_empresa'],
                'id_proyecto' => $validated['id_proyecto_almacen'], // Mapear correctamente
                'fecha_pedido' => $validated['fecha_pedido'],
                'observacion' => $validated['observacion'] ?? null,
                'estado' => 'PENDIENTE',
                'fecha_creacion' => now(),
                'usuario_creacion' => 'sistema' // TODO: Obtener usuario autenticado
            ]);

            // Crear detalles
            foreach ($validated['detalles'] as $detalle) {
                $producto = Producto::where('codigo_producto', $detalle['codigo_producto'])->first();
                
                DetalleOrdenPedido::create([
                    'id_orden_pedido' => $orden->id_orden_pedido,
                    'codigo_producto' => $detalle['codigo_producto'],
                    'cantidad_solicitada' => $detalle['cantidad_solicitada'],
                    'unidad' => $producto->unidad ?? null,
                    'stock_actual' => 0, // No hay stock_actual en la tabla PRODUCTO actual
                    'observacion' => $detalle['observacion'] ?? null,
                    'estado_linea' => 'PENDIENTE'
                ]);
            }

            DB::commit();

            // Cargar relaciones para devolver
            $orden->load(['empresa', 'proyecto', 'detalles.producto']);

            return response()->json([
                'message' => 'Orden de pedido creada exitosamente',
                'orden' => $orden
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json(['error' => 'Validación fallida', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al guardar orden: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Obtener una orden específica
     */
    public function show($id)
    {
        try {
            $orden = OrdenPedido::with(['empresa', 'proyecto', 'detalles.producto'])->findOrFail($id);
            return response()->json($orden);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Orden no encontrada: ' . $e->getMessage()], 404);
        }
    }

    /**
     * Eliminar orden de pedido
     */
    public function destroy($id)
    {
        try {
            $orden = OrdenPedido::findOrFail($id);
            $orden->delete();

            return response()->json(['message' => 'Orden eliminada exitosamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar orden: ' . $e->getMessage()], 500);
        }
    }
}
