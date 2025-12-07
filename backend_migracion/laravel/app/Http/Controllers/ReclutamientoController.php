<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Client;
use Google\Service\Sheets;

class ReclutamientoController extends Controller
{
    private $spreadsheetId = '1GvRlWeigVKVKdsd_kNNPcmqJ7Zt7vl0FiDEZmFWcdfU';
    
    /**
     * Convierte un número de columna a letra (1=A, 2=B, 27=AA, etc.)
     */
    private function getColumnLetter($columnNumber)
    {
        $letter = '';
        while ($columnNumber > 0) {
            $columnNumber--;
            $letter = chr(65 + ($columnNumber % 26)) . $letter;
            $columnNumber = intval($columnNumber / 26);
        }
        return $letter;
    }
    
    /**
     * Inicializa el cliente de Google Sheets
     */
    private function getGoogleSheetsService($readonly = true)
    {
        try {
            $client = new Client();
            
            $client->setApplicationName('Process-One Reclutamiento');
            
            // Usar scope de solo lectura o lectura/escritura según el parámetro
            if ($readonly) {
                $client->setScopes([Sheets::SPREADSHEETS_READONLY]);
            } else {
                $client->setScopes([Sheets::SPREADSHEETS]);
            }
            
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
                'message' => 'Error al obtener postulante: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualiza una vacante en Google Sheets
     */
    public function updateVacante(Request $request, $job_key)
    {
        try {

            // Validar datos
            $request->validate([
                'nombre_vacante' => 'required|string',
                'estado' => 'required|in:activa,inactiva',
                'min_years' => 'required|numeric|min:0',
                'threshold' => 'required|numeric|min:0|max:100',
                'target_titles' => 'required|string',
            ]);

            $service = $this->getGoogleSheetsService(false); // false = modo escritura
            $range = 'Vacantes!A:J';
            
            // Obtener todos los datos actuales
            $response = $service->spreadsheets_values->get($this->spreadsheetId, $range);
            $values = $response->getValues();
            
            if (empty($values)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontraron vacantes'
                ], 404);
            }

            // Primera fila son los headers
            $headers = array_shift($values);
            
            // Buscar la fila de la vacante por job_key
            $filaEncontrada = -1;
            $vacanteOriginal = null;
            foreach ($values as $index => $row) {
                $row = array_pad($row, count($headers), '');
                $vacante = array_combine($headers, $row);
                
                if ($vacante['job_key'] === $job_key) {
                    $filaEncontrada = $index + 2; // +2 porque: +1 por headers, +1 por índice base 0
                    $vacanteOriginal = $row; // Guardar la fila original completa
                    break;
                }
            }
            
            if ($filaEncontrada === -1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vacante no encontrada'
                ], 404);
            }

            // Crear un array asociativo con los datos originales
            $datosActualizados = array_combine($headers, $vacanteOriginal);
            
            // Actualizar solo los campos que se enviaron
            $datosActualizados['nombre_vacante'] = $request->nombre_vacante;
            $datosActualizados['estado'] = $request->estado;
            $datosActualizados['min_years'] = $request->min_years;
            $datosActualizados['threshold'] = $request->threshold;
            $datosActualizados['target_titles'] = $request->target_titles;
            
            // Convertir de nuevo a array indexado en el mismo orden que los headers
            $nuevaFila = [];
            foreach ($headers as $header) {
                $nuevaFila[] = $datosActualizados[$header] ?? '';
            }


            // Calcular el rango completo según el número de columnas
            $ultimaColumna = $this->getColumnLetter(count($headers));
            $rangeUpdate = "Vacantes!A{$filaEncontrada}:{$ultimaColumna}{$filaEncontrada}";
            $body = new \Google\Service\Sheets\ValueRange([
                'values' => [$nuevaFila]
            ]);
            
            $params = [
                'valueInputOption' => 'RAW'
            ];
            
            $result = $service->spreadsheets_values->update(
                $this->spreadsheetId,
                $rangeUpdate,
                $body,
                $params
            );


            return response()->json([
                'success' => true,
                'message' => 'Vacante actualizada exitosamente',
                'data' => [
                    'job_key' => $job_key,
                    'nombre_vacante' => $request->nombre_vacante,
                    'estado' => $request->estado,
                    'min_years' => $request->min_years,
                    'threshold' => $request->threshold,
                    'target_titles' => $request->target_titles,
                ]
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar vacante: ' . $e->getMessage()
            ], 500);
        }
    }
}
