<?php
// filepath: c:\Users\dvent\Desktop\Processmart\Migracion_web\migracion_logistico\backend_migracion\controllers\RegistroProyecto.php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Manejo de preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

class RegistroProyectoController {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function crearProyecto($data) {
        try {
            // TODO: Implementar cuando se creen las tablas en la BD
            // Ejemplo de estructura:
            /*
            $query = "INSERT INTO proyectos 
                     (bodega_id, ubicacion, tipo_reserva, area_ejecucion, 
                      movil_tipo, movil_nombre, responsable, descripcion, 
                      fecha_inicio, fecha_fin, estado, proyecto_padre_id) 
                     VALUES 
                     (:bodega_id, :ubicacion, :tipo_reserva, :area_ejecucion,
                      :movil_tipo, :movil_nombre, :responsable, :descripcion,
                      :fecha_inicio, :fecha_fin, :estado, :proyecto_padre_id)";
            
            $stmt = $this->conn->prepare($query);
            
            // Bind parameters
            $stmt->bindParam(':bodega_id', $data['bodega_id']);
            $stmt->bindParam(':ubicacion', $data['ubicacion']);
            // ... más parámetros
            
            if ($stmt->execute()) {
                return ['success' => true, 'id' => $this->conn->lastInsertId()];
            }
            */
            
            return [
                'success' => true,
                'message' => 'Proyecto registrado (simulación)',
                'data' => $data
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al registrar proyecto: ' . $e->getMessage()
            ];
        }
    }
    
    public function obtenerProyectos() {
        // TODO: Implementar consulta real
        return [
            'success' => true,
            'proyectos' => []
        ];
    }
    
    public function obtenerSubproyectos($proyecto_id) {
        // TODO: Implementar consulta real
        return [
            'success' => true,
            'subproyectos' => []
        ];
    }
}

// Manejo de requests
$controller = new RegistroProyectoController();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $result = $controller->crearProyecto($data);
        echo json_encode($result);
        break;
        
    case 'GET':
        if (isset($_GET['proyecto_id'])) {
            $result = $controller->obtenerSubproyectos($_GET['proyecto_id']);
        } else {
            $result = $controller->obtenerProyectos();
        }
        echo json_encode($result);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}
?>