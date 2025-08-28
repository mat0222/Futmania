<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    echo json_encode([
        "step" => "1. Iniciando debug",
        "success" => true
    ]);
    
    // Paso 2: Incluir conexión
    require_once 'conexion.php';
    echo json_encode([
        "step" => "2. Conexión incluida",
        "success" => true
    ]);
    
    // Paso 3: Verificar conexión
    if (!$conn) {
        throw new Exception('No hay conexión a la base de datos');
    }
    echo json_encode([
        "step" => "3. Conexión verificada",
        "success" => true
    ]);
    
    // Paso 4: Probar consulta simple
    $testSql = "SELECT COUNT(*) as total FROM jugadores";
    $testResult = $conn->query($testSql);
    
    if (!$testResult) {
        throw new Exception('Error en consulta de prueba: ' . $conn->error);
    }
    
    $total = $testResult->fetch_assoc()['total'];
    echo json_encode([
        "step" => "4. Consulta de prueba exitosa",
        "total_jugadores" => $total,
        "success" => true
    ]);
    
    // Paso 5: Verificar datos POST
    $postData = $_POST;
    echo json_encode([
        "step" => "5. Datos POST recibidos",
        "post_data" => $postData,
        "success" => true
    ]);
    
    // Paso 6: Procesar datos básicos
    $id = $_POST['id'] ?? null;
    $nombre = $_POST['nombre'] ?? null;
    
    echo json_encode([
        "step" => "6. Datos básicos procesados",
        "id" => $id,
        "nombre" => $nombre,
        "success" => true
    ]);
    
    // Paso 7: Verificar que el jugador existe
    if ($id) {
        $checkSql = "SELECT id, nombre FROM jugadores WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        
        if (!$checkStmt) {
            throw new Exception('Error preparando consulta: ' . $conn->error);
        }
        
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        
        if ($result->num_rows === 0) {
            echo json_encode([
                "step" => "7. Jugador no encontrado",
                "id_buscado" => $id,
                "success" => false,
                "message" => "Jugador con ID $id no existe"
            ]);
        } else {
            $jugador = $result->fetch_assoc();
            echo json_encode([
                "step" => "7. Jugador encontrado",
                "jugador" => $jugador,
                "success" => true
            ]);
        }
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "step" => "ERROR"
    ]);
}

if (isset($conn)) {
    $conn->close();
}
?>

