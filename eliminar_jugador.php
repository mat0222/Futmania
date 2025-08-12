<?php
require 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = intval($_POST['id'] ?? 0);
    if ($id > 0) {
        $conn->query("DELETE FROM jugadores WHERE id = $id");
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
}
$conn->close();
