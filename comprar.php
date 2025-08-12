<?php
$conn = new mysqli("localhost", "root", "", "fulbito_db");
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];
$valor = $data['valor'];

$pres = $conn->query("SELECT monto FROM presupuesto WHERE id = 1")->fetch_assoc();
if ($pres['monto'] < $valor) {
  echo "Fondos insuficientes";
  exit;
}

$conn->query("UPDATE jugadores SET en_equipo = 1 WHERE id = $id");
$conn->query("UPDATE presupuesto SET monto = monto - $valor WHERE id = 1");
echo "ok";
?>
