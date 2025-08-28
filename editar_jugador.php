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
    
    $id = $_POST['id'] ?? null;
    $numero = $_POST['numero'] ?? null;
    $nombre = $_POST['nombre'] ?? null;
    $posicion = $_POST['posicion'] ?? null;
    $edad = $_POST['edad'] ?? null;
    $nacionalidad = $_POST['nacionalidad'] ?? null;
    
    $goles = $_POST['goles'] ?? 0;
    $asistencias = $_POST['asistencias'] ?? 0;
    $partidos = $_POST['partidos'] ?? 0;
    $lesiones = $_POST['lesiones'] ?? 0;
    
    if (!$id || !$nombre || !$posicion || $numero === null) {
        throw new Exception('Faltan datos requeridos');
    }
    
    // Verificar que el jugador existe
    $checkSql = "SELECT id FROM jugadores WHERE id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Jugador no encontrado');
    }
    
    // Actualizar datos del jugador
    $sql = "UPDATE jugadores SET numero=?, nombre=?, posicion=?, edad=?, nacionalidad=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Error en la preparación de la consulta: ' . $conn->error);
    }
    
    $stmt->bind_param("issisi", $numero, $nombre, $posicion, $edad, $nacionalidad, $id);
    if (!$stmt->execute()) {
        throw new Exception('Error al actualizar jugador: ' . $stmt->error);
    }
    
    // Insertar o actualizar estadísticas
    $sqlEst = "
        INSERT INTO estadisticas (jugador_id, goles, asistencias, partidos, lesiones)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            goles = VALUES(goles),
            asistencias = VALUES(asistencias),
            partidos = VALUES(partidos),
            lesiones = VALUES(lesiones)
    ";
    $stmt2 = $conn->prepare($sqlEst);
    if (!$stmt2) {
        throw new Exception('Error en la preparación de estadísticas: ' . $conn->error);
    }
    
    $stmt2->bind_param("iiiii", $id, $goles, $asistencias, $partidos, $lesiones);
    if (!$stmt2->execute()) {
        throw new Exception('Error al actualizar estadísticas: ' . $stmt2->error);
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Jugador actualizado correctamente",
        "jugador_id" => $id
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al editar jugador: " . $e->getMessage()
    ]);
}

$conn->close();
?>

