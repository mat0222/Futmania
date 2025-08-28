let graficoStats;
let graficoComparacion;
let graficoEquipo;
let graficoRendimiento;
let estadisticasJugadoresData = [];
let estadisticasVistaActual = 'individual';

async function mostrarEstadisticas(contenido) {
  contenido.innerHTML = `
    <div class="estadisticas-container">
      <div class="estadisticas-header">
        <h2>📊 Estadísticas del Equipo</h2>
        <p>Analiza el rendimiento de tus jugadores y equipo</p>
      </div>
      
      <div class="controles-estadisticas">
        <div class="selector-contenedor">
          <label for="selector-jugador">👤 Selecciona un jugador:</label>
          <select id="selector-jugador">
            <option value="">Cargando jugadores...</option>
          </select>
        </div>
        
        <div class="vista-botones">
          <button class="btn-vista active" data-vista="individual">Individual</button>
          <button class="btn-vista" data-vista="comparacion">Comparar</button>
          <button class="btn-vista" data-vista="equipo">Equipo</button>
          <button class="btn-vista" data-vista="rendimiento">Rendimiento</button>
        </div>
      </div>
      
      <!-- Cards de estadísticas rápidas -->
      <div class="stats-cards" id="stats-cards">
        <div class="stat-card">
          <span class="stat-icon">⚽</span>
          <div class="stat-numero" id="total-goles">0</div>
          <div class="stat-label">Goles Totales</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🎯</span>
          <div class="stat-numero" id="total-asistencias">0</div>
          <div class="stat-label">Asistencias</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🏃</span>
          <div class="stat-numero" id="total-partidos">0</div>
          <div class="stat-label">Partidos Jugados</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🏥</span>
          <div class="stat-numero" id="total-lesiones">0</div>
          <div class="stat-label">Lesiones</div>
        </div>
      </div>
      
      <div class="estadisticas-grid" id="estadisticas-grid">
        <!-- El contenido se cargará dinámicamente según la vista -->
      </div>
    </div>
  `;

  // Cargar datos
  await cargarDatos();
  
  // Configurar eventos
  configurarEventos();
  
  // Mostrar vista inicial
  mostrarVista('individual');
}

async function cargarDatos() {
  try {
    mostrarCarga();
    
    const res = await fetch('obtener_estadisticas.php');
    if (!res.ok) {
      throw new Error('Error al cargar estadísticas');
    }
    
    const data = await res.json();
    // Handle both old and new response formats
    let jugadores = [];
    if (data.success && data.estadisticas && Array.isArray(data.estadisticas)) {
      jugadores = data.estadisticas;
    } else if (Array.isArray(data)) {
      jugadores = data;
    } else {
      console.error('Invalid data format:', data);
      throw new Error('Formato de datos inválido');
    }
    
    estadisticasJugadoresData = jugadores;
    
    // Llenar selector
    const selector = document.getElementById('selector-jugador');
    selector.innerHTML = '<option value="">Selecciona un jugador</option>';
    
    estadisticasJugadoresData.forEach(j => {
      const opt = document.createElement('option');
      opt.value = j.id;
      opt.textContent = `#${j.numero} - ${j.nombre} (${j.posicion})`;
      selector.appendChild(opt);
    });
    
    // Actualizar cards de resumen
    actualizarCardsResumen();
    
    // Seleccionar primer jugador por defecto
    if (Array.isArray(estadisticasJugadoresData) && estadisticasJugadoresData.length > 0) {
      selector.value = estadisticasJugadoresData[0].id;
    }
    
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
    mostrarError('Error al cargar las estadísticas');
  }
}

function configurarEventos() {
  // Selector de jugador
  const selector = document.getElementById('selector-jugador');
  selector.addEventListener('change', () => {
    if (estadisticasVistaActual === 'individual') {
      if (Array.isArray(estadisticasJugadoresData)) {
        const jugador = estadisticasJugadoresData.find(j => j.id == selector.value);
        if (jugador) {
          actualizarVistaIndividual(jugador);
        }
      }
    }
  });
  
  // Botones de vista
  document.querySelectorAll('.btn-vista').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-vista').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      estadisticasVistaActual = btn.dataset.vista;
      mostrarVista(estadisticasVistaActual);
    });
  });
}

