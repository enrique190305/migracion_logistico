<?php

require __DIR__.'/vendor/autoload.php';

echo "=== TEST DE GOOGLE SHEETS ===\n\n";

// 1. Verificar que la clase Google\Client existe
echo "1. Verificando clase Google\\Client... ";
if (class_exists('Google\Client')) {
    echo "✓ OK\n";
} else {
    echo "✗ FALLO - Clase no encontrada\n";
    exit(1);
}

// 2. Verificar que el archivo de credenciales existe
$credentialsPath = __DIR__.'/storage/app/google-credentials.json';
echo "2. Verificando archivo de credenciales... ";
if (file_exists($credentialsPath)) {
    echo "✓ OK\n";
} else {
    echo "✗ FALLO - Archivo no encontrado: $credentialsPath\n";
    exit(1);
}

// 3. Intentar crear el cliente de Google
echo "3. Creando cliente de Google... ";
try {
    $client = new Google\Client();
    $client->setAuthConfig($credentialsPath);
    $client->addScope(Google\Service\Sheets::SPREADSHEETS_READONLY);
    echo "✓ OK\n";
} catch (Exception $e) {
    echo "✗ FALLO - " . $e->getMessage() . "\n";
    exit(1);
}

// 4. Intentar crear el servicio de Sheets
echo "4. Creando servicio de Sheets... ";
try {
    $service = new Google\Service\Sheets($client);
    echo "✓ OK\n";
} catch (Exception $e) {
    echo "✗ FALLO - " . $e->getMessage() . "\n";
    exit(1);
}

// 5. Intentar leer datos de la hoja "Vacantes"
echo "5. Leyendo datos de la hoja 'Vacantes'... ";
try {
    $spreadsheetId = '1GvRlWeigVKVKdsd_kNNPcmqJ7Zt7vl0FiDEZmFWcdfU';
    $range = 'Vacantes!A1:J10';
    
    $response = $service->spreadsheets_values->get($spreadsheetId, $range);
    $values = $response->getValues();
    
    if (empty($values)) {
        echo "✗ FALLO - No se encontraron datos\n";
    } else {
        echo "✓ OK - " . count($values) . " filas leídas\n";
        echo "   Encabezados: " . implode(', ', $values[0]) . "\n";
    }
} catch (Exception $e) {
    echo "✗ FALLO - " . $e->getMessage() . "\n";
    exit(1);
}

// 6. Intentar leer datos de la hoja "Postulaciones"
echo "6. Leyendo datos de la hoja 'Postulaciones'... ";
try {
    $range = 'Postulaciones!A1:S10';
    
    $response = $service->spreadsheets_values->get($spreadsheetId, $range);
    $values = $response->getValues();
    
    if (empty($values)) {
        echo "✗ FALLO - No se encontraron datos\n";
    } else {
        echo "✓ OK - " . count($values) . " filas leídas\n";
        echo "   Encabezados: " . implode(', ', $values[0]) . "\n";
    }
} catch (Exception $e) {
    echo "✗ FALLO - " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n=== TODAS LAS PRUEBAS PASARON ===\n";
