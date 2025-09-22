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
        SELECT 
            j.id, 
            j.numero,
            j.nombre, 
            j.posicion, 
            j.edad,
            j.nacionalidad,
            j.partidos_jugados,
            j.en_equipo,
            IFNULL(e.goles, 0) as goles,
            IFNULL(e.asistencias, 0) as asistencias,
            IFNULL(e.partidos, 0) as partidos,
            IFNULL(e.lesiones, 0) as lesiones
        FROM jugadores j
        LEFT JOIN estadisticas e ON j.id = e.jugador_id
        ORDER BY j.numero ASC
    ";
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }
    
    $jugadores = [];
    while ($row = $result->fetch_assoc()) {
        // Agregar campos faltantes con valores por defecto
        $row['valor_mercado'] = rand(500000, 5000000); // Valor aleatorio entre 500k y 5M
        $jugadores[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'jugadores' => $jugadores
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener jugadores: ' . $e->getMessage(),
        'jugadores' => []
    ]);
}

$conn->close();
?>
