<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

try {
    require_once 'conexion.php';
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['jugador_id']) || !isset($input['mensaje']) || !isset($input['tipo'])) {
        throw new Exception('Faltan parámetros requeridos');
    }
    
    $jugador_id = $conn->real_escape_string($input['jugador_id']);
    $mensaje = $conn->real_escape_string($input['mensaje']);
    $tipo = $conn->real_escape_string($input['tipo']); // 'entrante' o 'saliente'
    $visto = ($tipo === 'saliente') ? 0 : 1; // Los mensajes salientes empiezan como no vistos
    
    $sql = "INSERT INTO mensajes (jugador_id, mensaje, tipo, fecha_creacion, visto) 
            VALUES ('$jugador_id', '$mensaje', '$tipo', NOW(), $visto)";
    
    if (!$conn->query($sql)) {
        throw new Exception('Error al insertar mensaje: ' . $conn->error);
    }
    
    $mensaje_id = $conn->insert_id;
    
    echo json_encode([
        'success' => true,
        'mensaje_id' => $mensaje_id,
        'mensaje' => 'Mensaje guardado correctamente'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al guardar mensaje: ' . $e->getMessage()
    ]);
}
?>
