function renderTransferencias() {
  const contenido = document.getElementById("contenido");
  contenido.innerHTML = `
    <section id="transferencias">
      <h1>Centro de Transferencias</h1>
      <div class="presupuesto-container">
        <strong>💰 Presupuesto disponible: </strong>
        <span id="presupuesto">$0</span>
      </div>
      <div class="transfer-container">
        <section class="mercado">
          <h2>Jugadores Disponibles</h2>
          <div id="jugadores-disponibles" class="jugadores-lista"></div>
        </section>
        <section class="plantel">
          <h2>Tu Plantel</h2>
          <div id="jugadores-equipo" class="jugadores-lista"></div>
        </section>
      </div>
    </section>
  `;
  
  // ✅ Esperar al próximo ciclo del event loop
  setTimeout(() => {
    mostrarJugadoresTransferencias();
    cargarPresupuesto();
  }, 0);
}

function mostrarJugadoresTransferencias() {
  console.log('Iniciando mostrarJugadoresTransferencias...');
  
  fetch('transferencias.php')
    .then(res => {
      console.log('Respuesta HTTP:', res.status, res.ok);
      return res.json();
    })
    .then(data => {
      console.log('Datos recibidos:', data);
      console.log('Tipo de data:', typeof data);
      console.log('Es array:', Array.isArray(data));
      
      const disponibles = document.getElementById('jugadores-disponibles');
      const equipo = document.getElementById('jugadores-equipo');
      
      if (!disponibles || !equipo) {
        console.warn("Contenedores no encontrados.");
        return;
      }
      
      // Handle both old and new response formats
      let jugadores = [];
      if (data.success && data.jugadores) {
        console.log('Usando formato success.jugadores');
        jugadores = data.jugadores;
      } else if (Array.isArray(data)) {
        console.log('Usando formato array directo');
        jugadores = data;
      } else {
        console.error('Formato de datos inválido:', data);
        return;
      }
      
      console.log('Jugadores procesados:', jugadores);
      console.log('Cantidad de jugadores:', jugadores.length);
      
      disponibles.innerHTML = '';
      equipo.innerHTML = '';
      
      jugadores.forEach(jugador => {
        const card = document.createElement('div');
        card.className = 'jugador-item';
        card.innerHTML = `
          <div class="jugador-info">
            <h3>${jugador.nombre}</h3>
            <p>⚽ Posición: ${jugador.posicion}</p>
            <p>💵 Valor: $${jugador.valor_mercado?.toLocaleString() ?? 0}</p>
          </div>
          <button class="${jugador.en_equipo ? 'vender' : 'comprar'}">
            ${jugador.en_equipo ? '📤 Vender' : '📥 Fichar'}
          </button>
        `;
        
        card.querySelector('button').addEventListener('click', () => {
          const archivo = jugador.en_equipo ? 'vender.php' : 'comprar.php';
          
          // Agregar efecto de carga
          card.classList.add('loading');
          
          fetch(archivo, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: jugador.id, valor: jugador.valor_mercado })
          })
          .then(res => res.json())
          .then(result => {
            card.classList.remove('loading');
            if (result.success) {
              // Mostrar mensaje de éxito
              const mensaje = document.createElement('div');
              mensaje.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 15px; border-radius: 8px; z-index: 1000;';
              mensaje.textContent = '✅ ' + result.message;
              document.body.appendChild(mensaje);
              
              setTimeout(() => {
                mensaje.remove();
              }, 3000);
              
              mostrarJugadoresTransferencias();
              cargarPresupuesto();
            } else {
              alert('Error: ' + result.message);
            }
          })
          .catch(error => {
            card.classList.remove('loading');
            console.error('Error:', error);
            alert('Error en la operación');
          });
        });
        
        if (jugador.en_equipo) {
          equipo.appendChild(card);
        } else {
          disponibles.appendChild(card);
        }
      });
    })
    .catch(error => console.error('Error al cargar jugadores:', error));
}

function cargarPresupuesto() {
  fetch('presupuesto.php')
    .then(res => res.json())
    .then(data => {
      // Handle both old and new response formats
      let monto = 0;
      if (data.success && data.monto) {
        monto = data.monto;
      } else if (data.monto) {
        monto = data.monto;
      } else {
        console.error('Formato de presupuesto inválido:', data);
        return;
      }
      document.getElementById('presupuesto').textContent = `$${parseFloat(monto).toLocaleString()}`;
    })
    .catch(error => console.error('Error al cargar presupuesto:', error));
}

// Exportar función
window.renderTransferencias = renderTransferencias;
