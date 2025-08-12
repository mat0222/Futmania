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
    
    // Obtener mensajes de la base de datos
    $sql = "SELECT m.*, j.nombre as nombre_jugador, j.posicion, j.numero 
            FROM mensajes m 
            LEFT JOIN jugadores j ON m.jugador_id = j.id 
            ORDER BY m.fecha_creacion ASC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }
    
    // Organizar mensajes por contacto
    $mensajes_organizados = [];
    while ($row = $result->fetch_assoc()) {
        $jugador_id = $row['jugador_id'];
        if (!isset($mensajes_organizados[$jugador_id])) {
            $mensajes_organizados[$jugador_id] = [];
        }
        
        $mensajes_organizados[$jugador_id][] = [
            'id' => $row['id'],
            'texto' => $row['mensaje'],
            'tipo' => $row['tipo'], // 'entrante' o 'saliente'
            'hora' => date('H:i', strtotime($row['fecha_creacion'])),
            'visto' => (bool)$row['visto']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'mensajes' => $mensajes_organizados
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener mensajes: ' . $e->getMessage()
    ]);
}
?>
