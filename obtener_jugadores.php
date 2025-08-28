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
    
    // Consulta actualizada con los campos reales de la tabla jugadores y estadísticas
    $result = $conn->query("
        SELECT 
            j.id, 
            j.numero, 
            j.nombre, 
            j.posicion, 
            j.edad, 
            j.nacionalidad, 
            j.partidos_jugados,
            IFNULL(e.goles, 0) as goles,
            IFNULL(e.asistencias, 0) as asistencias,
            IFNULL(e.partidos, 0) as partidos,
            IFNULL(e.lesiones, 0) as lesiones
        FROM jugadores j
        LEFT JOIN estadisticas e ON j.id = e.jugador_id
        ORDER BY j.numero ASC
    ");
    
    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }
    
    $jugadores = [];
    
    while ($row = $result->fetch_assoc()) {
        // Agregar campos faltantes con valores por defecto
        $row['valor_mercado'] = 1000000; // Valor por defecto
        $row['en_equipo'] = true; // Por defecto en equipo
        
        // Convertimos en_equipo a booleano verdadero/falso para el JSON
        $row['en_equipo'] = (bool)$row['en_equipo'];
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

