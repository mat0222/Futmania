<?php
$conn = new mysqli("localhost", "root", "", "fulbito_db");
$result = $conn->query("SELECT id, nombre, posicion, valor_mercado, en_equipo FROM jugadores");

$jugadores = [];
while($row = $result->fetch_assoc()) {
  $jugadores[] = $row;
}
echo json_encode($jugadores);
?>
