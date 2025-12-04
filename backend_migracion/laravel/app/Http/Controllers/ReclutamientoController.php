<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Client;
use Google\Service\Sheets;

class ReclutamientoController extends Controller
{
    private $spreadsheetId = '1GvRlWeigVKVKdsd_kNNPcmqJ7Zt7vl0FiDEZmFWcdfU';
    
    /**
     * Inicializa el cliente de Google Sheets
     */
    private function getGoogleSheetsService()
    {
        try {
            $client = new Client();
            
            $client->setApplicationName('Process-One Reclutamiento');
            $client->setScopes([Sheets::SPREADSHEETS_READONLY]);
            
            // Usa las credenciales de Service Account desde el archivo .env
            $credentialsPath = storage_path('app/google-credentials.json');
            
            if (!file_exists($credentialsPath)) {
                throw new \Exception('No se encontró el archivo de credenciales de Google');
            }
            
            $client->setAuthConfig($credentialsPath);
            
            $service = new Sheets($client);
            
            return $service;
        } catch (\Exception $e) {
            throw $e;
        }
    }
    
    /**
     * Obtiene todas las vacantes desde Google Sheets
     */
    public function getVacantes(Request $request)
    {
        try {
            
            $service = $this->getGoogleSheetsService();
            $range = 'Vacantes!A:J'; // Todas las columnas de la hoja Vacantes
            
            $response = $service->spreadsheets_values->get($this->spreadsheetId, $range);
            $values = $response->getValues();
            
            if (empty($values)) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }
            
            // Primera fila son los headers
            $headers = array_shift($values);
            
            // Convertir a array asociativo
            $vacantes = array_map(function($row) use ($headers) {
                // Rellenar con valores vacíos si faltan columnas
                $row = array_pad($row, count($headers), '');
                return array_combine($headers, $row);
            }, $values);
            
            // Aplicar filtros si existen
            if ($request->has('estado') && $request->estado !== '') {
                $vacantes = array_filter($vacantes, function($vacante) use ($request) {
                    return $vacante['estado'] === $request->estado;
                });
            }
            
            if ($request->has('busqueda') && $request->busqueda !== '') {
                $busqueda = strtolower($request->busqueda);
                $vacantes = array_filter($vacantes, function($vacante) use ($busqueda) {
                    return stripos($vacante['nombre_vacante'], $busqueda) !== false ||
                           stripos($vacante['job_key'], $busqueda) !== false;
                });
            }

            return response()->json([
                'success' => true,
                'data' => array_values($vacantes)
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener vacantes: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Obtiene todos los postulantes desde Google Sheets
     */
    public function getPostulantes(Request $request)
    {
        try {
            
            $service = $this->getGoogleSheetsService();
            $range = 'Postulantes!A:S'; // Todas las columnas de la hoja Postulantes
            
            $response = $service->spreadsheets_values->get($this->spreadsheetId, $range);
            $values = $response->getValues();
            
            if (empty($values)) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }
            
            // Primera fila son los headers
            $headers = array_shift($values);
            
            // Convertir a array asociativo
            $postulantes = array_map(function($row) use ($headers) {
                // Rellenar con valores vacíos si faltan columnas
                $row = array_pad($row, count($headers), '');
                return array_combine($headers, $row);
            }, $values);
            
            // Aplicar filtros
            if ($request->has('idoneo') && $request->idoneo !== '') {
                $postulantes = array_filter($postulantes, function($postulante) use ($request) {
                    return strtolower($postulante['idoneo']) === strtolower($request->idoneo);
                });
            }
            
            if ($request->has('puntuacion_min') && $request->puntuacion_min !== '') {
                $postulantes = array_filter($postulantes, function($postulante) use ($request) {
                    return floatval($postulante['puntuacion']) >= floatval($request->puntuacion_min);
                });
            }
            
            if ($request->has('busqueda') && $request->busqueda !== '') {
                $busqueda = strtolower($request->busqueda);
                $postulantes = array_filter($postulantes, function($postulante) use ($busqueda) {
                    return stripos($postulante['nombre'], $busqueda) !== false ||
                           stripos($postulante['correo'], $busqueda) !== false ||
                           stripos($postulante['puesto_objetivo'], $busqueda) !== false;
                });
            }
            
            return response()->json([
                'success' => true,
                'data' => array_values($postulantes)
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener postulantes: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Obtiene el detalle de un postulante específico
     */
    public function getPostulanteDetalle($id_unico)
    {
        try {
            $service = $this->getGoogleSheetsService();
            $range = 'Postulantes!A:S';
            
            $response = $service->spreadsheets_values->get($this->spreadsheetId, $range);
            $values = $response->getValues();
            
            if (empty($values)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontraron postulantes'
                ], 404);
            }
            
            $headers = array_shift($values);
            
            // Buscar el postulante por id_unico
            foreach ($values as $row) {
                $row = array_pad($row, count($headers), '');
                $postulante = array_combine($headers, $row);
                
                if ($postulante['id_unico'] === $id_unico) {
                    return response()->json([
                        'success' => true,
                        'data' => $postulante
                    ]);
                }
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Postulante no encontrado'
            ], 404);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalle del postulante: ' . $e->getMessage()
            ], 500);
        }
    }
}
