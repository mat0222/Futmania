<?php
require 'conexion.php';

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

if ($id && $nombre && $posicion && $numero !== null) {
  // Actualizar datos del jugador
  $sql = "UPDATE jugadores SET numero=?, nombre=?, posicion=?, edad=?, nacionalidad=? WHERE id=?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("issisi", $numero, $nombre, $posicion, $edad, $nacionalidad, $id);
  $stmt->execute();

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
  $stmt2->bind_param("iiiii", $id, $goles, $asistencias, $partidos, $lesiones);
  $stmt2->execute();

  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => "Faltan datos"]);
}
?>

