<?php
require 'conexion.php';

header('Content-Type: application/json'); // Importante para evitar errores JS

$usuario = $_POST['usuario'] ?? '';
$clave = $_POST['clave'] ?? '';

if (!$usuario || !$clave) {
  echo json_encode(['success' => false, 'message' => 'Completa todos los campos']);
  exit;
}

$claveHash = password_hash($clave, PASSWORD_DEFAULT);

// Verificar si el usuario ya existe
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE usuario = ?");
$stmt->bind_param("s", $usuario);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
  echo json_encode(['success' => false, 'message' => 'El usuario ya existe']);
  exit;
}

// Insertar nuevo usuario
$stmt = $conn->prepare("INSERT INTO usuarios (usuario, clave) VALUES (?, ?)");
$stmt->bind_param("ss", $usuario, $claveHash);
$stmt->execute();

echo json_encode(['success' => true, 'message' => 'Registro exitoso']);
?>
