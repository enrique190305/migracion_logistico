<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banco;
use Illuminate\Http\Request;
use Exception;

class BancoController extends Controller
{
    /**
     * Listar todos los bancos activos
     */
    public function index()
    {
        try {
            $bancos = Banco::select(
                    'id_banco as id',
                    'nombre_banco as nombre',
                    'codigo_banco as codigo',
                    'logo_banco as logo'
                )
                ->where('activo', 1)
                ->orderBy('nombre_banco', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $bancos
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener bancos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un banco específico por ID
     */
    public function show($id)
    {
        try {
            $banco = Banco::select(
                    'id_banco as id',
                    'nombre_banco as nombre',
                    'codigo_banco as codigo',
                    'logo_banco as logo'
                )
                ->where('id_banco', $id)
                ->where('activo', 1)
                ->first();

            if (!$banco) {
                return response()->json([
                    'success' => false,
                    'message' => 'Banco no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $banco
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener banco',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