function mostrarVista(vista) {
  const grid = document.getElementById('estadisticas-grid');
  
  switch(vista) {
    case 'individual':
      mostrarVistaIndividual();
      break;
    case 'comparacion':
      mostrarVistaComparacion();
      break;
    case 'equipo':
      mostrarVistaEquipo();
      break;
    case 'rendimiento':
      mostrarVistaRendimiento();
      break;
  }
}

function mostrarVistaIndividual() {
  const grid = document.getElementById('estadisticas-grid');
  grid.innerHTML = `
    <div class="grafico-container">
      <div class="grafico-titulo">📊 Estadísticas Individuales</div>
      <div class="canvas-wrapper">
        <canvas id="graficoJugador"></canvas>
      </div>
    </div>
    
    <div class="grafico-container">
      <div class="grafico-titulo">📈 Progresión Temporal</div>
      <div class="canvas-wrapper">
        <canvas id="graficoProgresion"></canvas>
      </div>
    </div>
  `;
  
  const selector = document.getElementById('selector-jugador');
  if (selector.value && Array.isArray(estadisticasJugadoresData)) {
    const jugador = estadisticasJugadoresData.find(j => j.id == selector.value);
    if (jugador) {
      actualizarVistaIndividual(jugador);
    }
  }
}

function mostrarVistaComparacion() {
  const grid = document.getElementById('estadisticas-grid');
  grid.innerHTML = `
    <div class="grafico-container" style="grid-column: 1 / -1;">
      <div class="grafico-titulo">⚖️ Comparación de Jugadores</div>
      <div class="canvas-wrapper">
        <canvas id="graficoComparacion"></canvas>
      </div>
    </div>
    
    <div class="tabla-estadisticas">
      <div class="grafico-titulo">📋 Tabla Comparativa</div>
      <table id="tabla-comparacion">
        <thead>
          <tr>
            <th>Jugador</th>
            <th>Posición</th>
            <th>Goles</th>
            <th>Asistencias</th>
            <th>Partidos</th>
            <th>Promedio Goles</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;
  
  actualizarVistaComparacion();
}

function mostrarVistaEquipo() {
  const grid = document.getElementById('estadisticas-grid');
  grid.innerHTML = `
    <div class="grafico-container">
      <div class="grafico-titulo">🏟️ Estadísticas por Posición</div>
      <div class="canvas-wrapper">
        <canvas id="graficoEquipo"></canvas>
      </div>
    </div>
    
    <div class="grafico-container">
      <div class="grafico-titulo">🎯 Efectividad del Equipo</div>
      <div class="canvas-wrapper">
        <canvas id="graficoEfectividad"></canvas>
      </div>
    </div>
  `;
  
  actualizarVistaEquipo();
}

function mostrarVistaRendimiento() {
  const grid = document.getElementById('estadisticas-grid');
  grid.innerHTML = `
    <div class="grafico-container" style="grid-column: 1 / -1;">
      <div class="grafico-titulo">📈 Rendimiento del Equipo en el Tiempo</div>
      <div class="canvas-wrapper">
        <canvas id="graficoRendimiento"></canvas>
      </div>
    </div>
  `;
  
  actualizarVistaRendimiento();
}

function actualizarVistaIndividual(jugador) {
  // Gráfico principal del jugador
  const ctx = document.getElementById('graficoJugador').getContext('2d');
  if (graficoStats) graficoStats.destroy();
  
  graficoStats = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Goles', 'Asistencias', 'Partidos', 'Efectividad'],
      datasets: [{
        label: `${jugador.nombre} (#${jugador.numero})`,
        data: [
          jugador.goles,
          jugador.asistencias,
          jugador.partidos,
          jugador.partidos > 0 ? (jugador.goles / jugador.partidos * 10) : 0
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: '#22c55e',
        borderWidth: 3,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#ffffff', font: { size: 14 } }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          grid: { color: '#475569' },
          angleLines: { color: '#475569' },
          pointLabels: { color: '#cbd5e1', font: { size: 12 } },
          ticks: { color: '#94a3b8', backdropColor: 'transparent' }
        }
      }
    }
  });
  
  // Gráfico de progresión (simulado)
  const ctxProgresion = document.getElementById('graficoProgresion').getContext('2d');
  new Chart(ctxProgresion, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Goles por mes',
        data: [
          Math.floor(jugador.goles * 0.1),
          Math.floor(jugador.goles * 0.15),
          Math.floor(jugador.goles * 0.2),
          Math.floor(jugador.goles * 0.25),
          Math.floor(jugador.goles * 0.2),
          Math.floor(jugador.goles * 0.1)
        ],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#ffffff' } }
      },
      scales: {
        x: { 
          grid: { color: '#475569' },
          ticks: { color: '#cbd5e1' }
        },
        y: { 
          beginAtZero: true,
          grid: { color: '#475569' },
          ticks: { color: '#cbd5e1' }
        }
      }
    }
  });
}

