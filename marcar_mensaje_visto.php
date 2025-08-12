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
    
    if (!isset($input['jugador_id'])) {
        throw new Exception('Falta jugador_id');
    }
    
    $jugador_id = $conn->real_escape_string($input['jugador_id']);
    
    // Marcar todos los mensajes entrantes del jugador como vistos
    $sql = "UPDATE mensajes SET visto = 1 
            WHERE jugador_id = '$jugador_id' AND tipo = 'entrante' AND visto = 0";
    
    if (!$conn->query($sql)) {
        throw new Exception('Error al actualizar mensajes: ' . $conn->error);
    }
    
    echo json_encode([
        'success' => true,
        'mensaje' => 'Mensajes marcados como vistos'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al marcar mensajes: ' . $e->getMessage()
    ]);
}
?>
