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
  fetch('transferencias.php')
    .then(res => res.json())
    .then(data => {
      const disponibles = document.getElementById('jugadores-disponibles');
      const equipo = document.getElementById('jugadores-equipo');
      
      if (!disponibles || !equipo) {
        console.warn("Contenedores no encontrados.");
        return;
      }
      
      disponibles.innerHTML = '';
      equipo.innerHTML = '';
      
      data.forEach(jugador => {
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
          .then(res => res.text())
          .then(result => {
            card.classList.remove('loading');
            if (result === 'ok') {
              mostrarJugadoresTransferencias();
              cargarPresupuesto();
            } else {
              alert(result);
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
      document.getElementById('presupuesto').textContent = `$${data.monto.toLocaleString()}`;
    })
    .catch(error => console.error('Error al cargar presupuesto:', error));
}
