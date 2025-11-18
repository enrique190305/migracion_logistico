<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class PrestamosController extends Controller
{
    /**
     * Guardar múltiples préstamos
     */
    public function guardarPrestamos(Request $request)
    {
        try {
            $prestamos = $request->input('prestamos', []);
            
            if (empty($prestamos)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay préstamos para guardar'
                ], 400);
            }

            $prestamosGuardados = [];

            DB::beginTransaction();

            foreach ($prestamos as $prestamo) {
                // Buscar id_movil_persona por DNI
                $movilPersona = DB::table('movil_persona')
                    ->where('dni', $prestamo['dni'])
                    ->where('estado', 'ACTIVO')
                    ->first();

                if (!$movilPersona) {
                    throw new Exception("No se encontró persona con DNI: " . $prestamo['dni']);
                }

                // Preparar datos para insertar
                $datosInsertar = [
                    'id_movil_persona' => $movilPersona->id_movil_persona,
                    'codigo_producto' => $prestamo['codigo_producto'],
                    'tipo_producto' => $prestamo['tipo_producto'],
                    'cantidad' => $prestamo['cantidad'],
                    'condicion_inicial' => $prestamo['condicion_inicial'],
                    'dni' => $prestamo['dni'],
                    'nom_ape' => $prestamo['nom_ape'],
                    'fecha_prestamo' => now(),
                    'fecha_devolucion' => null,
                    'estado' => 'PRESTADO'
                ];

                // Agregar campos opcionales solo si existen en la tabla
                if (isset($prestamo['condicion_descripcion'])) {
                    $datosInsertar['condicion_descripcion'] = $prestamo['condicion_descripcion'];
                }
                if (isset($prestamo['unidad'])) {
                    $datosInsertar['unidad'] = $prestamo['unidad'];
                }
                if (isset($prestamo['observaciones'])) {
                    $datosInsertar['observaciones'] = $prestamo['observaciones'];
                }

                // Insertar préstamo
                $idPrestamo = DB::table('prestamos_clientes')->insertGetId($datosInsertar);

                $prestamosGuardados[] = $idPrestamo;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($prestamosGuardados) . ' préstamo(s) guardado(s) exitosamente',
                'data' => [
                    'ids' => $prestamosGuardados,
                    'total' => count($prestamosGuardados)
                ]
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar préstamos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener historial de préstamos
     */
    public function obtenerHistorial()
    {
        try {
            $prestamos = DB::table('prestamos_clientes as pc')
                ->leftJoin('movil_persona as mp', 'pc.id_movil_persona', '=', 'mp.id_movil_persona')
                ->leftJoin('reserva as r', 'mp.id_reserva', '=', 'r.id_reserva')
                ->leftJoin('producto as p', 'pc.codigo_producto', '=', 'p.codigo_producto')
                ->select(
                    'pc.id_prestamo as id',
                    'pc.codigo_producto as codigoProducto',
                    DB::raw('COALESCE(p.descripcion, pc.tipo_producto) as nombreProducto'),
                    'pc.cantidad',
                    'pc.unidad as unidadMedida',
                    'pc.dni as codigoUsuario',
                    'pc.nom_ape as nombreUsuario',
                    'pc.condicion_inicial as condicionInicial',
                    'pc.condicion_descripcion as condicionDescripcion',
                    'pc.observaciones as observacion',
                    DB::raw('DATE_FORMAT(pc.fecha_prestamo, "%d/%m/%Y %H:%i:%s") as fechaPrestamo'),
                    DB::raw('IF(pc.fecha_devolucion IS NOT NULL, DATE_FORMAT(pc.fecha_devolucion, "%d/%m/%Y %H:%i:%s"), NULL) as fechaDevolucion'),
                    'pc.estado'
                )
                ->orderBy('pc.fecha_prestamo', 'DESC')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $prestamos
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Devolver préstamo(s)
     */
    public function devolverPrestamos(Request $request)
    {
        try {
            $ids = $request->input('ids', []);
            
            if (empty($ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se proporcionaron IDs de préstamos'
                ], 400);
            }

            DB::beginTransaction();

            $affected = DB::table('prestamos_clientes')
                ->whereIn('id_prestamo', $ids)
                ->where('estado', 'PRESTADO')
                ->update([
                    'fecha_devolucion' => now(),
                    'estado' => 'DEVUELTO'
                ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $affected . ' préstamo(s) devuelto(s) exitosamente',
                'data' => [
                    'total_devueltos' => $affected
                ]
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al devolver préstamos: ' . $e->getMessage()
            ], 500);
        }
    }
}
