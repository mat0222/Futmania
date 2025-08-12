<?php
$conn = new mysqli("localhost", "root", "", "fulbito_db");
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];
$valor = $data['valor'];

$conn->query("UPDATE jugadores SET en_equipo = 0 WHERE id = $id");
$conn->query("UPDATE presupuesto SET monto = monto + $valor WHERE id = 1");
echo "ok";
?>
