function mostrarListaJugadores() {
  const contenido = document.getElementById("contenido");
  contenido.innerHTML = `
    <section id="jugadores">
      <div class="jugadores-header">
        <h1>⚽ Plantel de Jugadores</h1>
        <p>Conoce a todos los miembros de nuestro equipo</p>
      </div>
      
      <div class="jugadores-controles">
        <div class="filtros-container">
          <h3>🔍 Filtrar por posición</h3>
          <div class="filtros-grid">
            <button class="filtro-btn active" data-posicion="todos">👥 Todos</button>
            <button class="filtro-btn" data-posicion="arquero">🥅 Arqueros</button>
            <button class="filtro-btn" data-posicion="defensa">🛡️ Defensas</button>
            <button class="filtro-btn" data-posicion="mediocampista">⚡ Mediocampistas</button>
            <button class="filtro-btn" data-posicion="delantero">🎯 Delanteros</button>
          </div>
        </div>
        
        <div class="busqueda-container">
          <h3>🔎 Buscar jugador</h3>
          <input type="text" id="buscar-jugador" placeholder="Buscar por nombre..." />
        </div>
        
        <div class="vista-container">
          <h3>👁️ Vista</h3>
          <div class="vista-botones">
            <button class="vista-btn" data-vista="tabla">📊 Tabla</button>
          </div>
        </div>
      </div>
      
      <div class="jugadores-stats">
        <div class="stat-item">
          <span class="stat-numero" id="total-jugadores">0</span>
          <span class="stat-label">Total Jugadores</span>
        </div>
        <div class="stat-item">
          <span class="stat-numero" id="promedio-edad">0</span>
          <span class="stat-label">Edad Promedio</span>
        </div>
        <div class="stat-item">
          <span class="stat-numero" id="total-goles">0</span>
          <span class="stat-label">Goles Totales</span>
        </div>
      </div>
      
      <div id="lista-jugadores" class="jugadores-lista"></div>
      
      <div class="loading-container" id="loading" style="display: none;">
        <div class="loading-spinner"></div>
        <p>Cargando jugadores...</p>
      </div>
    </section>
  `;
  
  cargarJugadores();
  configurarEventosJugadores();
}

let jugadoresData = [];
let jugadoresFiltrados = [];
let vistaActual = 'cards';

async function cargarJugadores() {
  const loading = document.getElementById('loading');
  const contenedor = document.getElementById("lista-jugadores");
  
  loading.style.display = 'flex';
  contenedor.innerHTML = '';
  
  try {
    // Intentar cargar desde PHP
    try {
      const res = await fetch('obtener_jugadores.php');
      if (res.ok) {
        const data = await res.json();
        console.log('Datos recibidos de PHP:', data); // Debug
        
        // Handle both old and new response formats
        if (data.success && data.jugadores) {
          jugadoresData = data.jugadores;
          console.log('Jugadores cargados desde PHP:', jugadoresData.length);
        } else if (Array.isArray(data)) {
          jugadoresData = data;
          console.log('Jugadores cargados desde PHP (formato array):', jugadoresData.length);
        } else {
          throw new Error('Formato de datos inválido');
        }
      } else {
        throw new Error('Error en la respuesta del servidor: ' + res.status);
      }
    } catch (error) {
      console.warn('No se pudo cargar desde PHP, usando datos de ejemplo:', error);
      // Datos de ejemplo si no hay conexión con PHP
      jugadoresData = [
        {
          id: 1,
          nombre: "Lionel Messi",
          posicion: "delantero",
          numero: 10,
          edad: 36,
          goles: 25,
          asistencias: 15,
          partidos: 30,
          lesiones: 1,
          nacionalidad: "Argentina"
        },
        {
          id: 2,
          nombre: "Cristiano Ronaldo",
          posicion: "delantero",
          numero: 7,
          edad: 39,
          goles: 22,
          asistencias: 8,
          partidos: 28,
          lesiones: 0,
          nacionalidad: "Portugal"
        },
        {
          id: 3,
          nombre: "Erling Haaland",
          posicion: "delantero",
          numero: 9,
          edad: 23,
          goles: 30,
          asistencias: 5,
          partidos: 25,
          lesiones: 2,
          nacionalidad: "Noruega"
        },
        {
          id: 4,
          nombre: "Kevin De Bruyne",
          posicion: "mediocampista",
          numero: 8,
          edad: 32,
          goles: 8,
          asistencias: 20,
          partidos: 32,
          lesiones: 1,
          nacionalidad: "Bélgica"
        },
        {
          id: 5,
          nombre: "Virgil van Dijk",
          posicion: "defensa",
          numero: 4,
          edad: 32,
          goles: 3,
          asistencias: 2,
          partidos: 35,
          lesiones: 0,
          nacionalidad: "Países Bajos"
        },
        {
          id: 6,
          nombre: "Alisson Becker",
          posicion: "arquero",
          numero: 1,
          edad: 30,
          goles: 0,
          asistencias: 1,
          partidos: 34,
          lesiones: 1,
          nacionalidad: "Brasil"
        },
        {
          id: 7,
          nombre: "Pedri González",
          posicion: "mediocampista",
          numero: 16,
          edad: 21,
          goles: 5,
          asistencias: 12,
          partidos: 28,
          lesiones: 2,
          nacionalidad: "España"
        },
        {
          id: 8,
          nombre: "Kylian Mbappé",
          posicion: "delantero",
          numero: 11,
          edad: 25,
          goles: 28,
          asistencias: 10,
          partidos: 30,
          lesiones: 0,
          nacionalidad: "Francia"
        }
      ];
    }
    
    console.log('Total de jugadores cargados:', jugadoresData.length);
    jugadoresFiltrados = [...jugadoresData];
    actualizarEstadisticas();
    mostrarJugadores();
    
  } catch (error) {
    console.error("Error al cargar jugadores:", error);
    contenedor.innerHTML = `
      <div class="error-container">
        <h3>❌ Error al cargar jugadores</h3>
        <p>No se pudieron cargar los datos. Por favor, intenta de nuevo.</p>
        <button onclick="cargarJugadores()" class="retry-btn">🔄 Reintentar</button>
      </div>
    `;
  } finally {
    loading.style.display = 'none';
  }
}

