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
    $response['step1'] = 'Iniciando debug';
    
    // Incluir conexión
    require_once 'conexion.php';
    $response['step2'] = 'Conexión incluida';
    
    // Verificar conexión
    if (!$conn) {
        throw new Exception('No hay conexión a la base de datos');
    }
    $response['step3'] = 'Conexión verificada';
    
    // Probar consulta simple
    $testSql = "SELECT COUNT(*) as total FROM jugadores";
    $testResult = $conn->query($testSql);
    
    if (!$testResult) {
        throw new Exception('Error en consulta de prueba: ' . $conn->error);
    }
    
    $total = $testResult->fetch_assoc()['total'];
    $response['step4'] = 'Consulta de prueba exitosa';
    $response['total_jugadores'] = $total;
    
    // Verificar datos POST
    $response['post_data'] = $_POST;
    $response['step5'] = 'Datos POST recibidos';
    
    // Procesar datos básicos
    $id = $_POST['id'] ?? null;
    $nombre = $_POST['nombre'] ?? null;
    
    $response['step6'] = 'Datos básicos procesados';
    $response['id'] = $id;
    $response['nombre'] = $nombre;
    
    // Verificar que el jugador existe
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
            $response['step7'] = 'Jugador no encontrado';
            $response['id_buscado'] = $id;
            $response['success'] = false;
            $response['message'] = "Jugador con ID $id no existe";
        } else {
            $jugador = $result->fetch_assoc();
            $response['step7'] = 'Jugador encontrado';
            $response['jugador'] = $jugador;
            $response['success'] = true;
        }
    } else {
        $response['step7'] = 'No se proporcionó ID';
        $response['success'] = true;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    $response = [
        "success" => false,
        "error" => $e->getMessage(),
        "step" => "ERROR"
    ];
}

if (isset($conn)) {
    $conn->close();
}

echo json_encode($response);
?>

