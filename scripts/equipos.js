// Datos de los equipos
const equiposData = [
  {
    id: 1,
    nombre: "Club Sablazo De Legui",
    escudo: "img/Logo escudo de club de futbol deportivo profesional azul.jpg",
    emoji: "⚽", // Emoji de respaldo
    estadio: "Cabaña",
    fundacion: 2018,
    director: "Mateo Liendo",
    colorPrimario: "#22c55e",
    colorSecundario: "#16a34a",
    liga: "Primera División",
    titulos: 3
  },
  {
    id: 2,
    nombre: "Paris Saint Aleman",
    escudo: "img/Logo escudo de club de futbol deportivo profesional azul.jpg",
    emoji: "⚽", // Emoji de respaldo
    estadio: "Poli Deportivo",
    fundacion: 2021,
    director: "Mateo Liendo",
    colorPrimario: "#3b82f6",
    colorSecundario: "#1d4ed8",
    liga: "Primera División",
    titulos: 1
  }
];

let equipoSeleccionado = null;

function mostrarEquipos(contenedor) {
  const equiposHTML = `
    <div class="equipos-container">
      <div class="equipos-header">
        <h1>⚽ Liga de Fútbol</h1>
        <p>Conoce a los equipos de nuestra liga</p>
      </div>
      
      <div class="equipos-grid" id="equipos-grid">
        ${equiposData.map(equipo => crearEquipoCard(equipo)).join('')}
      </div>
      
      <div class="click-hint">
        Haz clic en cualquier equipo para ver más detalles
      </div>
    </div>
  `;
  
  contenedor.innerHTML = equiposHTML;
  
  // Agregar event listeners
  equiposData.forEach(equipo => {
    const card = document.getElementById(`equipo-${equipo.id}`);
    if (card) {
      card.addEventListener('click', () => toggleEquipo(equipo.id));
    }
  });
}

function crearEquipoCard(equipo) {
  const añosHistoria = new Date().getFullYear() - equipo.fundacion;
  
  return `
    <div class="equipo-card" id="equipo-${equipo.id}" style="--color-primario: ${equipo.colorPrimario}; --color-secundario: ${equipo.colorSecundario}">
      <div class="equipo-main">
        <div class="escudo-container">
          <div class="escudo-wrapper">
            <div class="escudo-inner">
              <div class="escudo-emoji">${equipo.emoji}</div>
            </div>
          </div>
          ${equipo.titulos > 0 ? `
            <div class="titulos-badge" title="Títulos ganados">
              🏆${equipo.titulos}
            </div>
          ` : ''}
        </div>
        
        <div class="info-equipo">
          <h2 class="equipo-nombre">${equipo.nombre}</h2>
          <div class="liga-badge">${equipo.liga}</div>
          
          <div class="equipo-detalles">
            <div class="detalle-item">
              <span class="detalle-icon">🏟️</span>
              <span>${equipo.estadio}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-icon">📅</span>
              <span>Fundado en ${equipo.fundacion}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-icon">👨‍💼</span>
              <span>DT: ${equipo.director}</span>
            </div>
          </div>
          
          <div class="colores-equipo">
            <span class="colores-label">Colores:</span>
            <div class="colores-container">
              <div class="color-circle" style="background-color: ${equipo.colorPrimario}" title="Color Primario"></div>
              <div class="color-circle" style="background-color: ${equipo.colorSecundario}" title="Color Secundario"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="equipo-expandido" id="expandido-${equipo.id}" style="display: none;">
        <div class="estadisticas-grid">
          <div class="estadistica-card">
            <div class="estadistica-numero verde">${añosHistoria}</div>
            <div class="estadistica-label">Años de historia</div>
          </div>
          <div class="estadistica-card">
            <div class="estadistica-numero amarillo">${equipo.titulos}</div>
            <div class="estadistica-label">Títulos ganados</div>
          </div>
          <div class="estadistica-card">
            <div class="estadistica-numero azul">Activo</div>
            <div class="estadistica-label">Estado actual</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleEquipo(equipoId) {
  const card = document.getElementById(`equipo-${equipoId}`);
  const expandido = document.getElementById(`expandido-${equipoId}`);
  
  if (equipoSeleccionado === equipoId) {
    // Cerrar el equipo actual
    card.classList.remove('selected');
    expandido.style.display = 'none';
    equipoSeleccionado = null;
  } else {
    // Cerrar el equipo anterior si existe
    if (equipoSeleccionado) {
      const cardAnterior = document.getElementById(`equipo-${equipoSeleccionado}`);
      const expandidoAnterior = document.getElementById(`expandido-${equipoSeleccionado}`);
      cardAnterior.classList.remove('selected');
      expandidoAnterior.style.display = 'none';
    }
    
    // Abrir el nuevo equipo
    card.classList.add('selected');
    expandido.style.display = 'block';
    equipoSeleccionado = equipoId;
    
    // Scroll suave hacia el equipo seleccionado
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Función para agregar un nuevo equipo (opcional)
function agregarEquipo(nuevoEquipo) {
  equiposData.push({
    ...nuevoEquipo,
    id: equiposData.length + 1
  });
  
  // Recargar la vista si está activa
  const contenedor = document.getElementById('contenido');
  if (contenedor && contenedor.querySelector('.equipos-container')) {
    mostrarEquipos(contenedor);
  }
}

// Exportar la función principal para mantener compatibilidad
window.mostrarEquipos = mostrarEquipos;
window.agregarEquipo = agregarEquipo;

