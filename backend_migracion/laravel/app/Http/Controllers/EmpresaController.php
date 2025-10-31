<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class EmpresaController extends Controller
{
    /**
     * Listar todas las empresas
     */
    public function index()
    {
        try {
            $empresas = Empresa::all();
            
            return response()->json([
                'success' => true,
                'data' => $empresas,
                'message' => 'Empresas obtenidas correctamente'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las empresas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar una empresa específica
     */
    public function show($id)
    {
        try {
            $empresa = Empresa::find($id);
            
            if (!$empresa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Empresa no encontrada'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $empresa,
                'message' => 'Empresa encontrada correctamente'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la empresa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una nueva empresa
     */
    public function store(Request $request)
    {
        try {
            // Validación de datos
            $validator = Validator::make($request->all(), [
                'razon_social' => 'required|string|max:255',
                'ruc' => 'required|string|max:11|unique:empresa,ruc',
                'nombre_comercial' => 'nullable|string|max:255',
                'fecha_creacion' => 'nullable|date',
                'estado_contribuyente' => 'nullable|string|max:100',
                'domicilio_fiscal' => 'nullable|string',
                'actividades_economicas' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $empresa = Empresa::create($request->all());

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $empresa,
                'message' => 'Empresa creada exitosamente'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la empresa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una empresa existente
     */
    public function update(Request $request, $id)
    {
        try {
            $empresa = Empresa::find($id);
            
            if (!$empresa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Empresa no encontrada'
                ], 404);
            }

            // Validación de datos
            $validator = Validator::make($request->all(), [
                'razon_social' => 'sometimes|required|string|max:255',
                'ruc' => 'sometimes|required|string|max:11|unique:empresa,ruc,' . $id . ',id_empresa',
                'nombre_comercial' => 'nullable|string|max:255',
                'fecha_creacion' => 'nullable|date',
                'estado_contribuyente' => 'nullable|string|max:100',
                'domicilio_fiscal' => 'nullable|string',
                'actividades_economicas' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $empresa->update($request->all());

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $empresa,
                'message' => 'Empresa actualizada exitosamente'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la empresa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una empresa
     */
    public function destroy($id)
    {
        try {
            $empresa = Empresa::find($id);
            
            if (!$empresa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Empresa no encontrada'
                ], 404);
            }

            DB::beginTransaction();

            // Verificar si tiene relaciones antes de eliminar
            $tieneOrdenes = $empresa->ordenesCompra()->exists() 
                         || $empresa->ordenesServicio()->exists()
                         || $empresa->ordenesPedido()->exists();
            
            if ($tieneOrdenes) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la empresa porque tiene órdenes asociadas'
                ], 409);
            }

            $empresa->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Empresa eliminada exitosamente'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la empresa',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
