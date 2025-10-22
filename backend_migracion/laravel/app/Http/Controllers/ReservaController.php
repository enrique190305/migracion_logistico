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
}
