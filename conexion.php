<?php
$host = 'localhost';
$db   = 'fulbito_db';
$user = 'root';  // o el usuario que uses
$pass = '';      // contraseña si tenés

// Crear conexión
$conn = new mysqli($host, $user, $pass, $db);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Establecer charset utf8mb4
$conn->set_charset("utf8mb4");
?>
