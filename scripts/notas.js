function mostrarNotas(contenedor) {
  contenedor.innerHTML = `
    <div class="notas-container-wrapper">
      <div class="notas-header">
        <h2>📝 Notas del Director Técnico</h2>
        <p>Organiza tus ideas, estrategias y observaciones</p>
      </div>
      
      <div id="notas-container">
        <div id="editor">
          <div class="editor-header">
            <div class="editor-title" id="editor-title">✏️ Nueva Nota</div>
            <div class="editor-info" id="editor-info">
              <span id="fecha-actual"></span>
            </div>
          </div>
          
          <textarea 
            id="nota-texto" 
            placeholder="Escribe aquí tus notas sobre tácticas, jugadores, observaciones del partido, ideas para entrenamientos..."
          ></textarea>
          
          <div class="contador-caracteres" id="contador-caracteres">
            0 caracteres
          </div>
          
          <div class="editor-controls">
            <button id="guardar-nota-btn">
              <span id="btn-texto">💾 Guardar Nota</span>
            </button>
            <button class="btn-nueva-nota" id="nueva-nota-btn">
              ➕ Nueva Nota
            </button>
          </div>
        </div>
        
        <div id="lista-notas">
          <div class="lista-header">
            <div class="lista-title">📋 Mis Notas</div>
          </div>
          
          <input 
            type="text" 
            class="buscar-notas" 
            id="buscar-notas" 
            placeholder="🔍 Buscar en mis notas..."
          >
          
          <div class="notas-scroll" id="notas-scroll">
            <!-- Las notas se cargarán aquí -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Referencias a elementos
  const textarea = document.getElementById('nota-texto');
  const btnGuardar = document.getElementById('guardar-nota-btn');
  const btnTexto = document.getElementById('btn-texto');
  const btnNueva = document.getElementById('nueva-nota-btn');
  const notasScroll = document.getElementById('notas-scroll');
  const buscarInput = document.getElementById('buscar-notas');
  const contadorCaracteres = document.getElementById('contador-caracteres');
  const editorTitle = document.getElementById('editor-title');
  const editorInfo = document.getElementById('editor-info');
  const fechaActual = document.getElementById('fecha-actual');

  // Estado de la aplicación
  let notas = JSON.parse(localStorage.getItem('notasDT') || '[]');
  let notaActivaIndex = null;
  let autoGuardado = null;
  let notasFiltradas = [...notas];

  // Inicializar
  actualizarFecha();
  renderNotas();
  configurarEventos();

  function actualizarFecha() {
    const ahora = new Date();
    fechaActual.textContent = ahora.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function configurarEventos() {
    // Contador de caracteres en tiempo real
    textarea.addEventListener('input', () => {
      const longitud = textarea.value.length;
      contadorCaracteres.textContent = `${longitud} caracteres`;
      
      // Auto-guardado después de 2 segundos de inactividad
      clearTimeout(autoGuardado);
      autoGuardado = setTimeout(() => {
        if (textarea.value.trim() && notaActivaIndex !== null) {
          guardarNota(true); // true = auto-guardado silencioso
        }
      }, 2000);
    });

    // Guardar nota
    btnGuardar.addEventListener('click', () => guardarNota());

    // Nueva nota
    btnNueva.addEventListener('click', nuevaNota);

    // Búsqueda
    buscarInput.addEventListener('input', filtrarNotas);

    // Atajos de teclado
    textarea.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        guardarNota();
      }
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        nuevaNota();
      }
    });
  }

  function renderNotas() {
    if (notasFiltradas.length === 0) {
      notasScroll.innerHTML = `
        <div class="notas-vacio">
          <div class="notas-vacio-icon">📝</div>
          <p>No tienes notas guardadas</p>
          <p>¡Empieza escribiendo tu primera nota!</p>
        </div>
      `;
      return;
    }

    notasScroll.innerHTML = '';
    
    notasFiltradas.forEach((nota, index) => {
      const realIndex = notas.indexOf(nota);
      const div = document.createElement('div');
      div.className = 'nota-item' + (realIndex === notaActivaIndex ? ' active' : '');
      
      const fecha = new Date(nota.fecha);
      const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      const preview = nota.text.length > 100 
        ? nota.text.substring(0, 100) + '...' 
        : nota.text;

      div.innerHTML = `
        <div class="nota-preview">${preview}</div>
        <div class="nota-meta">
          <div class="nota-fecha">
            📅 ${fechaFormateada}
          </div>
          <div class="nota-acciones">
            <button class="btn-eliminar" onclick="eliminarNota(${realIndex})" title="Eliminar nota">
              🗑️
            </button>
          </div>
        </div>
      `;

      div.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-eliminar')) {
          cargarNota(realIndex);
        }
      });

      notasScroll.appendChild(div);
    });
  }

  function guardarNota(autoGuardado = false) {
    const texto = textarea.value.trim();
    
    if (!texto) {
      if (!autoGuardado) {
        mostrarNotificacion('Escribe algo antes de guardar', 'error');
      }
      return;
    }

    // Mostrar estado de guardado
    if (!autoGuardado) {
      btnGuardar.disabled = true;
      btnTexto.textContent = '💾 Guardando...';
    }

    const fecha = Date.now();
    
    if (notaActivaIndex === null) {
      // Nueva nota
      const nuevaNota = { text: texto, fecha };
      notas.unshift(nuevaNota);
      notaActivaIndex = 0;
      editorTitle.textContent = '✏️ Editando Nota';
    } else {
      // Editar nota existente
      notas[notaActivaIndex] = { text: texto, fecha };
    }

    // Guardar en localStorage
    localStorage.setItem('notasDT', JSON.stringify(notas));
    
    // Actualizar vista
    notasFiltradas = [...notas];
    renderNotas();

    if (!autoGuardado) {
      // Feedback visual
      document.getElementById('editor').classList.add('guardado-exitoso');
      setTimeout(() => {
        document.getElementById('editor').classList.remove('guardado-exitoso');
      }, 500);

      // Restaurar botón
      setTimeout(() => {
        btnGuardar.disabled = false;
        btnTexto.textContent = '💾 Guardar Nota';
        mostrarNotificacion('Nota guardada correctamente', 'success');
      }, 500);
    }
  }

  function cargarNota(index) {
    if (index >= 0 && index < notas.length) {
      notaActivaIndex = index;
      textarea.value = notas[index].text;
      editorTitle.textContent = '✏️ Editando Nota';
      
      // Actualizar contador
      contadorCaracteres.textContent = `${textarea.value.length} caracteres`;
      
      // Focus en textarea
      textarea.focus();
      
      // Actualizar vista
      renderNotas();
    }
  }

  function nuevaNota() {
    notaActivaIndex = null;
    textarea.value = '';
    editorTitle.textContent = '✏️ Nueva Nota';
    contadorCaracteres.textContent = '0 caracteres';
    textarea.focus();
    renderNotas();
    
    // Limpiar búsqueda
    buscarInput.value = '';
    notasFiltradas = [...notas];
  }

  function filtrarNotas() {
    const termino = buscarInput.value.toLowerCase().trim();
    
    if (!termino) {
      notasFiltradas = [...notas];
    } else {
      notasFiltradas = notas.filter(nota => 
        nota.text.toLowerCase().includes(termino)
      );
    }
    
    renderNotas();
  }

  function mostrarNotificacion(mensaje, tipo = 'success') {
    // Remover notificación anterior si existe
    const notifAnterior = document.querySelector('.notificacion');
    if (notifAnterior) {
      notifAnterior.remove();
    }

    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo}`;
    notif.textContent = mensaje;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
      notif.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // Función global para eliminar notas
  window.eliminarNota = function(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      notas.splice(index, 1);
      localStorage.setItem('notasDT', JSON.stringify(notas));
      
      // Si estábamos editando la nota eliminada, limpiar editor
      if (notaActivaIndex === index) {
        nuevaNota();
      } else if (notaActivaIndex > index) {
        notaActivaIndex--;
      }
      
      notasFiltradas = [...notas];
      renderNotas();
      mostrarNotificacion('Nota eliminada', 'success');
    }
  };

  // Agregar estilos para animaciones adicionales
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Actualizar fecha cada minuto
  setInterval(actualizarFecha, 60000);
}

// Exportar función
window.mostrarNotas = mostrarNotas;
