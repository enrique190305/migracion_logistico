<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    /**
     * Listar todas las reservas
     */
    public function index()
    {
        try {
            $reservas = Reserva::select('id_reserva', 'tipo_reserva', 'estado', 'fecha_creacion')
                ->get()
                ->map(function ($reserva) {
                    return [
                        'id_reserva' => $reserva->id_reserva,
                        'tipo_reserva' => $reserva->tipo_reserva,
                        'estado' => $reserva->estado,
                        'fecha_creacion' => $reserva->fecha_creacion ? $reserva->fecha_creacion->format('Y-m-d') : null
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $reservas,
                'total' => $reservas->count()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las reservas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener solo reservas activas
     */
    public function activas()
    {
        try {
            $reservas = Reserva::where('estado', 'ACTIVO')
                ->select('id_reserva', 'tipo_reserva')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reservas
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener reservas activas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de reservas
     */
    public function estadisticas()
    {
        try {
            $total = Reserva::count();
            $activas = Reserva::where('estado', 'ACTIVO')->count();
            $inactivas = Reserva::where('estado', 'INACTIVO')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'activas' => $activas,
                    'inactivas' => $inactivas
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar una reserva específica
     */
    public function show($id)
    {
        try {
            $reserva = Reserva::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id_reserva' => $reserva->id_reserva,
                    'tipo_reserva' => $reserva->tipo_reserva,
                    'estado' => $reserva->estado,
                    'fecha_creacion' => $reserva->fecha_creacion ? $reserva->fecha_creacion->format('Y-m-d H:i:s') : null
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Reserva no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Crear una nueva reserva
     */
    public function store(Request $request)
    {
        try {
            // Validar datos
            $validated = $request->validate([
                'tipo_reserva' => 'required|string|max:100',
                'estado' => 'required|in:ACTIVO,INACTIVO'
            ]);

            // Crear reserva
            $reserva = Reserva::create([
                'tipo_reserva' => $validated['tipo_reserva'],
                'estado' => $validated['estado'],
                'fecha_creacion' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reserva creada exitosamente',
                'data' => $reserva
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una reserva existente
     */
    public function update(Request $request, $id)
    {
        try {
            // Buscar reserva
            $reserva = Reserva::findOrFail($id);

            // Validar datos
            $validated = $request->validate([
                'tipo_reserva' => 'required|string|max:100',
                'estado' => 'required|in:ACTIVO,INACTIVO'
            ]);

            // Actualizar reserva
            $reserva->update([
                'tipo_reserva' => $validated['tipo_reserva'],
                'estado' => $validated['estado']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reserva actualizada exitosamente',
                'data' => $reserva
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $e->errors()
            ], 422);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Reserva no encontrada'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una reserva
     */
    public function destroy($id)
    {
        try {
            // Buscar reserva
            $reserva = Reserva::findOrFail($id);

            // Guardar nombre para el mensaje
            $tipoReserva = $reserva->tipo_reserva;

            // Intentar eliminar reserva
            $reserva->delete();

            return response()->json([
                'success' => true,
                'message' => "Reserva '{$tipoReserva}' eliminada exitosamente"
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Reserva no encontrada'
            ], 404);

        } catch (\Illuminate\Database\QueryException $e) {
            // Error de restricción de llave foránea
            if ($e->getCode() == '23000') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la reserva porque tiene registros asociados (proyectos, movimientos, etc.)'
                ], 409);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error de base de datos al eliminar la reserva',
                'error' => $e->getMessage()
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
