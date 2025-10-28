<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;
use Barryvdh\DomPDF\Facade\Pdf;

class SalidaMaterialController extends Controller
{
    /**
     * Listar proyectos disponibles
     */
    public function listarProyectos()
    {
        try {
            $proyectos = DB::table('proyecto_almacen')
                ->select('id_proyecto', 'nombre_proyecto')
                ->orderBy('nombre_proyecto')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $proyectos
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener proyectos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar trabajadores (personal)
     */
    public function listarTrabajadores()
    {
        try {
            $trabajadores = DB::table('personal')
                ->select(
                    'id_personal',
                    'nom_ape',
                    'dni',
                    'area'
                )
                ->orderBy('nom_ape')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $trabajadores
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener trabajadores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener productos con stock disponible por proyecto
     */
    public function obtenerProductosPorProyecto(Request $request)
    {
        try {
            $nombreProyecto = $request->input('proyecto');

            if (!$nombreProyecto) {
                return response()->json([
                    'success' => false,
                    'message' => 'El nombre del proyecto es requerido'
                ], 400);
            }

            // Consulta para obtener productos con stock disponible
            $productos = DB::select("
                SELECT 
                    mk.codigo_producto,
                    mk.descripcion,
                    mk.unidad,
                    SUM(CASE 
                        WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                        ELSE -mk.cantidad 
                    END) as stock_actual
                FROM movimiento_kardex mk
                WHERE TRIM(mk.proyecto_almacen) = ?
                GROUP BY mk.codigo_producto, mk.descripcion, mk.unidad
                HAVING SUM(CASE 
                    WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad 
                    ELSE -mk.cantidad 
                END) > 0
                ORDER BY mk.descripcion
            ", [trim($nombreProyecto)]);

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
     * Generar nuevo número de salida
     */
    public function generarNumeroSalida()
    {
        try {
            $ultimoNumero = DB::table('salidas_materiales')
                ->selectRaw('MAX(CAST(SUBSTRING(numero_salida, 4) AS UNSIGNED)) as ultimo')
                ->value('ultimo');

            $nuevoNumero = $ultimoNumero ? $ultimoNumero + 1 : 1;
            $numeroSalida = 'NS-' . str_pad($nuevoNumero, 3, '0', STR_PAD_LEFT);

            return response()->json([
                'success' => true,
                'numero_salida' => $numeroSalida
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar número de salida',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Guardar salida de materiales
     */
    public function guardarSalida(Request $request)
    {
        try {
            // Validación
            $validator = Validator::make($request->all(), [
                'numero_salida' => 'required|string',
                'proyecto_almacen' => 'required|string',
                'id_personal' => 'required|integer',
                'fecha_salida' => 'required|date',
                'productos' => 'required|array|min:1',
                'productos.*.codigo_producto' => 'required|string',
                'productos.*.cantidad' => 'required|numeric|min:0.01'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Insertar salida principal
            DB::table('salidas_materiales')->insert([
                'numero_salida' => $request->numero_salida,
                'proyecto_almacen' => $request->proyecto_almacen,
                'id_personal' => $request->id_personal,
                'fecha_salida' => $request->fecha_salida,
                'observaciones' => $request->observaciones ?? null,
                'usuario_registro' => 'admin', // Temporal
                'fecha_registro' => now()
            ]);

            // Insertar detalles y actualizar kardex
            foreach ($request->productos as $producto) {
                // Insertar detalle
                DB::table('detalle_salida')->insert([
                    'numero_salida' => $request->numero_salida,
                    'codigo_producto' => $producto['codigo_producto'],
                    'descripcion' => $producto['descripcion'],
                    'cantidad' => $producto['cantidad'],
                    'unidad_medida' => $producto['unidad'],
                    'observacion_general' => $producto['observaciones'] ?? null
                ]);

                // Obtener stock actual
                $stockActual = DB::select("
                    SELECT SUM(CASE 
                        WHEN tipo_movimiento = 'INGRESO' THEN cantidad 
                        ELSE -cantidad 
                    END) as stock
                    FROM movimiento_kardex
                    WHERE codigo_producto = ?
                    AND proyecto_almacen = ?
                ", [$producto['codigo_producto'], $request->proyecto_almacen]);

                $stock = $stockActual[0]->stock ?? 0;

                // Validar stock suficiente
                if ($stock < $producto['cantidad']) {
                    throw new Exception("Stock insuficiente para {$producto['descripcion']}");
                }

                // Insertar movimiento en kardex (SALIDA)
                DB::table('movimiento_kardex')->insert([
                    'codigo_producto' => $producto['codigo_producto'],
                    'tipo_movimiento' => 'SALIDA',
                    'cantidad' => $producto['cantidad'],
                    'stock_anterior' => $stock,
                    'stock_nuevo' => $stock - $producto['cantidad'],
                    'fecha_movimiento' => $request->fecha_salida,
                    'proyecto_almacen' => $request->proyecto_almacen,
                    'documento_referencia' => $request->numero_salida,
                    'observaciones' => "Salida de material - {$request->numero_salida}",
                    'usuario_registro' => 'admin',
                    'fecha_registro' => now()
                ]);

                // Actualizar stock del producto
                DB::table('producto')
                    ->where('codigo_producto', $producto['codigo_producto'])
                    ->decrement('stock_actual', $producto['cantidad']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Salida de materiales guardada correctamente',
                'data' => [
                    'numero_salida' => $request->numero_salida
                ]
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar la salida',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener historial de salidas
     */
    public function obtenerHistorial(Request $request)
    {
        try {
            $query = DB::table('salidas_materiales as sm')
                ->select(
                    'sm.numero_salida',
                    'sm.proyecto',
                    'sm.fecha_registro as fecha_salida',
                    'sm.nom_ape as trabajador',
                    'sm.area',
                    'sm.dni',
                    'sm.id_personal',
                    DB::raw('(SELECT COUNT(*) FROM detalle_salida WHERE numero_salida = sm.numero_salida) as total_productos')
                )
                ->orderBy('sm.fecha_registro', 'desc');

            // Filtros opcionales
            if ($request->has('fecha_desde')) {
                $query->where('sm.fecha_registro', '>=', $request->fecha_desde);
            }
            if ($request->has('fecha_hasta')) {
                $query->where('sm.fecha_registro', '<=', $request->fecha_hasta);
            }
            if ($request->has('proyecto')) {
                $query->where('sm.proyecto', 'LIKE', '%' . $request->proyecto . '%');
            }

            $salidas = $query->get();

            return response()->json([
                'success' => true,
                'data' => $salidas
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener historial de salidas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalle de una salida específica
     */
    public function obtenerDetalleSalida($numeroSalida)
    {
        try {
            $salida = DB::table('salidas_materiales as sm')
                ->where('sm.numero_salida', $numeroSalida)
                ->select(
                    'sm.numero_salida',
                    'sm.proyecto',
                    'sm.fecha_registro as fecha_salida',
                    'sm.nom_ape as trabajador',
                    'sm.dni',
                    'sm.area',
                    'sm.id_personal'
                )
                ->first();

            if (!$salida) {
                return response()->json([
                    'success' => false,
                    'message' => 'Salida no encontrada'
                ], 404);
            }

            $detalles = DB::table('detalle_salida')
                ->where('numero_salida', $numeroSalida)
                ->select(
                    'codigo_producto',
                    'descripcion',
                    'cantidad',
                    'unidad_medida'
                )
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'salida' => $salida,
                    'detalles' => $detalles
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener detalle de salida: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar PDF de salida de materiales
     */
    public function generarPDF($numeroSalida)
    {
        try {
            // Obtener datos de la salida (sin JOIN, campos ya están en la tabla)
            $salida = DB::table('salidas_materiales as sm')
                ->select(
                    'sm.numero_salida',
                    'sm.proyecto',
                    'sm.fecha_registro as fecha_salida',
                    'sm.nom_ape as trabajador',
                    'sm.dni',
                    'sm.area',
                    'sm.id_personal'
                )
                ->where('sm.numero_salida', $numeroSalida)
                ->first();

            if (!$salida) {
                return response()->json([
                    'success' => false,
                    'message' => 'Salida no encontrada'
                ], 404);
            }

            // Obtener detalle de productos
            $detalles = DB::table('detalle_salida')
                ->where('numero_salida', $numeroSalida)
                ->get();

            // Preparar datos para la vista
            $data = [
                'salida' => $salida,
                'detalles' => $detalles,
                'fecha_generacion' => now()->format('d/m/Y H:i:s')
            ];

            // Generar PDF
            $pdf = Pdf::loadView('pdf.salida_materiales', $data);
            $pdf->setPaper('letter', 'portrait');

            // Retornar PDF como descarga
            return $pdf->download("Salida_Materiales_{$numeroSalida}.pdf");

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
