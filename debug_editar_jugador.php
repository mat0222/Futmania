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
    
    // Obtener datos POST
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
    
    // Verificar que el jugador existe ANTES de actualizar
    $checkSql = "SELECT id, numero, nombre, posicion, edad, nacionalidad FROM jugadores WHERE id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Jugador no encontrado');
    }
    
    $jugadorOriginal = $result->fetch_assoc();
    
    // Verificar si hay otro jugador con el mismo número
    $checkNumeroSql = "SELECT id, nombre FROM jugadores WHERE numero = ? AND id != ?";
    $checkNumeroStmt = $conn->prepare($checkNumeroSql);
    $checkNumeroStmt->bind_param("ii", $numero, $id);
    $checkNumeroStmt->execute();
    $resultNumero = $checkNumeroStmt->get_result();
    
    if ($resultNumero->num_rows > 0) {
        $jugadorConNumero = $resultNumero->fetch_assoc();
        throw new Exception("Ya existe un jugador con el número $numero: " . $jugadorConNumero['nombre']);
    }
    
    // INICIAR TRANSACCIÓN
    $conn->begin_transaction();
    
    try {
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
        

        
        // Verificar que solo se actualizó 1 fila
        if ($stmt->affected_rows !== 1) {
            throw new Exception('Error: Se actualizaron ' . $stmt->affected_rows . ' filas en lugar de 1');
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
        

        
        // Verificar el resultado final
        $verificarSql = "SELECT id, numero, nombre, posicion, edad, nacionalidad FROM jugadores WHERE id = ?";
        $verificarStmt = $conn->prepare($verificarSql);
        $verificarStmt->bind_param("i", $id);
        $verificarStmt->execute();
        $resultadoFinal = $verificarStmt->get_result();
        $jugadorFinal = $resultadoFinal->fetch_assoc();
        

        
        // Verificar que no se crearon duplicados
        $contarSql = "SELECT COUNT(*) as total FROM jugadores WHERE nombre = ?";
        $contarStmt = $conn->prepare($contarSql);
        $contarStmt->bind_param("s", $nombre);
        $contarStmt->execute();
        $contarResult = $contarStmt->get_result();
        $total = $contarResult->fetch_assoc()['total'];
        
        if ($total > 1) {
            throw new Exception("ERROR: Se detectaron $total jugadores con el mismo nombre. Posible duplicación.");
        }
        
        // CONFIRMAR TRANSACCIÓN
        $conn->commit();
        
        echo json_encode([
            "success" => true,
            "message" => "Jugador actualizado correctamente",
            "jugador_id" => $id,
            "debug" => [
                "jugador_original" => $jugadorOriginal,
                "jugador_final" => $jugadorFinal,
                "total_con_nombre" => $total
            ]
        ]);
        
    } catch (Exception $e) {
        // REVERTIR TRANSACCIÓN en caso de error
        $conn->rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al editar jugador: " . $e->getMessage()
    ]);
}

$conn->close();
?>
