<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$response = [];

try {
    $response['step1'] = 'Iniciando debug de editar jugador';
    
    // Incluir conexión
    require_once 'conexion.php';
    $response['step2'] = 'Conexión incluida';
    
    // Verificar conexión
    if (!$conn) {
        throw new Exception('No hay conexión a la base de datos');
    }
    $response['step3'] = 'Conexión verificada';
    
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
    
    $response['step4'] = 'Datos POST obtenidos';
    $response['datos'] = [
        'id' => $id,
        'numero' => $numero,
        'nombre' => $nombre,
        'posicion' => $posicion,
        'edad' => $edad,
        'nacionalidad' => $nacionalidad,
        'goles' => $goles,
        'asistencias' => $asistencias,
        'partidos' => $partidos,
        'lesiones' => $lesiones
    ];
    
    // Validar datos requeridos
    if (!$id || !$nombre || !$posicion || $numero === null) {
        throw new Exception('Faltan datos requeridos');
    }
    $response['step5'] = 'Datos validados';
    
    // Verificar que el jugador existe
    $checkSql = "SELECT id, numero, nombre, posicion, edad, nacionalidad FROM jugadores WHERE id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Jugador no encontrado');
    }
    
    $jugadorOriginal = $result->fetch_assoc();
    $response['step6'] = 'Jugador original encontrado';
    $response['jugador_original'] = $jugadorOriginal;
    
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
    $response['step7'] = 'Número verificado (no duplicado)';
    
    // INICIAR TRANSACCIÓN
    $conn->begin_transaction();
    $response['step8'] = 'Transacción iniciada';
    
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
        
        $response['step9'] = 'Jugador actualizado en la base de datos';
        
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
        
        $response['step10'] = 'Estadísticas actualizadas';
        
        // Verificar el resultado final
        $verificarSql = "SELECT id, numero, nombre, posicion, edad, nacionalidad FROM jugadores WHERE id = ?";
        $verificarStmt = $conn->prepare($verificarSql);
        $verificarStmt->bind_param("i", $id);
        $verificarStmt->execute();
        $resultadoFinal = $verificarStmt->get_result();
        $jugadorFinal = $resultadoFinal->fetch_assoc();
        
        $response['step11'] = 'Resultado final verificado';
        $response['jugador_final'] = $jugadorFinal;
        
        // Verificar que no se crearon duplicados
        $contarSql = "SELECT COUNT(*) as total FROM jugadores WHERE nombre = ?";
        $contarStmt = $conn->prepare($contarSql);
        $contarStmt->bind_param("s", $nombre);
        $contarStmt->execute();
        $contarResult = $contarStmt->get_result();
        $total = $contarResult->fetch_assoc()['total'];
        
        $response['step12'] = 'Conteo de duplicados verificado';
        $response['total_con_nombre'] = $total;
        
        if ($total > 1) {
            throw new Exception("ERROR: Se detectaron $total jugadores con el mismo nombre. Posible duplicación.");
        }
        
        // CONFIRMAR TRANSACCIÓN
        $conn->commit();
        $response['step13'] = 'Transacción confirmada';
        
        $response['success'] = true;
        $response['message'] = 'Jugador actualizado correctamente';
        $response['jugador_id'] = $id;
        
    } catch (Exception $e) {
        // REVERTIR TRANSACCIÓN en caso de error
        $conn->rollback();
        $response['step_error'] = 'Transacción revertida';
        throw $e;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    $response = [
        "success" => false,
        "message" => "Error al editar jugador: " . $e->getMessage(),
        "step" => "ERROR"
    ];
}

if (isset($conn)) {
    $conn->close();
}

echo json_encode($response);
?>

