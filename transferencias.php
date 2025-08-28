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
    
    $sql = "SELECT id, nombre, posicion, goles, asistencias, partidos_jugados FROM jugadores";
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }
    
    $jugadores = [];
    while ($row = $result->fetch_assoc()) {
        // Agregar campos faltantes con valores por defecto
        $row['valor_mercado'] = 1000000; // Valor por defecto
        $row['en_equipo'] = true; // Por defecto en equipo
        $row['partidos'] = $row['partidos_jugados']; // Mapear partidos_jugados a partidos
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
