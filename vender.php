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
    
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);
    $valor = floatval($data['valor'] ?? 0);
    
    if (!$id || $valor <= 0) {
        throw new Exception('Datos inválidos');
    }
    
    // Iniciar transacción
    $conn->begin_transaction();
    
    try {
        // Verificar que el jugador existe y está en el equipo
        $stmt = $conn->prepare("SELECT id FROM jugadores WHERE id = ? AND en_equipo = 1");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('Jugador no está en el equipo');
        }
        
        // Vender jugador
        $stmt = $conn->prepare("UPDATE jugadores SET en_equipo = 0 WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        // Actualizar presupuesto
        $stmt = $conn->prepare("UPDATE presupuesto SET monto = monto + ? WHERE id = 1");
        $stmt->bind_param("d", $valor);
        $stmt->execute();
        
        // Confirmar transacción
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Jugador vendido exitosamente'
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
