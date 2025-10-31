<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FamiliaProducto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class FamiliaProductoController extends Controller
{
    /**
     * Listar todas las familias
     */
    public function index()
    {
        try {
            $familias = FamiliaProducto::with(['subfamilias' => function($query) {
                $query->where('estado', 'ACTIVO');
            }])
            ->where('estado', 'ACTIVO')
            ->orderBy('nombre_familia', 'asc')
            ->get()
            ->map(function($familia) {
                return [
                    'id' => $familia->id_familia,
                    'nombre' => $familia->nombre_familia,
                    'prefijo' => $familia->prefijo_codigo,
                    'descripcion' => $familia->descripcion,
                    'estado' => $familia->estado,
                    'total_subfamilias' => $familia->subfamilias->count(),
                    'fecha_creacion' => $familia->fecha_creacion
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $familias
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener familias',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva familia
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre_familia' => 'required|string|max:50',
            'prefijo_codigo' => 'required|string|max:10|unique:familia,prefijo_codigo',
            'descripcion' => 'nullable|string|max:200',
            'estado' => 'nullable|in:ACTIVO,INACTIVO'
        ], [
            'nombre_familia.required' => 'El nombre de la familia es obligatorio',
            'prefijo_codigo.required' => 'El prefijo es obligatorio',
            'prefijo_codigo.unique' => 'Ya existe una familia con ese prefijo'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $familia = FamiliaProducto::create([
                'nombre_familia' => $request->nombre_familia,
                'prefijo_codigo' => strtoupper($request->prefijo_codigo),
                'descripcion' => $request->descripcion,
                'estado' => $request->estado ?? 'ACTIVO'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Familia creada exitosamente',
                'data' => $familia
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear familia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar familia
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nombre_familia' => 'required|string|max:50',
            'prefijo_codigo' => 'required|string|max:10|unique:familia,prefijo_codigo,' . $id . ',id_familia',
            'descripcion' => 'nullable|string|max:200',
            'estado' => 'nullable|in:ACTIVO,INACTIVO'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $familia = FamiliaProducto::findOrFail($id);
            
            $familia->update([
                'nombre_familia' => $request->nombre_familia,
                'prefijo_codigo' => strtoupper($request->prefijo_codigo),
                'descripcion' => $request->descripcion,
                'estado' => $request->estado ?? $familia->estado
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Familia actualizada exitosamente',
                'data' => $familia
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar familia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar familia (soft delete cambiando estado)
     */
    public function destroy($id)
    {
        try {
            $familia = FamiliaProducto::findOrFail($id);
            
            // Verificar si tiene subfamilias activas
            $tieneSubfamilias = $familia->subfamilias()->where('estado', 'ACTIVO')->exists();
            
            if ($tieneSubfamilias) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la familia porque tiene subfamilias activas'
                ], 400);
            }

            $familia->update(['estado' => 'INACTIVO']);

            return response()->json([
                'success' => true,
                'message' => 'Familia desactivada exitosamente'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar familia',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
