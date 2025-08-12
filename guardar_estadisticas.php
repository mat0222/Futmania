<?php
require 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['jugador_id'];
$goles = $data['goles'];
$asistencias = $data['asistencias'];
$partidos = $data['partidos'];
$lesiones = $data['lesiones'];

$check = $conn->prepare("SELECT id FROM estadisticas WHERE jugador_id = ?");
$check->bind_param("i", $id);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
  // actualizar
  $stmt = $conn->prepare("UPDATE estadisticas SET goles=?, asistencias=?, partidos=?, lesiones=? WHERE jugador_id=?");
  $stmt->bind_param("iiiii", $goles, $asistencias, $partidos, $lesiones, $id);
} else {
  // insertar
  $stmt = $conn->prepare("INSERT INTO estadisticas (jugador_id, goles, asistencias, partidos, lesiones) VALUES (?, ?, ?, ?, ?)");
  $stmt->bind_param("iiiii", $id, $goles, $asistencias, $partidos, $lesiones);
}

$success = $stmt->execute();
echo json_encode(["success" => $success]);

$conn->close();
