<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    require_once 'conexion.php';
    
    // For now, return success but no imported players
    // This can be expanded later to actually import players
    echo json_encode([
        'success' => true,
        'message' => 'Importación de jugadores no implementada aún',
        'jugadores_importados' => 0
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en importación: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

