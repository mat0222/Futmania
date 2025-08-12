<?php
$conn = new mysqli("localhost", "root", "", "fulbito_db");
if ($conn->connect_error) die("Error de conexión");

$sql = "SELECT monto FROM presupuesto WHERE id = 1";
$result = $conn->query($sql);
$row = $result->fetch_assoc();

echo json_encode(["monto" => $row['monto']]);
?>
