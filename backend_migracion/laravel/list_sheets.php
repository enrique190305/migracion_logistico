<?php

require __DIR__.'/vendor/autoload.php';

use Google\Client;
use Google\Service\Sheets;

echo "=== LISTANDO HOJAS DISPONIBLES ===\n\n";

$client = new Client();
$credentialsPath = __DIR__.'/storage/app/google-credentials.json';
$client->setAuthConfig($credentialsPath);
$client->addScope(Sheets::SPREADSHEETS_READONLY);

$service = new Sheets($client);
$spreadsheetId = '1GvRlWeigVKVKdsd_kNNPcmqJ7Zt7vl0FiDEZmFWcdfU';

try {
    $spreadsheet = $service->spreadsheets->get($spreadsheetId);
    $sheets = $spreadsheet->getSheets();
    
    echo "Hojas encontradas:\n";
    foreach ($sheets as $sheet) {
        $properties = $sheet->getProperties();
        echo "  - " . $properties->getTitle() . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
