<?php
require 'conexion.php';

$fecha = $_POST['fecha'];
$rival = $_POST['rival'];
$estadio = $_POST['estadio'];
$resultado = $_POST['resultado'] ?? null;

$stmt = $conn->prepare("INSERT INTO partidos (fecha, rival, estadio, resultado) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $fecha, $rival, $estadio, $resultado);
$stmt->execute();

echo json_encode(['success' => true]);
?>
