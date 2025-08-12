<?php
require 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

$jugador_id = $data['jugador_id'];
$x = $data['x'];
$y = $data['y'];
$zona = $data['zona']; // "cancha" o "suplentes"

$stmt = $conn->prepare("INSERT INTO formaciones (jugador_id, x, y, zona) 
    VALUES (?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE x=?, y=?, zona=?");
$stmt->bind_param("iiisiss", $jugador_id, $x, $y, $zona, $x, $y, $zona);
$stmt->execute();

echo json_encode(['success' => true]);
?>
