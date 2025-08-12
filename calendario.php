<?php
require 'conexion.php';

$resultado = $conn->query("SELECT * FROM partidos");
$eventos = [];

while ($row = $resultado->fetch_assoc()) {
  $color = '';
  $emoji = '📅'; // Por defecto

  if (!empty($row['resultado']) && preg_match('/^\s*\d+\s*-\s*\d+\s*$/', $row['resultado'])) {
    [$golesLocal, $golesRival] = explode('-', str_replace(' ', '', $row['resultado']));
    $golesLocal = (int)$golesLocal;
    $golesRival = (int)$golesRival;

    if ($golesLocal > $golesRival) {
      $color = '#2ecc71'; // verde
      $emoji = '✅';
    } elseif ($golesLocal < $golesRival) {
      $color = '#e74c3c'; // rojo
      $emoji = '❌';
    } else {
      $emoji = '🤝'; // empate
    }
  }

  $eventos[] = [
    'id' => $row['id'],
    'title' => "$emoji {$row['rival']}" . ($row['resultado'] ? " ({$row['resultado']})" : ''),
    'start' => $row['fecha'],
    'rival' => $row['rival'],
    'estadio' => $row['estadio'],
    'resultado' => $row['resultado'],
    'color' => $color
  ];
}

echo json_encode($eventos);
?>

