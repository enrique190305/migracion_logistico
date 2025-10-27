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

    /**
     * Crear una nueva bodega
     */
    public function store(Request $request)
    {
        try {
            // Validar datos
            $validated = $request->validate([
                'nombre' => 'required|string|max:100',
                'ubicacion' => 'required|string|max:150',
                'id_empresa' => 'required|integer|exists:empresa,id_empresa',
                'estado' => 'required|in:ACTIVO,INACTIVO'
            ]);

            // Crear bodega
            $bodega = Bodega::create([
                'nombre' => $validated['nombre'],
                'ubicacion' => $validated['ubicacion'],
                'id_empresa' => $validated['id_empresa'],
                'estado' => $validated['estado'],
                'fecha_creacion' => now()
            ]);

            // Cargar relación con empresa
            $bodega->load('empresa:id_empresa,razon_social');

            return response()->json([
                'success' => true,
                'message' => 'Bodega creada exitosamente',
                'data' => $bodega
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
                'message' => 'Error al crear la bodega',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una bodega existente
     */
    public function update(Request $request, $id)
    {
        try {
            // Buscar bodega
            $bodega = Bodega::findOrFail($id);

            // Validar datos
            $validated = $request->validate([
                'nombre' => 'required|string|max:100',
                'ubicacion' => 'required|string|max:150',
                'id_empresa' => 'required|integer|exists:empresa,id_empresa',
                'estado' => 'required|in:ACTIVO,INACTIVO'
            ]);

            // Actualizar bodega
            $bodega->update([
                'nombre' => $validated['nombre'],
                'ubicacion' => $validated['ubicacion'],
                'id_empresa' => $validated['id_empresa'],
                'estado' => $validated['estado']
            ]);

            // Cargar relación con empresa
            $bodega->load('empresa:id_empresa,razon_social');

            return response()->json([
                'success' => true,
                'message' => 'Bodega actualizada exitosamente',
                'data' => $bodega
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
                'message' => 'Bodega no encontrada'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la bodega',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una bodega
     */
    public function destroy($id)
    {
        try {
            // Buscar bodega
            $bodega = Bodega::findOrFail($id);

            // Guardar nombre para el mensaje
            $nombreBodega = $bodega->nombre;

            // Intentar eliminar bodega
            $bodega->delete();

            return response()->json([
                'success' => true,
                'message' => "Bodega '{$nombreBodega}' eliminada exitosamente"
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bodega no encontrada'
            ], 404);

        } catch (\Illuminate\Database\QueryException $e) {
            // Error de restricción de llave foránea
            if ($e->getCode() == '23000') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la bodega porque tiene registros asociados (productos, movimientos, etc.)'
                ], 409);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error de base de datos al eliminar la bodega',
                'error' => $e->getMessage()
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la bodega',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
