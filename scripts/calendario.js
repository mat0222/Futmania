async function mostrarCalendario(contenido) {
  contenido.innerHTML = `
    <div class="calendario-container">
      <div class="calendario-header">
        <h2>📅 Calendario de Partidos</h2>
        <p>Gestiona los partidos de tu equipo</p>
      </div>
      
      <div id="contenedor-calendario">
        <div id="calendario"></div>
        <div id="formulario-lateral">
          <h3 id="form-titulo">Agregar Partido</h3>
          <form id="formPartido">
            <input type="hidden" name="id" />
            
            <div class="form-group">
              <label>📅 Fecha del Partido:</label>
              <input type="date" name="fecha" required />
            </div>
            
            <div class="form-group">
              <label>⚽ Equipo Rival:</label>
              <input type="text" name="rival" placeholder="Nombre del equipo rival" required />
            </div>
            
            <div class="form-group">
              <label>🏟️ Estadio:</label>
              <input type="text" name="estadio" placeholder="Nombre del estadio" required />
            </div>
            
            <div class="form-group">
              <label>🎯 Resultado:</label>
              <input type="text" name="resultado" placeholder="Ej: 2-1, 0-0, 3-2" />
            </div>
            
            <button type="submit" id="btn-guardar">
              <span id="btn-texto">Guardar Partido</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('formPartido');
  const formTitulo = document.getElementById('form-titulo');
  const btnTexto = document.getElementById('btn-texto');
  const formularioLateral = document.getElementById('formulario-lateral');
  let modoEdicion = false;

  // Configuración del calendario
  const calendarEl = document.getElementById('calendario');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },
    events: 'calendario.php',
    
    // Personalizar eventos según resultado
    eventDidMount: function(info) {
      const resultado = info.event.extendedProps.resultado;
      if (resultado) {
        const [golesLocal, golesVisitante] = resultado.split('-').map(g => parseInt(g.trim()));
        
        if (!isNaN(golesLocal) && !isNaN(golesVisitante)) {
          if (golesLocal > golesVisitante) {
            info.el.classList.add('partido-ganado');
            info.el.title = `Victoria ${resultado} vs ${info.event.extendedProps.rival}`;
          } else if (golesLocal < golesVisitante) {
            info.el.classList.add('partido-perdido');
            info.el.title = `Derrota ${resultado} vs ${info.event.extendedProps.rival}`;
          } else {
            info.el.classList.add('partido-empatado');
            info.el.title = `Empate ${resultado} vs ${info.event.extendedProps.rival}`;
          }
        }
      } else {
        info.el.title = `Partido vs ${info.event.extendedProps.rival}`;
      }
    },
    
    dateClick: function (info) {
      resetForm();
      form.fecha.value = info.dateStr;
      
      // Efecto visual
      highlightSelectedDate(info.dateStr);
    },
    
    eventClick: function (info) {
      const p = info.event.extendedProps;
      
      // Llenar formulario con datos del evento
      form.fecha.value = info.event.startStr;
      form.rival.value = p.rival || '';
      form.estadio.value = p.estadio || '';
      form.resultado.value = p.resultado || '';
      form.id.value = info.event.id;
      
      // Cambiar a modo edición
      activarModoEdicion();
      
      // Efecto visual
      highlightSelectedDate(info.event.startStr);
    }
  });

  // Renderizar calendario
  calendar.render();

  // Funciones auxiliares
  function resetForm() {
    form.reset();
    desactivarModoEdicion();
  }

  function activarModoEdicion() {
    modoEdicion = true;
    formTitulo.textContent = '✏️ Editar Partido';
    btnTexto.textContent = 'Actualizar Partido';
    formularioLateral.classList.add('modo-edicion');
  }

  function desactivarModoEdicion() {
    modoEdicion = false;
    formTitulo.textContent = '➕ Agregar Partido';
    btnTexto.textContent = 'Guardar Partido';
    formularioLateral.classList.remove('modo-edicion');
  }

  function highlightSelectedDate(dateStr) {
    // Remover highlight anterior
    document.querySelectorAll('.fc-day-selected').forEach(el => {
      el.classList.remove('fc-day-selected');
    });
    
    // Agregar highlight a la fecha seleccionada
    const dateCell = document.querySelector(`[data-date="${dateStr}"]`);
    if (dateCell) {
      dateCell.classList.add('fc-day-selected');
    }
  }

  function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear notificación temporal
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

  // Manejar envío del formulario
  form.onsubmit = async (e) => {
    e.preventDefault();
    
    const btnGuardar = document.getElementById('btn-guardar');
    const textoOriginal = btnTexto.textContent;
    
    // Mostrar estado de carga
    btnGuardar.disabled = true;
    btnTexto.textContent = modoEdicion ? 'Actualizando...' : 'Guardando...';
    
    try {
      const datos = new FormData(form);
      const url = datos.get('id') ? 'editar_partido.php' : 'guardar_partido.php';
      
      const res = await fetch(url, {
        method: 'POST',
        body: datos
      });
      
      if (res.ok) {
        const mensaje = modoEdicion ? 'Partido actualizado correctamente' : 'Partido agregado correctamente';
        mostrarNotificacion(mensaje, 'success');
        
        // Resetear formulario y recargar eventos
        resetForm();
        calendar.refetchEvents();
      } else {
        throw new Error('Error en el servidor');
      }
      
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('Error al guardar el partido', 'error');
    } finally {
      // Restaurar botón
      btnGuardar.disabled = false;
      btnTexto.textContent = textoOriginal;
    }
  };

  // Agregar estilos para las animaciones
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
    .fc-day-selected {
      background: rgba(34, 197, 94, 0.3) !important;
      border: 2px solid #22c55e !important;
    }
  `;
  document.head.appendChild(style);
}

// Exportar función
window.mostrarCalendario = mostrarCalendario;

