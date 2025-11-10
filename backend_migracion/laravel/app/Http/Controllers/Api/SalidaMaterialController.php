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
     * Listar proyectos disponibles (SOLO tipo SIN_PROYECTO - movil_persona)
     */
    public function listarProyectos()
    {
        try {
            $proyectos = DB::table('proyecto_almacen')
                ->select('id_proyecto_almacen as id_proyecto', 'nombre_proyecto', 'tipo_movil')
                ->where('estado', 'ACTIVO')
                ->where('tipo_movil', 'SIN_PROYECTO') // SOLO movil_persona
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
     * Listar bodegas activas
     */
    public function listarBodegas()
    {
        try {
            $bodegas = DB::table('bodega')
                ->join('empresa', 'bodega.id_empresa', '=', 'empresa.id_empresa')
                ->where('bodega.estado', 'ACTIVO')
                ->select(
                    'bodega.id_bodega',
                    'bodega.nombre',
                    'bodega.ubicacion',
                    'empresa.razon_social'
                )
                ->orderBy('bodega.nombre')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $bodegas
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener bodegas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener reservas por bodega (SOLO tipo de reserva)
     */
    public function obtenerReservasPorBodega($idBodega)
    {
        try {
            Log::info("=== Obteniendo reservas por bodega: {$idBodega} ===");
            
            // Obtener solo los tipos de reserva únicos de la bodega
            $reservas = DB::table('proyecto_almacen as pa')
                ->join('reserva as r', 'pa.id_reserva', '=', 'r.id_reserva')
                ->where('pa.id_bodega', $idBodega)
                ->where('r.estado', 'ACTIVO')
                ->where('pa.estado', 'ACTIVO')
                ->where('pa.tipo_movil', 'SIN_PROYECTO')
                ->select(
                    'r.id_reserva',
                    'r.tipo_reserva'
                )
                ->distinct()
                ->orderBy('r.tipo_reserva')
                ->get();

            Log::info("Reservas encontradas: " . $reservas->count());

            return response()->json([
                'success' => true,
                'data' => $reservas
            ]);
        } catch (Exception $e) {
            Log::error("Error al obtener reservas: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener reservas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener responsables (personas) por bodega y reserva
     */
    public function obtenerResponsablesPorBodegaReserva($idBodega, $idReserva)
    {
        try {
            Log::info("=== Obteniendo responsables: Bodega={$idBodega}, Reserva={$idReserva} ===");
            
            $responsables = DB::table('proyecto_almacen as pa')
                ->join('movil_persona as mp', 'pa.id_referencia', '=', 'mp.id_movil_persona')
                ->where('pa.id_bodega', $idBodega)
                ->where('pa.id_reserva', $idReserva)
                ->where('pa.estado', 'ACTIVO')
                ->where('pa.tipo_movil', 'SIN_PROYECTO')
                ->select(
                    'mp.id_movil_persona',
                    'mp.nom_ape',
                    'mp.dni',
                    'pa.id_proyecto_almacen',
                    'pa.nombre_proyecto'
                )
                ->orderBy('mp.nom_ape')
                ->get();

            Log::info("Responsables encontrados: " . $responsables->count());

            return response()->json([
                'success' => true,
                'data' => $responsables
            ]);
        } catch (Exception $e) {
            Log::error("Error al obtener responsables: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener responsables',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener información del proyecto incluyendo datos de movil_persona ÚNICAMENTE
     * IMPORTANTE: Solo se usa movil_persona, se ignora movil_proyecto
     */
    public function obtenerInfoProyecto($idProyecto)
    {
        try {
            // Obtener información del proyecto
            $proyecto = DB::table('proyecto_almacen as pa')
                ->leftJoin('reserva as r', 'pa.id_reserva', '=', 'r.id_reserva')
                ->where('pa.id_proyecto_almacen', $idProyecto)
                ->where('pa.tipo_movil', 'SIN_PROYECTO') // SOLO SIN_PROYECTO (movil_persona)
                ->select(
                    'pa.id_proyecto_almacen',
                    'pa.nombre_proyecto',
                    'pa.tipo_movil',
                    'pa.id_referencia',
                    'r.tipo_reserva as area'
                )
                ->first();

            if (!$proyecto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyecto no encontrado o no es de tipo SIN_PROYECTO (movil_persona)'
                ], 404);
            }

            // Obtener datos de movil_persona
            $movilPersona = DB::table('movil_persona')
                ->where('id_movil_persona', $proyecto->id_referencia)
                ->select('nom_ape', 'dni')
                ->first();

            // Combinar datos
            $proyecto->trabajador = $movilPersona->nom_ape ?? '';
            $proyecto->dni = $movilPersona->dni ?? '';

            return response()->json([
                'success' => true,
                'data' => $proyecto
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener información del proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener productos con stock disponible por bodega y reserva
     */
    public function obtenerProductosPorBodegaReserva($idBodega, $idReserva)
    {
        try {
            Log::info("=== Obteniendo productos: Bodega={$idBodega}, Reserva={$idReserva} ===");

            $productos = DB::table('bodega_stock as bs')
                ->join('producto as p', 'bs.codigo_producto', '=', 'p.codigo_producto')
                ->where('bs.id_bodega', $idBodega)
                ->where('bs.id_reserva', $idReserva)
                ->where('bs.cantidad_disponible', '>', 0)
                ->select(
                    'p.codigo_producto',
                    'p.descripcion',
                    'p.unidad',
                    'bs.cantidad_disponible as stock_actual'
                )
                ->orderBy('p.descripcion')
                ->get();

            Log::info("Productos encontrados: " . $productos->count());

            return response()->json([
                'success' => true,
                'data' => $productos
            ]);
        } catch (Exception $e) {
            Log::error("Error al obtener productos: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener productos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener productos con stock disponible por proyecto (LEGACY - mantener compatibilidad)
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
                WHERE TRIM(mk.proyecto) = ?
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
            Log::info("=== Guardando salida de materiales ===");
            Log::info("Datos recibidos: " . json_encode($request->all()));
            
            // Validación
            $validator = Validator::make($request->all(), [
                'numero_salida' => 'required|string',
                'id_bodega' => 'required|integer',
                'id_reserva' => 'required|integer',
                'proyecto_almacen' => 'required|string',
                'trabajador' => 'required|string',
                'dni' => 'required|string',
                'area' => 'required|string',
                'fecha_salida' => 'required|date',
                'productos' => 'required|array|min:1',
                'productos.*.codigo_producto' => 'required|string',
                'productos.*.cantidad' => 'required|numeric|min:0.01'
            ]);

            if ($validator->fails()) {
                Log::error("Errores de validación: " . json_encode($validator->errors()));
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Insertar salida principal (usando datos directos de movil_persona)
            DB::table('salidas_materiales')->insert([
                'numero_salida' => $request->numero_salida,
                'proyecto' => $request->proyecto_almacen,
                'nom_ape' => $request->trabajador,
                'dni' => $request->dni,
                'area' => $request->area, // Tipo de reserva: EXTERNA, INTERNA, COMERCIAL
                'id_personal' => null, // NULL en lugar de 0
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

                // Obtener stock actual desde bodega_stock (incluyendo id_reserva)
                $stockBodega = DB::table('bodega_stock')
                    ->where('id_bodega', $request->id_bodega)
                    ->where('id_reserva', $request->id_reserva)
                    ->where('codigo_producto', $producto['codigo_producto'])
                    ->first();

                if (!$stockBodega) {
                    throw new Exception("El producto {$producto['descripcion']} no existe en esta bodega con la reserva seleccionada");
                }

                $stockActual = $stockBodega->cantidad_disponible;

                // Validar stock suficiente
                if ($stockActual < $producto['cantidad']) {
                    throw new Exception("Stock insuficiente para {$producto['descripcion']}. Stock disponible: {$stockActual}");
                }

                // Insertar movimiento en kardex (SALIDA) - usando estructura real de la tabla
                DB::table('movimiento_kardex')->insert([
                    'fecha' => $request->fecha_salida,
                    'tipo_movimiento' => 'SALIDA',
                    'codigo_producto' => $producto['codigo_producto'],
                    'descripcion' => $producto['descripcion'],
                    'unidad' => $producto['unidad'],
                    'cantidad' => $producto['cantidad'],
                    'proyecto' => $request->proyecto_almacen,
                    'documento' => $request->numero_salida,
                    'precio_unitario' => 0,
                    'observaciones' => "Salida de material - Bodega: {$request->id_bodega} - Reserva: {$request->area}"
                ]);

                // Actualizar stock en bodega_stock (incluyendo id_reserva)
                DB::table('bodega_stock')
                    ->where('id_bodega', $request->id_bodega)
                    ->where('id_reserva', $request->id_reserva)
                    ->where('codigo_producto', $producto['codigo_producto'])
                    ->decrement('cantidad_disponible', $producto['cantidad']);
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
            Log::error("Error al guardar salida: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            
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
                    DB::raw('(SELECT COUNT(*) FROM detalle_salida WHERE numero_salida = sm.numero_salida) as total_productos')
                )
                ->orderBy('sm.fecha_registro', 'desc');

            // Filtros opcionales
            if ($request->has('fecha_desde')) {
                $query->whereDate('sm.fecha_registro', '>=', $request->fecha_desde);
            }
            if ($request->has('fecha_hasta')) {
                $query->whereDate('sm.fecha_registro', '<=', $request->fecha_hasta);
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
                    'sm.area'
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
            Log::info("=== Generando PDF para salida: {$numeroSalida} ===");
            
            // Obtener datos de la salida (sin JOIN, datos ya están en la tabla)
            $salida = DB::table('salidas_materiales as sm')
                ->select(
                    'sm.numero_salida',
                    'sm.proyecto as proyecto_almacen',
                    'sm.fecha_registro',
                    'sm.fecha_registro as fecha_salida',
                    'sm.nom_ape as trabajador',
                    'sm.dni',
                    'sm.area'
                )
                ->where('sm.numero_salida', $numeroSalida)
                ->first();

            Log::info("Salida encontrada: " . ($salida ? "SI" : "NO"));

            if (!$salida) {
                Log::error("Salida no encontrada: {$numeroSalida}");
                return response()->json([
                    'success' => false,
                    'message' => 'Salida no encontrada'
                ], 404);
            }

            // Obtener detalle de productos
            $detalles = DB::table('detalle_salida')
                ->where('numero_salida', $numeroSalida)
                ->get();

            Log::info("Detalles encontrados: " . count($detalles));

            // Obtener información de bodega y reserva (simplificado)
            // Usar el campo area que almacena el tipo de reserva (EXTERNA, INTERNA, COMERCIAL)
            $salida->reserva = $salida->area; // Ya tenemos el tipo de reserva en 'area'
            
            // Buscar bodega desde bodega_stock del primer producto
            $bodega = 'N/A';
            if (count($detalles) > 0) {
                $primerProducto = $detalles[0];
                $bodegaInfo = DB::table('bodega_stock as bs')
                    ->join('bodega as b', 'bs.id_bodega', '=', 'b.id_bodega')
                    ->where('bs.codigo_producto', $primerProducto->codigo_producto)
                    ->select('b.nombre')
                    ->first();
                
                if ($bodegaInfo) {
                    $bodega = $bodegaInfo->nombre;
                }
            }

            // Obtener firma del responsable desde movil_persona
            $firma = null;
            $personaInfo = DB::table('movil_persona')
                ->where('nom_ape', $salida->trabajador)
                ->where('dni', $salida->dni)
                ->where('estado', 'ACTIVO')
                ->select('firma')
                ->first();
            
            if ($personaInfo && $personaInfo->firma) {
                // Convertir el blob a base64 para mostrarlo en el PDF
                $firma = base64_encode($personaInfo->firma);
            }

            // Agregar información adicional al objeto salida
            $salida->observaciones = '';
            $salida->bodega = $bodega;
            $salida->firma = $firma;

            // Preparar datos para la vista
            $data = [
                'salida' => $salida,
                'detalles' => $detalles,
                'fecha_generacion' => now()->format('d/m/Y H:i:s')
            ];

            Log::info("Generando PDF con Dompdf...");

            // Generar PDF
            $pdf = Pdf::loadView('pdf.salida_materiales', $data);
            $pdf->setPaper('letter', 'portrait');

            Log::info("PDF generado exitosamente");

            // Retornar PDF como descarga
            return $pdf->download("Salida_Materiales_{$numeroSalida}.pdf");

        } catch (Exception $e) {
            Log::error("Error al generar PDF: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Error al generar PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
