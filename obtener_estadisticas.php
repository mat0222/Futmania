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
    
    $sql = "
    SELECT j.id, j.numero, j.nombre, j.posicion,
           IFNULL(e.goles, 0) AS goles,
           IFNULL(e.asistencias, 0) AS asistencias,
           IFNULL(e.partidos, 0) AS partidos,
           IFNULL(e.lesiones, 0) AS lesiones
    FROM jugadores j
    LEFT JOIN estadisticas e ON j.id = e.jugador_id
    ORDER BY j.numero ASC
    ";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }
    
    $datos = [];
    while ($row = $result->fetch_assoc()) {
        $datos[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'estadisticas' => $datos
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener estadísticas: ' . $e->getMessage(),
        'estadisticas' => []
    ]);
}

$conn->close();
?>
