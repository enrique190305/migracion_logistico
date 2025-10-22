<?php

namespace App\Http\Controllers;

use App\Models\Bodega;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BodegaController extends Controller
{
    /**
     * Listar todas las bodegas con información de la empresa
     */
    public function index()
    {
        try {
            $bodegas = Bodega::with('empresa:id_empresa,razon_social')
                ->select('id_bodega', 'id_empresa', 'nombre', 'ubicacion', 'estado', 'fecha_creacion')
                ->get()
                ->map(function ($bodega) {
                    return [
                        'id_bodega' => $bodega->id_bodega,
                        'nombre' => $bodega->nombre,
                        'ubicacion' => $bodega->ubicacion,
                        'estado' => $bodega->estado,
                        'fecha_creacion' => $bodega->fecha_creacion ? $bodega->fecha_creacion->format('Y-m-d') : null,
                        'empresa' => [
                            'id_empresa' => $bodega->empresa->id_empresa ?? null,
                            'razon_social' => $bodega->empresa->razon_social ?? 'Sin empresa'
                        ]
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $bodegas,
                'total' => $bodegas->count()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las bodegas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener bodegas por empresa
     */
    public function porEmpresa($idEmpresa)
    {
        try {
            $bodegas = Bodega::where('id_empresa', $idEmpresa)
                ->where('estado', 'ACTIVO')
                ->select('id_bodega', 'nombre', 'ubicacion')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $bodegas
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener bodegas por empresa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de bodegas
     */
    public function estadisticas()
    {
        try {
            $total = Bodega::count();
            $activas = Bodega::where('estado', 'ACTIVO')->count();
            $inactivas = Bodega::where('estado', 'INACTIVO')->count();
            $porEmpresa = Bodega::select('id_empresa', DB::raw('count(*) as total'))
                ->groupBy('id_empresa')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'activas' => $activas,
                    'inactivas' => $inactivas,
                    'por_empresa' => $porEmpresa
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
     * Mostrar una bodega específica
     */
    public function show($id)
    {
        try {
            $bodega = Bodega::with('empresa:id_empresa,razon_social')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id_bodega' => $bodega->id_bodega,
                    'nombre' => $bodega->nombre,
                    'ubicacion' => $bodega->ubicacion,
                    'estado' => $bodega->estado,
                    'fecha_creacion' => $bodega->fecha_creacion ? $bodega->fecha_creacion->format('Y-m-d H:i:s') : null,
                    'empresa' => [
                        'id_empresa' => $bodega->empresa->id_empresa ?? null,
                        'razon_social' => $bodega->empresa->razon_social ?? null
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bodega no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }
}
