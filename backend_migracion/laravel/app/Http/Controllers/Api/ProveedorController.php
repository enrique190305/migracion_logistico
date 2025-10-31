<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class ProveedorController extends Controller
{
    /**
     * Listar todos los proveedores
     */
    public function index()
    {
        try {
            $proveedores = Proveedor::select(
                    'id_proveedor as id',
                    'nombre as proveedor',
                    'ruc',
                    'direccion',
                    'contacto',
                    'celular as telefono',
                    'correo as email',
                    'forma_pago as formaPago',
                    'servicio as servicios'
                )
                ->orderBy('id_proveedor', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $proveedores
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener proveedores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un proveedor específico por ID
     */
    public function show($id)
    {
        try {
            $proveedor = Proveedor::select(
                    'id_proveedor as id',
                    'nombre as proveedor',
                    'ruc',
                    'direccion',
                    'contacto',
                    'celular as telefono',
                    'correo as email',
                    'forma_pago as formaPago',
                    'servicio as servicios'
                )
                ->where('id_proveedor', $id)
                ->first();

            if (!$proveedor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proveedor no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $proveedor
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo proveedor
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'ruc' => 'required|string|size:11|unique:proveedor,ruc',
            'direccion' => 'nullable|string|max:255',
            'contacto' => 'nullable|string|max:100',
            'celular' => 'nullable|string|max:20',
            'correo' => 'nullable|email|max:100',
            'numero_cuenta' => 'nullable|string|max:50',
            'id_banco' => 'nullable|exists:banco,id_banco',
            'forma_pago' => 'nullable|string|max:100',
            'servicio' => 'nullable|string'
        ], [
            'nombre.required' => 'El nombre del proveedor es obligatorio',
            'ruc.required' => 'El RUC es obligatorio',
            'ruc.size' => 'El RUC debe tener 11 dígitos',
            'ruc.unique' => 'Ya existe un proveedor con ese RUC',
            'correo.email' => 'El formato del email no es válido'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $proveedor = Proveedor::create([
                'nombre' => $request->nombre,
                'ruc' => $request->ruc,
                'direccion' => $request->direccion,
                'contacto' => $request->contacto,
                'celular' => $request->celular,
                'correo' => $request->correo,
                'numer_cuenta' => $request->numero_cuenta,  // Mapear al nombre correcto de la BD
                'id_banco' => $request->id_banco,
                'forma_pago' => $request->forma_pago,
                'servicio' => $request->servicio
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Proveedor creado exitosamente',
                'data' => [
                    'id' => $proveedor->id_proveedor,
                    'proveedor' => $proveedor->nombre,
                    'ruc' => $proveedor->ruc,
                    'direccion' => $proveedor->direccion,
                    'contacto' => $proveedor->contacto,
                    'telefono' => $proveedor->celular,
                    'email' => $proveedor->correo,
                    'formaPago' => $proveedor->forma_pago,
                    'servicios' => $proveedor->servicio
                ]
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un proveedor
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'ruc' => 'required|string|size:11|unique:proveedor,ruc,' . $id . ',id_proveedor',
            'direccion' => 'nullable|string|max:255',
            'contacto' => 'nullable|string|max:100',
            'celular' => 'nullable|string|max:20',
            'correo' => 'nullable|email|max:100',
            'numero_cuenta' => 'nullable|string|max:50',
            'id_banco' => 'nullable|exists:banco,id_banco',
            'forma_pago' => 'nullable|string|max:100',
            'servicio' => 'nullable|string'
        ], [
            'nombre.required' => 'El nombre del proveedor es obligatorio',
            'ruc.required' => 'El RUC es obligatorio',
            'ruc.size' => 'El RUC debe tener 11 dígitos',
            'ruc.unique' => 'Ya existe un proveedor con ese RUC',
            'correo.email' => 'El formato del email no es válido'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $proveedor = Proveedor::where('id_proveedor', $id)->firstOrFail();

            $proveedor->update([
                'nombre' => $request->nombre,
                'ruc' => $request->ruc,
                'direccion' => $request->direccion,
                'contacto' => $request->contacto,
                'celular' => $request->celular,
                'correo' => $request->correo,
                'numer_cuenta' => $request->numero_cuenta,  // Mapear al nombre correcto de la BD
                'id_banco' => $request->id_banco,
                'forma_pago' => $request->forma_pago,
                'servicio' => $request->servicio
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Proveedor actualizado exitosamente',
                'data' => [
                    'id' => $proveedor->id_proveedor,
                    'proveedor' => $proveedor->nombre,
                    'ruc' => $proveedor->ruc,
                    'direccion' => $proveedor->direccion,
                    'contacto' => $proveedor->contacto,
                    'telefono' => $proveedor->celular,
                    'email' => $proveedor->correo,
                    'formaPago' => $proveedor->forma_pago,
                    'servicios' => $proveedor->servicio
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un proveedor
     */
    public function destroy($id)
    {
        try {
            $proveedor = Proveedor::where('id_proveedor', $id)->firstOrFail();
            $proveedor->delete();

            return response()->json([
                'success' => true,
                'message' => 'Proveedor eliminado exitosamente'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar proveedores
     */
    public function buscar(Request $request)
    {
        try {
            $criterio = $request->query('q', '');

            $proveedores = Proveedor::where('nombre', 'LIKE', "%{$criterio}%")
                ->orWhere('ruc', 'LIKE', "%{$criterio}%")
                ->orWhere('contacto', 'LIKE', "%{$criterio}%")
                ->select(
                    'id_proveedor as id',
                    'nombre as proveedor',
                    'ruc',
                    'direccion',
                    'contacto',
                    'celular as telefono',
                    'correo as email',
                    'forma_pago as formaPago',
                    'servicio as servicios'
                )
                ->orderBy('id_proveedor', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $proveedores
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al buscar proveedores',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}