function configurarEventosJugadores() {
  // Filtros por posición
  const filtros = document.querySelectorAll('.filtro-btn');
  if (filtros.length > 0) {
    filtros.forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const posicion = btn.dataset.posicion;
        if (posicion === 'todos') {
          jugadoresFiltrados = [...jugadoresData];
        } else {
          jugadoresFiltrados = jugadoresData.filter(j => j.posicion === posicion);
        }
        
        aplicarBusqueda();
        mostrarJugadores();
        actualizarEstadisticas();
      });
    });
  }
  
  // Búsqueda
  const inputBusqueda = document.getElementById('buscar-jugador');
  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', () => {
      aplicarBusqueda();
      mostrarJugadores();
    });
  }
  
  // Vista
  const vistaBotones = document.querySelectorAll('.vista-btn');
  if (vistaBotones.length > 0) {
    vistaBotones.forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.vista-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        vistaActual = btn.dataset.vista;
        mostrarJugadores();
      });
    });
  }
}

function aplicarBusqueda() {
  const termino = document.getElementById('buscar-jugador').value.toLowerCase();
  if (termino) {
    const posicionActiva = document.querySelector('.filtro-btn.active').dataset.posicion;
    let base = posicionActiva === 'todos' ? jugadoresData : jugadoresData.filter(j => j.posicion === posicionActiva);
    jugadoresFiltrados = base.filter(j => j.nombre.toLowerCase().includes(termino));
  }
}

function mostrarJugadores() {
  const contenedor = document.getElementById("lista-jugadores");
  
  if (jugadoresFiltrados.length === 0) {
    contenedor.innerHTML = `
      <div class="no-results">
        <h3>🔍 No se encontraron jugadores</h3>
        <p>Intenta con otros filtros o términos de búsqueda</p>
      </div>
    `;
    return;
  }
  
  if (vistaActual === 'cards') {
    mostrarVistaCards(contenedor);
  } else {
    mostrarVistaTabla(contenedor);
  }
}

function mostrarVistaCards(contenedor) {
  contenedor.className = 'jugadores-lista cards-view';
  contenedor.innerHTML = '';
  
  jugadoresFiltrados.forEach((jugador, index) => {
    const card = document.createElement("div");
    card.className = "jugador-card";
    card.style.animationDelay = `${index * 0.1}s`;
    
    const posicionIcon = getPosicionIcon(jugador.posicion);
    const posicionColor = getPosicionColor(jugador.posicion);
    
    card.innerHTML = `
      <div class="card-header" style="background: ${posicionColor}">
        <div class="jugador-numero">${jugador.numero || '-'}</div>
        <div class="posicion-badge">
          <span class="posicion-icon">${posicionIcon}</span>
          <span class="posicion-text">${jugador.posicion}</span>
        </div>
      </div>
      
      <div class="card-body">
        <h3 class="jugador-nombre">${jugador.nombre}</h3>
        <div class="jugador-info">
          <div class="info-item">
            <span class="info-icon">🎂</span>
            <span>${jugador.edad || 'N/A'} años</span>
          </div>
          <div class="info-item">
            <span class="info-icon">🌍</span>
            <span>${jugador.nacionalidad || 'N/A'}</span>
          </div>
        </div>
        
        <div class="jugador-stats">
          <div class="stat-mini">
            <span class="stat-valor">${jugador.goles || 0}</span>
            <span class="stat-etiqueta">Goles</span>
          </div>
          <div class="stat-mini">
            <span class="stat-valor">${jugador.asistencias || 0}</span>
            <span class="stat-etiqueta">Asist.</span>
          </div>
          <div class="stat-mini">
            <span class="stat-valor">${jugador.partidos || 0}</span>
            <span class="stat-etiqueta">Partidos</span>
          </div>
        </div>
      </div>
      
      <div class="card-footer">
        <div class="efectividad">
          <span class="efectividad-label">Efectividad:</span>
          <div class="efectividad-bar">
            <div class="efectividad-fill" style="width: ${calcularEfectividad(jugador)}%"></div>
          </div>
          <span class="efectividad-valor">${calcularEfectividad(jugador)}%</span>
        </div>
      </div>
    `;
    
    contenedor.appendChild(card);
  });
}