function actualizarVistaComparacion() {
  try {
    const canvas = document.getElementById('graficoComparacion');
    if (!canvas) {
      console.error('Canvas graficoComparacion no encontrado');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (graficoComparacion) graficoComparacion.destroy();
    
    // Verificar que tenemos datos válidos
    if (!Array.isArray(estadisticasJugadoresData) || estadisticasJugadoresData.length === 0) {
      console.warn('No hay datos de jugadores para comparar');
      return;
    }
    
    // Tomar los top 5 goleadores
    const topGoleadores = [...estadisticasJugadoresData]
      .sort((a, b) => (parseInt(b.goles) || 0) - (parseInt(a.goles) || 0))
      .slice(0, 5);
    
    graficoComparacion = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topGoleadores.map(j => `${j.nombre} (#${j.numero})`),
      datasets: [
        {
          label: 'Goles',
          data: topGoleadores.map(j => j.goles),
          backgroundColor: '#22c55e',
          borderRadius: 8
        },
        {
          label: 'Asistencias',
          data: topGoleadores.map(j => j.asistencias),
          backgroundColor: '#3b82f6',
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#ffffff' } }
      },
      scales: {
        x: { 
          grid: { color: '#475569' },
          ticks: { color: '#cbd5e1' }
        },
        y: { 
          beginAtZero: true,
          grid: { color: '#475569' },
          ticks: { color: '#cbd5e1' }
        }
      }
    }
  });
  
  // Llenar tabla
  const tbody = document.querySelector('#tabla-comparacion tbody');
  if (tbody) {
    tbody.innerHTML = '';
    
    if (Array.isArray(estadisticasJugadoresData)) {
      estadisticasJugadoresData.forEach(jugador => {
        const row = tbody.insertRow();
        const promedioGoles = jugador.partidos > 0 ? (jugador.goles / jugador.partidos).toFixed(2) : '0.00';
        
        row.innerHTML = `
          <td class="jugador-nombre">${jugador.nombre}</td>
          <td>${jugador.posicion}</td>
          <td class="stat-destacada">${jugador.goles}</td>
          <td>${jugador.asistencias}</td>
          <td>${jugador.partidos}</td>
          <td>${promedioGoles}</td>
        `;
      });
    }
  }
  } catch (error) {
    console.error('Error al actualizar vista de comparación:', error);
  }
}

