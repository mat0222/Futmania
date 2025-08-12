<?php
header('Content-Type: application/json');
require 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recibir datos POST JSON o form-data
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        $data = $_POST;
    }

    $numero = intval($data['numero'] ?? 0);
    $nombre = trim($data['nombre'] ?? '');
    $posicion = $data['posicion'] ?? '';
    $edad = intval($data['edad'] ?? 0);
    $nacionalidad = trim($data['nacionalidad'] ?? '');

    // Validar datos básicos
    $posicionesValidas = ['arquero', 'defensa', 'mediocampista', 'delantero'];

    if ($numero <= 0 || $nombre === '' || !in_array($posicion, $posicionesValidas)) {
        echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO jugadores (numero, nombre, posicion, edad, nacionalidad) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param('issis', $numero, $nombre, $posicion, $edad, $nacionalidad);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Jugador agregado correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al agregar jugador']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
?>
