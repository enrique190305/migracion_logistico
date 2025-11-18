<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PersonalCodigoBarrasController extends Controller
{
    /**
     * Obtener personal activo con su área (tipo_reserva)
     */
    public function obtenerPersonal()
    {
        try {
            $personal = DB::table('movil_persona as mp')
                ->leftJoin('reserva as r', 'mp.id_reserva', '=', 'r.id_reserva')
                ->select(
                    'mp.id_movil_persona',
                    'mp.nom_ape as nombre',
                    'mp.dni as codigo',
                    'r.tipo_reserva as area'
                )
                ->where('mp.estado', '=', 'ACTIVO')
                ->orderBy('mp.nom_ape', 'ASC')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $personal
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener personal: ' . $e->getMessage()
            ], 500);
        }
    }
}
