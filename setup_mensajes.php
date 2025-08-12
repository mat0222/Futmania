<?php
require_once 'conexion.php';

try {
    // Crear tabla de mensajes
    $sql = "CREATE TABLE IF NOT EXISTS mensajes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        jugador_id INT NOT NULL,
        mensaje TEXT NOT NULL,
        tipo ENUM('entrante', 'saliente') NOT NULL DEFAULT 'saliente',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        visto BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if ($conn->query($sql) === TRUE) {
        echo "Tabla mensajes creada exitosamente o ya existía.\n";
    } else {
        echo "Error creando tabla: " . $conn->error . "\n";
    }
    
    // Verificar si ya hay mensajes
    $check = $conn->query("SELECT COUNT(*) as count FROM mensajes");
    $count = $check->fetch_assoc()['count'];
    
    if ($count == 0) {
        // Insertar mensajes de ejemplo (solo para jugador ID 1 que existe)
        $mensajes_ejemplo = [
            [1, 'Hola DT, ¿cómo está?', 'entrante', '1 HOUR'],
            [1, 'Todo bien Mateo, ¿listo para el partido?', 'saliente', '55 MINUTE'],
            [1, '¡Por supuesto! He estado practicando mi defensa 🛡️', 'entrante', '30 MINUTE'],
            [1, 'DT, ¿a qué hora es el entrenamiento de mañana?', 'entrante', '2 HOUR'],
            [1, 'A las 9:00 AM en el campo principal', 'saliente', '1 HOUR 50 MINUTE'],
            [1, '¡Vamos equipo! 💪', 'entrante', '15 MINUTE']
        ];
        
        foreach ($mensajes_ejemplo as $mensaje) {
            $jugador_id = $mensaje[0];
            $texto = $conn->real_escape_string($mensaje[1]);
            $tipo = $mensaje[2];
            $intervalo = $mensaje[3];
            
            $sql = "INSERT INTO mensajes (jugador_id, mensaje, tipo, fecha_creacion, visto) 
                    VALUES ($jugador_id, '$texto', '$tipo', DATE_SUB(NOW(), INTERVAL $intervalo), " . 
                    ($tipo === 'saliente' ? '0' : '1') . ")";
            
            if ($conn->query($sql) === TRUE) {
                echo "Mensaje de ejemplo insertado.\n";
            } else {
                echo "Error insertando mensaje: " . $conn->error . "\n";
            }
        }
    } else {
        echo "Ya existen mensajes en la tabla.\n";
    }
    
    echo "Configuración de mensajes completada.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

$conn->close();
?>
