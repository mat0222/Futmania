<?php
require 'conexion.php';
session_start();

$usuario = $_POST['usuario'] ?? '';
$clave = $_POST['clave'] ?? '';

if (!$usuario || !$clave) {
  echo json_encode(['success' => false, 'message' => 'Completa todos los campos']);
  exit;
}

// Buscar usuario
$stmt = $conn->prepare("SELECT id, clave FROM usuarios WHERE usuario = ?");
$stmt->bind_param("s", $usuario);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
  echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
  exit;
}

$stmt->bind_result($id, $claveHash);
$stmt->fetch();

if (password_verify($clave, $claveHash)) {
  $_SESSION['usuario_id'] = $id;
  $_SESSION['usuario'] = $usuario;
  echo json_encode(['success' => true, 'message' => 'Bienvenido, ' . $usuario]);
} else {
  echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta']);
}
?>
