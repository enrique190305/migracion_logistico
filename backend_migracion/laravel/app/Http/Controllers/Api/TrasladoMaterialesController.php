<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrasladoMaterial;
use App\Models\DetalleTraslado;
use App\Models\MovimientoKardex;
use App\Models\ProyectoAlmacen;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;

class TrasladoMaterialesController extends Controller
{
    /**
     * Generar el siguiente número de traslado
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function generarNumero()
    {
        try {
            $prefix = 'NT-';
            
            // Obtener el último número de traslado
            $ultimoTraslado = TrasladoMaterial::where('id_traslado', 'like', $prefix . '%')
                ->orderByRaw('CAST(SUBSTRING(id_traslado, 4) AS UNSIGNED) DESC')
                ->first();
            
            $siguiente = 1;
            if ($ultimoTraslado) {
                $numero = (int) substr($ultimoTraslado->id_traslado, 3);
                $siguiente = $numero + 1;
            }
            
            $numeroTraslado = $prefix . str_pad($siguiente, 3, '0', STR_PAD_LEFT);
            
            return response()->json([
                'success' => true,
                'numero_traslado' => $numeroTraslado
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al generar número de traslado: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al generar número de traslado'
            ], 500);
        }
    }

    /**
     * Listar proyectos disponibles para traslado
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function listarProyectos()
    {
        try {
            $proyectos = ProyectoAlmacen::select(
                'id_proyecto_almacen as id',
                'nombre_proyecto'
            )
            ->orderBy('nombre_proyecto')
            ->get();
            
            return response()->json([
                'success' => true,
                'data' => $proyectos
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al listar proyectos: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar proyectos'
            ], 500);
        }
    }

    /**
     * Obtener productos con stock disponible en un proyecto
     * 
     * @param int $proyectoId
     * @return \Illuminate\Http\JsonResponse
     */
    public function productosConStock($proyectoId)
    {
        try {
            $proyecto = ProyectoAlmacen::findOrFail($proyectoId);
            $nombreProyecto = $proyecto->nombre_proyecto;
            
            // Consultar productos con stock disponible
            $productos = DB::table('movimiento_kardex as mk')
                ->select(
                    'mk.codigo_producto',
                    'mk.descripcion',
                    'mk.unidad',
                    DB::raw('SUM(CASE 
                        WHEN mk.tipo_movimiento = "INGRESO" THEN mk.cantidad 
                        ELSE -mk.cantidad 
                    END) as stock_disponible')
                )
                ->where('mk.proyecto', $nombreProyecto)
                ->groupBy('mk.codigo_producto', 'mk.descripcion', 'mk.unidad')
                ->havingRaw('SUM(CASE 
                    WHEN mk.tipo_movimiento = "INGRESO" THEN mk.cantidad 
                    ELSE -mk.cantidad 
                END) > 0')
                ->orderBy('mk.descripcion')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $productos
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al obtener productos con stock: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar productos del proyecto'
            ], 500);
        }
    }

    /**
     * Obtener stock disponible de un producto en un proyecto específico
     * 
     * @param string $codigoProducto
     * @param int $proyectoId
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerStock($codigoProducto, $proyectoId)
    {
        try {
            $proyecto = ProyectoAlmacen::findOrFail($proyectoId);
            $nombreProyecto = $proyecto->nombre_proyecto;
            
            // Calcular stock disponible
            $resultado = DB::table('movimiento_kardex')
                ->selectRaw('SUM(CASE 
                    WHEN tipo_movimiento = "INGRESO" THEN cantidad 
                    ELSE -cantidad 
                END) as stock_disponible')
                ->where('codigo_producto', $codigoProducto)
                ->where('proyecto', $nombreProyecto)
                ->first();
            
            $stockDisponible = $resultado->stock_disponible ?? 0;
            
            // Calcular precio promedio ponderado
            $precioPromedio = $this->calcularPrecioPromedio($codigoProducto, $nombreProyecto);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'codigo_producto' => $codigoProducto,
                    'stock_disponible' => floatval($stockDisponible),
                    'precio_promedio' => floatval($precioPromedio)
                ]
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al obtener stock: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener stock del producto'
            ], 500);
        }
    }

    /**
     * Guardar traslado de materiales completo
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validar datos de entrada
        $validator = Validator::make($request->all(), [
            'numero_traslado' => 'required|string|max:20|unique:traslado_materiales,id_traslado',
            'proyecto_origen' => 'required|string',
            'proyecto_destino' => 'required|string|different:proyecto_origen',
            'fecha_traslado' => 'required|date',
            'usuario' => 'required|string|max:100',
            'observaciones' => 'nullable|string',
            'productos' => 'required|array|min:1',
            'productos.*.codigo_producto' => 'required|string|max:50',
            'productos.*.descripcion' => 'required|string',
            'productos.*.cantidad' => 'required|integer|min:1',
            'productos.*.unidad' => 'required|string|max:20',
            'productos.*.observaciones' => 'nullable|string'
        ], [
            'numero_traslado.required' => 'El número de traslado es obligatorio',
            'numero_traslado.unique' => 'El número de traslado ya existe',
            'proyecto_origen.required' => 'Debe seleccionar un proyecto de origen',
            'proyecto_destino.required' => 'Debe seleccionar un proyecto de destino',
            'proyecto_destino.different' => 'El proyecto origen y destino deben ser diferentes',
            'fecha_traslado.required' => 'La fecha de traslado es obligatoria',
            'productos.required' => 'Debe agregar al menos un producto',
            'productos.min' => 'Debe agregar al menos un producto'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Iniciar transacción
        DB::beginTransaction();

        try {
            // Validar que los proyectos existan
            $proyectoOrigen = $request->proyecto_origen;
            $proyectoDestino = $request->proyecto_destino;

            // Verificar stock antes de procesar
            foreach ($request->productos as $producto) {
                $stockDisponible = $this->verificarStock(
                    $producto['codigo_producto'], 
                    $proyectoOrigen
                );

                if ($producto['cantidad'] > $stockDisponible) {
                    throw new Exception(
                        "Stock insuficiente para el producto {$producto['codigo_producto']}. " .
                        "Disponible: {$stockDisponible}, Solicitado: {$producto['cantidad']}"
                    );
                }
            }

            // 1. Crear registro de traslado
            $traslado = TrasladoMaterial::create([
                'id_traslado' => $request->numero_traslado,
                'fecha_traslado' => $request->fecha_traslado,
                'proyecto_origen' => $proyectoOrigen,
                'proyecto_destino' => $proyectoDestino,
                'usuario' => $request->usuario,
                'observaciones' => $request->observaciones,
                'fecha_creacion' => now()
            ]);

            $movimientosCreados = 0;

            // 2. Procesar cada producto
            foreach ($request->productos as $producto) {
                // A) Guardar detalle del traslado
                DetalleTraslado::create([
                    'id_traslado' => $traslado->id_traslado,
                    'codigo_producto' => $producto['codigo_producto'],
                    'descripcion' => $producto['descripcion'],
                    'cantidad' => $producto['cantidad'],
                    'unidad' => $producto['unidad'],
                    'observaciones' => $producto['observaciones'] ?? ''
                ]);

                // B) Calcular precio promedio ponderado
                $precioPromedio = $this->calcularPrecioPromedio(
                    $producto['codigo_producto'],
                    $proyectoOrigen
                );

                // C) Registrar SALIDA en Kardex (proyecto origen)
                MovimientoKardex::create([
                    'fecha' => $request->fecha_traslado,
                    'tipo_movimiento' => 'SALIDA',
                    'codigo_producto' => $producto['codigo_producto'],
                    'descripcion' => $producto['descripcion'],
                    'unidad' => $producto['unidad'],
                    'cantidad' => $producto['cantidad'],
                    'proyecto' => $proyectoOrigen,
                    'documento' => $traslado->id_traslado,
                    'observaciones' => "Traslado a {$proyectoDestino}" . 
                                     (!empty($producto['observaciones']) ? " - {$producto['observaciones']}" : ""),
                    'precio_unitario' => $precioPromedio > 0 ? $precioPromedio : null
                ]);
                $movimientosCreados++;

                // D) Registrar INGRESO en Kardex (proyecto destino)
                MovimientoKardex::create([
                    'fecha' => $request->fecha_traslado,
                    'tipo_movimiento' => 'INGRESO',
                    'codigo_producto' => $producto['codigo_producto'],
                    'descripcion' => $producto['descripcion'],
                    'unidad' => $producto['unidad'],
                    'cantidad' => $producto['cantidad'],
                    'proyecto' => $proyectoDestino,
                    'documento' => $traslado->id_traslado,
                    'observaciones' => "Traslado desde {$proyectoOrigen}" . 
                                     (!empty($producto['observaciones']) ? " - {$producto['observaciones']}" : ""),
                    'precio_unitario' => $precioPromedio > 0 ? $precioPromedio : null
                ]);
                $movimientosCreados++;
            }

            // Confirmar transacción
            DB::commit();

            Log::info("Traslado creado exitosamente: {$traslado->id_traslado} por {$request->usuario}");

            return response()->json([
                'success' => true,
                'message' => 'Traslado de materiales registrado exitosamente',
                'data' => [
                    'id_traslado' => $traslado->id_traslado,
                    'fecha_traslado' => $traslado->fecha_traslado->format('d/m/Y'),
                    'proyecto_origen' => $traslado->proyecto_origen,
                    'proyecto_destino' => $traslado->proyecto_destino,
                    'total_productos' => count($request->productos),
                    'movimientos_kardex' => $movimientosCreados,
                    'usuario' => $traslado->usuario
                ]
            ], 201);

        } catch (Exception $e) {
            // Revertir transacción en caso de error
            DB::rollBack();

            Log::error('Error al guardar traslado: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el traslado: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener historial de traslados con filtros
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function historial(Request $request)
    {
        try {
            $query = TrasladoMaterial::with('detalles');

            // Filtro por fecha
            if ($request->has('fecha_desde') && $request->has('fecha_hasta')) {
                $query->entreFechas($request->fecha_desde, $request->fecha_hasta);
            }

            // Filtro por proyecto origen
            if ($request->has('proyecto_origen')) {
                $query->proyectoOrigen($request->proyecto_origen);
            }

            // Filtro por proyecto destino
            if ($request->has('proyecto_destino')) {
                $query->proyectoDestino($request->proyecto_destino);
            }

            // Filtro por usuario
            if ($request->has('usuario')) {
                $query->porUsuario($request->usuario);
            }

            // Ordenar por fecha descendente
            $traslados = $query->orderBy('fecha_traslado', 'desc')
                              ->orderBy('id_traslado', 'desc')
                              ->get();

            // Formatear respuesta
            $data = $traslados->map(function ($traslado) {
                return [
                    'id_traslado' => $traslado->id_traslado,
                    'fecha_traslado' => $traslado->fecha_traslado->format('d/m/Y'),
                    'proyecto_origen' => $traslado->proyecto_origen,
                    'proyecto_destino' => $traslado->proyecto_destino,
                    'usuario' => $traslado->usuario,
                    'observaciones' => $traslado->observaciones,
                    'total_productos' => $traslado->total_productos,
                    'cantidad_total' => $traslado->cantidad_total,
                    'fecha_creacion' => $traslado->fecha_creacion->format('d/m/Y H:i:s')
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (Exception $e) {
            Log::error('Error al obtener historial: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al cargar el historial'
            ], 500);
        }
    }

    /**
     * Obtener detalle de un traslado específico
     * 
     * @param string $idTraslado
     * @return \Illuminate\Http\JsonResponse
     */
    public function detalle($idTraslado)
    {
        try {
            $traslado = TrasladoMaterial::with('detalles')->findOrFail($idTraslado);

            return response()->json([
                'success' => true,
                'data' => [
                    'id_traslado' => $traslado->id_traslado,
                    'fecha_traslado' => $traslado->fecha_traslado->format('d/m/Y'),
                    'proyecto_origen' => $traslado->proyecto_origen,
                    'proyecto_destino' => $traslado->proyecto_destino,
                    'usuario' => $traslado->usuario,
                    'observaciones' => $traslado->observaciones,
                    'fecha_creacion' => $traslado->fecha_creacion->format('d/m/Y H:i:s'),
                    'productos' => $traslado->detalles->map(function ($detalle) {
                        return [
                            'codigo_producto' => $detalle->codigo_producto,
                            'descripcion' => $detalle->descripcion,
                            'cantidad' => $detalle->cantidad,
                            'unidad' => $detalle->unidad,
                            'observaciones' => $detalle->observaciones
                        ];
                    })
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Error al obtener detalle: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Traslado no encontrado'
            ], 404);
        }
    }

    /**
     * Calcular el precio promedio ponderado de un producto en un proyecto
     * 
     * @param string $codigoProducto
     * @param string $proyecto
     * @return float
     */
    private function calcularPrecioPromedio($codigoProducto, $proyecto)
    {
        try {
            $resultado = DB::table('movimiento_kardex')
                ->selectRaw('
                    CASE 
                        WHEN SUM(CASE WHEN tipo_movimiento = "INGRESO" 
                                       AND precio_unitario IS NOT NULL 
                                  THEN cantidad ELSE 0 END) > 0 
                        THEN SUM(CASE WHEN tipo_movimiento = "INGRESO" 
                                       AND precio_unitario IS NOT NULL 
                                  THEN cantidad * precio_unitario ELSE 0 END) / 
                             SUM(CASE WHEN tipo_movimiento = "INGRESO" 
                                       AND precio_unitario IS NOT NULL 
                                  THEN cantidad ELSE 0 END)
                        ELSE 0 
                    END as precio_promedio
                ')
                ->where('codigo_producto', $codigoProducto)
                ->where('proyecto', $proyecto)
                ->first();

            return $resultado->precio_promedio ?? 0;

        } catch (Exception $e) {
            Log::error("Error al calcular precio promedio: {$e->getMessage()}");
            return 0;
        }
    }

    /**
     * Verificar stock disponible de un producto en un proyecto
     * 
     * @param string $codigoProducto
     * @param string $proyecto
     * @return float
     */
    private function verificarStock($codigoProducto, $proyecto)
    {
        try {
            $resultado = DB::table('movimiento_kardex')
                ->selectRaw('SUM(CASE 
                    WHEN tipo_movimiento = "INGRESO" THEN cantidad 
                    ELSE -cantidad 
                END) as stock_disponible')
                ->where('codigo_producto', $codigoProducto)
                ->where('proyecto', $proyecto)
                ->first();

            return $resultado->stock_disponible ?? 0;

        } catch (Exception $e) {
            Log::error("Error al verificar stock: {$e->getMessage()}");
            return 0;
        }
    }

    /**
     * Generar PDF del traslado de materiales
     * 
     * @param string $idTraslado
     * @return \Illuminate\Http\Response
     */
    public function generarPDF($idTraslado)
    {
        try {
            // Obtener el traslado con sus detalles
            $traslado = TrasladoMaterial::with('detalles')
                ->where('id_traslado', $idTraslado)
                ->first();

            if (!$traslado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Traslado no encontrado'
                ], 404);
            }

            // Generar el PDF con la vista
            $pdf = Pdf::loadView('pdf.traslado_materiales', [
                'traslado' => $traslado
            ]);

            // Configurar orientación y tamaño de página
            $pdf->setPaper('A4', 'portrait');

            // Descargar el PDF
            return $pdf->download("Traslado_{$idTraslado}.pdf");

        } catch (Exception $e) {
            Log::error('Error al generar PDF: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al generar el PDF del traslado'
            ], 500);
        }
    }
}

