<?php
// filepath: backend_migracion/laravel/app/Http/Controllers/PersonalController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PersonalController extends Controller
{
    /**
     * Listar todo el personal con sus relaciones
     */
    public function index()
    {
        try {
            $personal = DB::table('personal as p')
                ->leftJoin('proyecto_almacen as pr', 'p.id_proyecto', '=', 'pr.id_proyecto')
                ->leftJoin('area as a', 'p.id_area', '=', 'a.id_area')
                ->select(
                    'p.*',
                    'pr.nombre as nombre_proyecto',
                    'pr.codigo as codigo_proyecto',
                    'a.nombre_area'
                )
                ->orderBy('p.id_personal', 'desc')
                ->get();

            // Convertir firma BLOB a base64 si existe
            foreach ($personal as $persona) {
                if ($persona->firma) {
                    $persona->firma = 'data:image/png;base64,' . base64_encode($persona->firma);
                }
            }

            return response()->json($personal);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el personal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo personal
     */
    public function store(Request $request)
    {
        try {
            // Validación
            $validator = Validator::make($request->all(), [
                'nom_ape' => 'required|string|max:100',
                'dni' => 'required|string|size:8|unique:personal,dni',
                'id_proyecto' => 'required|exists:proyecto_almacen,id_proyecto',
                'id_area' => 'required|exists:area,id_area',
                'ciudad' => 'required|string|max:100',
                'observaciones' => 'nullable|string|max:100',
                'firma' => 'nullable|string' // Base64
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Procesar firma (convertir base64 a BLOB)
            $firmaBlob = null;
            if ($request->firma) {
                // Remover el prefijo data:image/...;base64,
                $firma = $request->firma;
                if (strpos($firma, 'data:image') === 0) {
                    $firma = substr($firma, strpos($firma, ',') + 1);
                }
                $firmaBlob = base64_decode($firma);
            }

            // Insertar personal
            $id = DB::table('personal')->insertGetId([
                'nom_ape' => $request->nom_ape,
                'dni' => $request->dni,
                'id_proyecto' => $request->id_proyecto,
                'id_area' => $request->id_area,
                'ciudad' => $request->ciudad,
                'observaciones' => $request->observaciones ?? '',
                'firma' => $firmaBlob
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Personal registrado exitosamente',
                'id' => $id
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar el personal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ver detalle de un personal
     */
    public function show($id)
    {
        try {
            $persona = DB::table('personal as p')
                ->leftJoin('proyecto_almacen as pr', 'p.id_proyecto', '=', 'pr.id_proyecto')
                ->leftJoin('area as a', 'p.id_area', '=', 'a.id_area')
                ->select(
                    'p.*',
                    'pr.nombre as nombre_proyecto',
                    'a.nombre_area'
                )
                ->where('p.id_personal', $id)
                ->first();

            if (!$persona) {
                return response()->json([
                    'success' => false,
                    'message' => 'Personal no encontrado'
                ], 404);
            }

            // Convertir firma a base64
            if ($persona->firma) {
                $persona->firma = 'data:image/png;base64,' . base64_encode($persona->firma);
            }

            return response()->json($persona);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el personal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar personal
     */
    public function update(Request $request, $id)
    {
        try {
            // Verificar que existe
            $existe = DB::table('personal')->where('id_personal', $id)->exists();
            if (!$existe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Personal no encontrado'
                ], 404);
            }

            // Validación
            $validator = Validator::make($request->all(), [
                'nom_ape' => 'required|string|max:100',
                'dni' => 'required|string|size:8|unique:personal,dni,' . $id . ',id_personal',
                'id_proyecto' => 'required|exists:proyecto_almacen,id_proyecto',
                'id_area' => 'required|exists:area,id_area',
                'ciudad' => 'required|string|max:100',
                'observaciones' => 'nullable|string|max:100',
                'firma' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Preparar datos para actualizar
            $datosActualizar = [
                'nom_ape' => $request->nom_ape,
                'dni' => $request->dni,
                'id_proyecto' => $request->id_proyecto,
                'id_area' => $request->id_area,
                'ciudad' => $request->ciudad,
                'observaciones' => $request->observaciones ?? ''
            ];

            // Procesar firma si se proporciona
            if ($request->has('firma') && $request->firma) {
                $firma = $request->firma;
                if (strpos($firma, 'data:image') === 0) {
                    $firma = substr($firma, strpos($firma, ',') + 1);
                }
                $datosActualizar['firma'] = base64_decode($firma);
            }

            // Actualizar
            DB::table('personal')
                ->where('id_personal', $id)
                ->update($datosActualizar);

            return response()->json([
                'success' => true,
                'message' => 'Personal actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el personal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar personal
     */
    public function destroy($id)
    {
        try {
            // Verificar que existe
            $existe = DB::table('personal')->where('id_personal', $id)->exists();
            if (!$existe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Personal no encontrado'
                ], 404);
            }

            // Verificar si tiene registros relacionados (salidas, etc.)
            // Aquí puedes agregar validaciones adicionales si es necesario

            // Eliminar
            DB::table('personal')->where('id_personal', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Personal eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el personal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener personal por proyecto
     */
    public function porProyecto($idProyecto)
    {
        try {
            $personal = DB::table('personal as p')
                ->leftJoin('area as a', 'p.id_area', '=', 'a.id_area')
                ->select('p.*', 'a.nombre_area')
                ->where('p.id_proyecto', $idProyecto)
                ->get();

            foreach ($personal as $persona) {
                if ($persona->firma) {
                    $persona->firma = 'data:image/png;base64,' . base64_encode($persona->firma);
                }
            }

            return response()->json($personal);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el personal del proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}