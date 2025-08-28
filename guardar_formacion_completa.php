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
    
    // For now, return success but no actual saving
    // This can be expanded later to actually save complete formations
    echo json_encode([
        'success' => true,
        'message' => 'Guardado de formación completa no implementado aún'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al guardar formación: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

