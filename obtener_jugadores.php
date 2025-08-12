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
    
    // Consulta actualizada con todos los campos de la tabla jugadores
    $result = $conn->query("
        SELECT 
            id, 
            numero, 
            nombre, 
            posicion, 
            edad, 
            nacionalidad, 
            goles, 
            asistencias, 
            partidos, 
            valor_mercado, 
            en_equipo 
        FROM jugadores 
        ORDER BY numero ASC
    ");
    
    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }
    
    $jugadores = [];
    
    while ($row = $result->fetch_assoc()) {
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

