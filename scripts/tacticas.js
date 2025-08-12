async function mostrarTacticas(contenido) {
  contenido.innerHTML = `
    <div class="tacticas-container">
      <div class="tacticas-header">
        <h2>🧠 Tácticas del Equipo</h2>
        <p>Arrastra y organiza a tus jugadores en la cancha</p>
      </div>
      
      <div class="controles-formacion">
        <button class="btn-formacion" onclick="aplicarFormacion('4-4-2')">4-4-2</button>
        <button class="btn-formacion" onclick="aplicarFormacion('4-3-3')">4-3-3</button>
        <button class="btn-formacion" onclick="aplicarFormacion('3-5-2')">3-5-2</button>
        <button class="btn-formacion" onclick="aplicarFormacion('4-2-3-1')">4-2-3-1</button>
        <button class="btn-formacion" onclick="guardarFormacion()">💾 Guardar</button>
        <button class="btn-formacion" onclick="resetearFormacion()">🔄 Reset</button>
      </div>
      
      <div class="cancha-draggable">
        <div id="zona-cancha" class="zona-drop cancha-drop" data-zona="cancha">
          <div class="area-penal-local"></div>
          <div class="area-penal-visitante"></div>
          <div class="contador-jugadores" id="contador-cancha">
            <span id="jugadores-cancha">0</span>/11 jugadores
          </div>
        </div>
        
        <div class="zona-suplementaria">
          <h3>🪑 Banco de Suplentes</h3>
          <div id="zona-suplentes" class="zona-drop suplentes-drop" data-zona="suplentes"></div>
        </div>
      </div>
    </div>
  `;

  const cancha = document.getElementById('zona-cancha');
  const suplentes = document.getElementById('zona-suplentes');
  const contadorCancha = document.getElementById('jugadores-cancha');
  const contadorElement = document.getElementById('contador-cancha');
  
  let jugadores = [];
  let draggedElement = null;

  // Cargar jugadores
  try {
    const resFormacion = await fetch('obtener_formacion.php');
    const dataFormacion = await resFormacion.json();
    // Handle both old and new response formats
    jugadores = dataFormacion.success ? dataFormacion.formacion : dataFormacion;
    
    if (!jugadores.length) {
      const res = await fetch('obtener_jugadores.php');
      const data = await res.json();
      // Handle both old and new response formats
      const jugadoresBase = data.success ? data.jugadores : data;
      jugadores = jugadoresBase.map((j, i) => ({
        jugador_id: j.id,
        x: 50 + (i * 60) % 500,
        y: i < 11 ? 80 + (i * 35) : 50,
        zona: i < 11 ? 'cancha' : 'suplentes',
        numero: j.numero,
        nombre: j.nombre,
        posicion: j.posicion
      }));
    }
  } catch (error) {
    console.error('Error cargando jugadores:', error);
    mostrarNotificacion('Error al cargar jugadores', 'error');
    return;
  }

  // Crear jugadores en el DOM
  jugadores.forEach(j => crearJugador(j));
  actualizarContador();

  function crearJugador(j) {
    const div = document.createElement('div');
    div.className = 'jugador-draggable';
    div.draggable = true;
    div.dataset.id = j.jugador_id;
    div.style.position = 'absolute';
    div.style.left = j.x + 'px';
    div.style.top = j.y + 'px';
    
    // Determinar clase de posición
    const posicionClass = determinarClasePosicion(j.posicion);
    
    div.innerHTML = `
      <div class="ficha ${posicionClass}">
        <div class="numero">#${j.numero}</div>
        <div class="nombre">${j.nombre}</div>
        <div class="pos">${j.posicion.toUpperCase()}</div>
        <div class="jugador-tooltip">
          ${j.nombre} - ${j.posicion}
        </div>
      </div>
    `;

    // Event listeners para drag & drop
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);
    
    // Agregar a la zona correspondiente
    if (j.zona === 'cancha') {
      cancha.appendChild(div);
    } else {
      suplentes.appendChild(div);
    }
  }

  function determinarClasePosicion(posicion) {
    const pos = posicion.toLowerCase();
    if (pos.includes('portero') || pos.includes('arquero')) return 'portero';
    if (pos.includes('defensa') || pos.includes('lateral')) return 'defensa';
    if (pos.includes('medio') || pos.includes('volante')) return 'mediocampo';
    if (pos.includes('delantero') || pos.includes('atacante')) return 'delantero';
    return '';
  }

  function handleDragStart(e) {
    draggedElement = this;
    this.style.opacity = '0.5';
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: this.dataset.id,
      html: this.outerHTML
    }));
    
    // Agregar clase visual
    document.querySelectorAll('.zona-drop').forEach(zona => {
      zona.classList.add('drag-active');
    });
  }

  function handleDragEnd(e) {
    this.style.opacity = '1';
    draggedElement = null;
    
    // Remover clases visuales
    document.querySelectorAll('.zona-drop').forEach(zona => {
      zona.classList.remove('drag-active', 'drag-over');
    });
  }

  // Configurar zonas de drop
  document.querySelectorAll('.zona-drop').forEach(area => {
    area.addEventListener('dragover', handleDragOver);
    area.addEventListener('dragenter', handleDragEnter);
    area.addEventListener('dragleave', handleDragLeave);
    area.addEventListener('drop', handleDrop);
  });

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    if (!this.contains(e.relatedTarget)) {
      this.classList.remove('drag-over');
    }
  }

  async function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const rect = this.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - 50, rect.width - 100));
    const y = Math.max(0, Math.min(e.clientY - rect.top - 50, rect.height - 100));
    
    // Verificar límite de jugadores en cancha
    if (this.dataset.zona === 'cancha') {
      const jugadoresEnCancha = cancha.querySelectorAll('.jugador-draggable').length;
      if (jugadoresEnCancha >= 11 && !cancha.contains(draggedElement)) {
        mostrarNotificacion('Máximo 11 jugadores en cancha', 'error');
        return;
      }
    }
    
    // Crear nuevo elemento
    const temp = document.createElement('div');
    temp.innerHTML = data.html;
    const jugador = temp.firstChild;
    
    jugador.style.left = x + 'px';
    jugador.style.top = y + 'px';
    jugador.classList.add('jugador-dropped');
    
    // Reconfigurar eventos
    jugador.addEventListener('dragstart', handleDragStart);
    jugador.addEventListener('dragend', handleDragEnd);
    
    this.appendChild(jugador);
    
    // Remover elemento original si existe
    if (draggedElement && draggedElement.parentNode) {
      draggedElement.remove();
    }
    
    // Actualizar contador
    actualizarContador();
    
    // Guardar posición
    try {
      await fetch('guardar_formacion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jugador_id: data.id,
          x: x,
          y: y,
          zona: this.dataset.zona
        })
      });
      
      mostrarNotificacion('Posición guardada', 'success');
    } catch (error) {
      console.error('Error guardando posición:', error);
      mostrarNotificacion('Error al guardar posición', 'error');
    }
  }

  function actualizarContador() {
    const jugadoresEnCancha = cancha.querySelectorAll('.jugador-draggable').length;
    contadorCancha.textContent = jugadoresEnCancha;
    
    if (jugadoresEnCancha === 11) {
      contadorElement.className = 'contador-jugadores completo';
    } else {
      contadorElement.className = 'contador-jugadores incompleto';
    }
  }

  function mostrarNotificacion(mensaje, tipo = 'success') {
    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo}`;
    notif.textContent = mensaje;
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${tipo === 'success' ? '#22c55e' : '#ef4444'};
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
      notif.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // Funciones globales para los botones
  window.aplicarFormacion = function(formacion) {
    // Activar botón
    document.querySelectorAll('.btn-formacion').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Aplicar formación predefinida
    const formaciones = {
      '4-4-2': [
        {x: 350, y: 50}, // Portero
        {x: 150, y: 150}, {x: 250, y: 150}, {x: 450, y: 150}, {x: 550, y: 150}, // Defensas
        {x: 150, y: 250}, {x: 250, y: 250}, {x: 450, y: 250}, {x: 550, y: 250}, // Medios
        {x: 300, y: 350}, {x: 400, y: 350} // Delanteros
      ],
      '4-3-3': [
        {x: 350, y: 50}, // Portero
        {x: 150, y: 150}, {x: 250, y: 150}, {x: 450, y: 150}, {x: 550, y: 150}, // Defensas
        {x: 200, y: 250}, {x: 350, y: 250}, {x: 500, y: 250}, // Medios
        {x: 200, y: 350}, {x: 350, y: 350}, {x: 500, y: 350} // Delanteros
      ],
      '3-5-2': [
        {x: 350, y: 50}, // Portero
        {x: 200, y: 150}, {x: 350, y: 150}, {x: 500, y: 150}, // Defensas
        {x: 150, y: 250}, {x: 250, y: 250}, {x: 350, y: 250}, {x: 450, y: 250}, {x: 550, y: 250}, // Medios
        {x: 300, y: 350}, {x: 400, y: 350} // Delanteros
      ],
      '4-2-3-1': [
        {x: 350, y: 50}, // Portero
        {x: 150, y: 150}, {x: 250, y: 150}, {x: 450, y: 150}, {x: 550, y: 150}, // Defensas
        {x: 250, y: 220}, {x: 450, y: 220}, // Medios defensivos
        {x: 200, y: 300}, {x: 350, y: 300}, {x: 500, y: 300}, // Medios ofensivos
        {x: 350, y: 380} // Delantero
      ]
    };
    
    const posiciones = formaciones[formacion];
    if (!posiciones) return;
    
    const jugadoresCancha = Array.from(cancha.querySelectorAll('.jugador-draggable'));
    
    posiciones.forEach((pos, index) => {
      if (jugadoresCancha[index]) {
        jugadoresCancha[index].style.left = pos.x + 'px';
        jugadoresCancha[index].style.top = pos.y + 'px';
        jugadoresCancha[index].classList.add('jugador-dropped');
      }
    });
    
    mostrarNotificacion(`Formación ${formacion} aplicada`, 'success');
  };

  window.guardarFormacion = async function() {
    try {
      const jugadoresCancha = Array.from(cancha.querySelectorAll('.jugador-draggable'));
      const jugadoresSuplentes = Array.from(suplentes.querySelectorAll('.jugador-draggable'));
      
      const formacionData = [];
      
      jugadoresCancha.forEach(jugador => {
        formacionData.push({
          jugador_id: jugador.dataset.id,
          x: parseInt(jugador.style.left),
          y: parseInt(jugador.style.top),
          zona: 'cancha'
        });
      });
      
      jugadoresSuplentes.forEach(jugador => {
        formacionData.push({
          jugador_id: jugador.dataset.id,
          x: parseInt(jugador.style.left),
          y: parseInt(jugador.style.top),
          zona: 'suplentes'
        });
      });
      
      await fetch('guardar_formacion_completa.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formacionData)
      });
      
      mostrarNotificacion('Formación guardada correctamente', 'success');
    } catch (error) {
      console.error('Error guardando formación:', error);
      mostrarNotificacion('Error al guardar formación', 'error');
    }
  };

  window.resetearFormacion = function() {
    // Mover todos los jugadores a suplentes
    const todosJugadores = document.querySelectorAll('.jugador-draggable');
    todosJugadores.forEach((jugador, index) => {
      jugador.style.left = (50 + (index % 8) * 90) + 'px';
      jugador.style.top = (20 + Math.floor(index / 8) * 80) + 'px';
      suplentes.appendChild(jugador);
    });
    
    actualizarContador();
    mostrarNotificacion('Formación reseteada', 'success');
  };

  // Agregar estilos para animaciones
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// Exportar función
window.mostrarTacticas = mostrarTacticas;