function actualizarVistaEquipo() {
  try {
    // Verificar que tenemos datos válidos
    if (!Array.isArray(estadisticasJugadoresData) || estadisticasJugadoresData.length === 0) {
      console.warn('No hay datos de jugadores para mostrar estadísticas del equipo');
      return;
    }
    
    // Estadísticas por posición
    const posiciones = {};
    estadisticasJugadoresData.forEach(jugador => {
      if (!posiciones[jugador.posicion]) {
        posiciones[jugador.posicion] = { goles: 0, asistencias: 0, jugadores: 0 };
      }
      posiciones[jugador.posicion].goles += parseInt(jugador.goles) || 0;
      posiciones[jugador.posicion].asistencias += parseInt(jugador.asistencias) || 0;
      posiciones[jugador.posicion].jugadores++;
    });
    
    const canvas = document.getElementById('graficoEquipo');
    if (!canvas) {
      console.error('Canvas graficoEquipo no encontrado');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (graficoEquipo) graficoEquipo.destroy();
    
    graficoEquipo = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(posiciones),
      datasets: [{
        data: Object.values(posiciones).map(p => p.goles),
        backgroundColor: [
          '#22c55e',
          '#3b82f6', 
          '#f59e0b',
          '#ef4444',
          '#8b5cf6'
        ],
        borderWidth: 3,
        borderColor: '#1e293b'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          labels: { color: '#ffffff' },
          position: 'bottom'
        }
      }
    }
  });
  
  // Gráfico de efectividad
  const ctxEfectividad = document.getElementById('graficoEfectividad').getContext('2d');
  new Chart(ctxEfectividad, {
    type: 'polarArea',
    data: {
      labels: Object.keys(posiciones),
      datasets: [{
        data: Object.values(posiciones).map(p => 
          p.jugadores > 0 ? (p.goles / p.jugadores).toFixed(1) : 0
        ),
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)'
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          labels: { color: '#ffffff' },
          position: 'bottom'
        }
      },
      scales: {
        r: {
          grid: { color: '#475569' },
          angleLines: { color: '#475569' },
          pointLabels: { color: '#cbd5e1' },
          ticks: { color: '#94a3b8', backdropColor: 'transparent' }
        }
      }
    }
  });
  } catch (error) {
    console.error('Error al actualizar vista del equipo:', error);
  }
}

function actualizarVistaRendimiento() {
  try {
    // Verificar que tenemos datos válidos
    if (!Array.isArray(estadisticasJugadoresData) || estadisticasJugadoresData.length === 0) {
      console.warn('No hay datos de jugadores para mostrar rendimiento');
      return;
    }
    
    const canvas = document.getElementById('graficoRendimiento');
    if (!canvas) {
      console.error('Canvas graficoRendimiento no encontrado');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (graficoRendimiento) graficoRendimiento.destroy();
    
    // Datos simulados de rendimiento mensual
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const totalGoles = estadisticasJugadoresData.reduce((sum, j) => sum + (parseInt(j.goles) || 0), 0);
    
    graficoRendimiento = new Chart(ctx, {
    type: 'line',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Goles del Equipo',
          data: meses.map(() => Math.floor(Math.random() * (totalGoles / 6)) + 5),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Goles Recibidos',
          data: meses.map(() => Math.floor(Math.random() * 15) + 3),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#ffffff' } }
      },
      scales: {
        x: { 
          grid: { color: '#475569' },
          ticks: { color: '#cbd5e1' }
        },
        y: { 
          beginAtZero: true,
          grid: { color: '#475569' },
          ticks: { color: '#cbd5e1' }
        }
      }
    }
  });
  } catch (error) {
    console.error('Error al actualizar vista de rendimiento:', error);
  }
}

function actualizarCardsResumen() {
  if (!Array.isArray(estadisticasJugadoresData)) {
    return;
  }
  const totalGoles = estadisticasJugadoresData.reduce((sum, j) => sum + parseInt(j.goles), 0);
  const totalAsistencias = estadisticasJugadoresData.reduce((sum, j) => sum + parseInt(j.asistencias), 0);
  const totalPartidos = estadisticasJugadoresData.reduce((sum, j) => sum + parseInt(j.partidos), 0);
  const totalLesiones = estadisticasJugadoresData.reduce((sum, j) => sum + parseInt(j.lesiones), 0);
  
  // Animación de conteo
  animarContador('total-goles', totalGoles);
  animarContador('total-asistencias', totalAsistencias);
  animarContador('total-partidos', totalPartidos);
  animarContador('total-lesiones', totalLesiones);
}

function animarContador(elementId, valorFinal) {
  const elemento = document.getElementById(elementId);
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

function mostrarCarga() {
  const grid = document.getElementById('estadisticas-grid');
  grid.innerHTML = '<div class="loading">Cargando estadísticas...</div>';
}

function mostrarError(mensaje) {
  const grid = document.getElementById('estadisticas-grid');
  grid.innerHTML = `
    <div style="text-align: center; color: #ef4444; padding: 2rem;">
      <h3>❌ Error</h3>
      <p>${mensaje}</p>
    </div>
  `;
}

// Exportar función
window.mostrarEstadisticas = mostrarEstadisticas;