function mostrarVistaTabla(contenedor) {
  contenedor.className = 'jugadores-lista tabla-view';
  
  contenedor.innerHTML = `
    <div class="tabla-container">
      <table class="tabla-jugadores">
        <thead>
          <tr>
            <th>#</th>
            <th>Jugador</th>
            <th>Posición</th>
            <th>Edad</th>
            <th>Nacionalidad</th>
            <th>Goles</th>
            <th>Asistencias</th>
            <th>Partidos</th>
            <th>Efectividad</th>
          </tr>
        </thead>
        <tbody>
          ${jugadoresFiltrados.map(jugador => `
            <tr class="tabla-fila">
              <td class="numero-celda">${jugador.numero || '-'}</td>
              <td class="nombre-celda">
                <div class="jugador-tabla-info">
                  <span class="jugador-tabla-nombre">${jugador.nombre}</span>
                </div>
              </td>
              <td>
                <div class="posicion-tabla">
                  <span class="posicion-icon">${getPosicionIcon(jugador.posicion)}</span>
                  <span>${jugador.posicion}</span>
                </div>
              </td>
              <td>${jugador.edad || 'N/A'}</td>
              <td>${jugador.nacionalidad || 'N/A'}</td>
              <td class="stat-celda goles">${jugador.goles || 0}</td>
              <td class="stat-celda asistencias">${jugador.asistencias || 0}</td>
              <td class="stat-celda partidos">${jugador.partidos || 0}</td>
              <td class="efectividad-celda">
                <div class="efectividad-mini">
                  <div class="efectividad-bar-mini">
                    <div class="efectividad-fill-mini" style="width: ${calcularEfectividad(jugador)}%"></div>
                  </div>
                  <span>${calcularEfectividad(jugador)}%</span>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function getPosicionIcon(posicion) {
  const iconos = {
    'arquero': '🥅',
    'defensa': '🛡️',
    'mediocampista': '⚡',
    'delantero': '🎯'
  };
  return iconos[posicion] || '⚽';
}

function getPosicionColor(posicion) {
  const colores = {
    'arquero': 'linear-gradient(135deg, #f59e0b, #d97706)',
    'defensa': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'mediocampista': 'linear-gradient(135deg, #10b981, #059669)',
    'delantero': 'linear-gradient(135deg, #ef4444, #dc2626)'
  };
  return colores[posicion] || 'linear-gradient(135deg, #6b7280, #4b5563)';
}

function calcularEfectividad(jugador) {
  if (!jugador.partidos || jugador.partidos === 0) return 0;
  const goles = jugador.goles || 0;
  const asistencias = jugador.asistencias || 0;
  const efectividad = ((goles + asistencias) / jugador.partidos) * 100;
  return Math.min(Math.round(efectividad), 100);
}

function actualizarEstadisticas() {
  const totalJugadores = jugadoresFiltrados.length;
  const edadPromedio = jugadoresFiltrados.length > 0 
    ? Math.round(jugadoresFiltrados.reduce((sum, j) => sum + (j.edad || 0), 0) / jugadoresFiltrados.length)
    : 0;
  const totalGoles = jugadoresFiltrados.reduce((sum, j) => sum + (j.goles || 0), 0);
  
  animarContador('total-jugadores', totalJugadores);
  animarContador('promedio-edad', edadPromedio);
  animarContador('total-goles', totalGoles);
}

function animarContador(elementId, valorFinal) {
  const elemento = document.getElementById(elementId);
  if (!elemento) return;
  
  const duracion = 1000;
  const incremento = valorFinal / (duracion / 16);
  let valorActual = 0;
  
  const timer = setInterval(() => {
    valorActual += incremento;
    if (valorActual >= valorFinal) {
      elemento.textContent = valorFinal;
      clearInterval(timer);
    } else {
      elemento.textContent = Math.floor(valorActual);
    }
  }, 16);
}

window.mostrarListaJugadores = mostrarListaJugadores;


