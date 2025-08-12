<?php
require 'conexion.php';

$id = $_POST['id'];
$fecha = $_POST['fecha'];
$rival = $_POST['rival'];
$estadio = $_POST['estadio'];
$resultado = $_POST['resultado'] ?? null;

$stmt = $conn->prepare("UPDATE partidos SET fecha=?, rival=?, estadio=?, resultado=? WHERE id=?");
$stmt->bind_param("ssssi", $fecha, $rival, $estadio, $resultado, $id);
$stmt->execute();

echo json_encode(['success' => true]);
?>
