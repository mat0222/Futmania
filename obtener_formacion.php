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
    
    $sql = "SELECT f.jugador_id, f.x_pos as x, f.y_pos as y, f.es_titular, j.numero, j.nombre, j.posicion
            FROM formaciones f
            JOIN jugadores j ON j.id = f.jugador_id";
    $res = $conn->query($sql);
    
    if (!$res) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }
    
    $formacion = [];
    while ($row = $res->fetch_assoc()) {
        $formacion[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'formacion' => $formacion
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener formación: ' . $e->getMessage(),
        'formacion' => []
    ]);
}

$conn->close();
?>

