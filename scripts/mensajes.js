let contactoActivo = null;
let mensajes = {};
let escribiendoTimeout = null;

// Datos de ejemplo de jugadores/contactos
const contactosEjemplo = [
  {
    id: 1,
    nombre: "Carlos Rodríguez",
    posicion: "Portero",
    numero: 1,
    online: true,
    ultimoMensaje: "Listo para el partido de mañana 🥅"
  },
  {
    id: 2,
    nombre: "Miguel Santos",
    posicion: "Defensa",
    numero: 4,
    online: true,
    ultimoMensaje: "¿A qué hora es el entrenamiento?"
  },
  {
    id: 3,
    nombre: "Diego López",
    posicion: "Mediocampo",
    numero: 10,
    online: false,
    ultimoMensaje: "Perfecto, nos vemos ahí"
  },
  {
    id: 4,
    nombre: "Andrés García",
    posicion: "Delantero",
    numero: 9,
    online: true,
    ultimoMensaje: "¡Vamos por la victoria! ⚽"
  },
  {
    id: 5,
    nombre: "Roberto Silva",
    posicion: "Defensa",
    numero: 2,
    online: false,
    ultimoMensaje: "Gracias por los consejos, DT"
  }
];

function mostrarMensajes(contenedor) {
  contenedor.innerHTML = `
    <div class="mensajes-container-wrapper">
      <div class="mensajes-header">
        <h2>💬 Centro de Mensajes</h2>
        <p>Comunícate con tu equipo en tiempo real</p>
      </div>
      
      <div class="mensajes-container">
        <aside class="lista-contactos">
          <div class="contactos-header">
            <h3>👥 Equipo</h3>
            <input 
              type="text" 
              class="buscar-contactos" 
              id="buscar-contactos"
              placeholder="🔍 Buscar jugador..."
            >
          </div>
          <div class="contactos-scroll">
            <ul id="lista-jugadores"></ul>
          </div>
        </aside>
        
        <section class="chat-area">
          <div class="chat-header" id="chat-header">
            <div class="chat-vacio">
              <div class="chat-vacio-icon">💬</div>
              <h3>Selecciona un jugador</h3>
              <p>Elige un contacto para comenzar a chatear</p>
            </div>
          </div>
          
          <div class="chat-mensajes" id="chat-mensajes">
            <!-- Mensajes aparecerán aquí -->
          </div>
          
          <div class="chat-input" id="chat-input" style="display: none;">
            <button class="btn-adjuntar" title="Adjuntar archivo">
              📎
            </button>
            <div class="input-wrapper">
              <textarea 
                id="mensaje-input" 
                placeholder="Escribe un mensaje..."
                rows="1"
                disabled
              ></textarea>
            </div>
            <button id="btn-enviar" disabled>
              Enviar
            </button>
          </div>
        </section>
      </div>
    </div>
  `;

  // Inicializar datos de ejemplo
  inicializarMensajesEjemplo();
  
  // Cargar contactos
  cargarContactos();
  
  // Configurar eventos
  configurarEventos();
}

function inicializarMensajesEjemplo() {
  // Mensajes de ejemplo para cada contacto
  mensajes = {
    1: [
      {
        id: 1,
        texto: "Hola DT, ¿cómo está?",
        tipo: "entrante",
        hora: new Date(Date.now() - 3600000).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}),
        visto: true
      },
      {
        id: 2,
        texto: "Todo bien Carlos, ¿listo para el partido?",
        tipo: "saliente",
        hora: new Date(Date.now() - 3500000).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}),
        visto: true
      },
      {
        id: 3,
        texto: "¡Por supuesto! He estado practicando mis atajadas 🥅",
        tipo: "entrante",
        hora: new Date(Date.now() - 1800000).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}),
        visto: true
      }
    ],
    2: [
      {
        id: 1,
        texto: "DT, ¿a qué hora es el entrenamiento de mañana?",
        tipo: "entrante",
        hora: new Date(Date.now() - 7200000).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}),
        visto: true
      },
      {
        id: 2,
        texto: "A las 9:00 AM en el campo principal",
        tipo: "saliente",
        hora: new Date(Date.now() - 7000000).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}),
        visto: true
      }
    ],
    4: [
      {
        id: 1,
        texto: "¡Vamos equipo! 💪",
        tipo: "entrante",
        hora: new Date(Date.now() - 900000).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}),
        visto: false
      }
    ]
  };
}

async function cargarContactos() {
  const lista = document.getElementById('lista-jugadores');
  lista.innerHTML = '';
  
  try {
    // Intentar cargar jugadores desde PHP
    const res = await fetch('obtener_jugadores.php');
    if (!res.ok) {
      throw new Error('Error al cargar jugadores');
    }
    
    const data = await res.json();
    if (data.success && data.jugadores && data.jugadores.length > 0) {
      // Usar datos reales de la base de datos
      data.jugadores.forEach(jugador => {
        const li = document.createElement('li');
        li.className = 'contacto-item';
        li.dataset.contactoId = jugador.id;
        
        const iniciales = jugador.nombre.split(' ').map(n => n[0]).join('');
        const ultimoMensaje = mensajes[jugador.id] ? 
          mensajes[jugador.id][mensajes[jugador.id].length - 1].texto.substring(0, 30) + '...' :
          'No hay mensajes';
        
        li.innerHTML = `
          <div class="contacto-info">
            <div class="contacto-avatar">${iniciales}</div>
            <div class="contacto-detalles">
              <div class="contacto-nombre">${jugador.nombre}</div>
              <div class="contacto-posicion">#${jugador.numero} - ${jugador.posicion}</div>
              <div class="contacto-estado">
                <div class="estado-online"></div>
                <span class="ultimo-mensaje">${ultimoMensaje}</span>
              </div>
            </div>
          </div>
        `;
        
        li.addEventListener('click', () => seleccionarContacto(jugador));
        lista.appendChild(li);
      });
    } else {
      throw new Error('No hay jugadores en la base de datos');
    }
  } catch (error) {
    console.log('No se pudo cargar desde PHP, usando datos de ejemplo:', error.message);
    // Fallback a datos de ejemplo
    contactosEjemplo.forEach(contacto => {
      const li = document.createElement('li');
      li.className = 'contacto-item';
      li.dataset.contactoId = contacto.id;
      
      const iniciales = contacto.nombre.split(' ').map(n => n[0]).join('');
      const ultimoMensaje = mensajes[contacto.id] ? 
        mensajes[contacto.id][mensajes[contacto.id].length - 1].texto.substring(0, 30) + '...' :
        contacto.ultimoMensaje;
      
      li.innerHTML = `
        <div class="contacto-info">
          <div class="contacto-avatar">${iniciales}</div>
          <div class="contacto-detalles">
            <div class="contacto-nombre">${contacto.nombre}</div>
            <div class="contacto-posicion">#${contacto.numero} - ${contacto.posicion}</div>
            <div class="contacto-estado">
              <div class="${contacto.online ? 'estado-online' : 'estado-offline'}"></div>
              <span class="ultimo-mensaje">${ultimoMensaje}</span>
            </div>
          </div>
        </div>
      `;
      
      li.addEventListener('click', () => seleccionarContacto(contacto));
      lista.appendChild(li);
    });
  }
}

function configurarEventos() {
  const mensajeInput = document.getElementById('mensaje-input');
  const btnEnviar = document.getElementById('btn-enviar');
  const buscarInput = document.getElementById('buscar-contactos');
  
  // Verificar que los elementos existen antes de agregar event listeners
  if (btnEnviar) {
    // Enviar mensaje
    btnEnviar.addEventListener('click', enviarMensaje);
  }
  
  if (mensajeInput) {
    // Enviar con Enter
    mensajeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarMensaje();
      }
    });
    
    // Auto-resize del textarea
    mensajeInput.addEventListener('input', () => {
      mensajeInput.style.height = 'auto';
      mensajeInput.style.height = Math.min(mensajeInput.scrollHeight, 120) + 'px';
      
      // Mostrar indicador de escritura
      mostrarEscribiendo();
    });
  }
  
  if (buscarInput) {
    // Búsqueda de contactos
    buscarInput.addEventListener('input', filtrarContactos);
  }
}

function seleccionarContacto(contacto) {
  contactoActivo = contacto;
  
  // Actualizar UI
  document.querySelectorAll('.contacto-item').forEach(item => {
    item.classList.remove('active');
  });
  
  document.querySelector(`[data-contacto-id="${contacto.id}"]`).classList.add('active');
  
  // Actualizar header del chat
  const chatHeader = document.getElementById('chat-header');
  const iniciales = contacto.nombre.split(' ').map(n => n[0]).join('');
  
  chatHeader.innerHTML = `
    <div class="chat-avatar">${iniciales}</div>
    <div class="chat-info">
      <span id="nombre-contacto">${contacto.nombre}</span>
      <div class="chat-estado">
        <div class="${contacto.online ? 'estado-online' : 'estado-offline'}"></div>
        <span>${contacto.online ? 'En línea' : 'Desconectado'} • #${contacto.numero} - ${contacto.posicion}</span>
      </div>
    </div>
    <div class="chat-acciones">
      <button class="btn-accion" title="Llamar">📞</button>
      <button class="btn-accion" title="Videollamada">📹</button>
      <button class="btn-accion" title="Más opciones">⋮</button>
    </div>
  `;
  
  // Mostrar input y cargar mensajes
  document.getElementById('chat-input').style.display = 'flex';
  document.getElementById('mensaje-input').disabled = false;
  document.getElementById('btn-enviar').disabled = false;
  
  cargarMensajes(contacto.id);
}

async function cargarMensajes(contactoId) {
  const chatMensajes = document.getElementById('chat-mensajes');
  
  try {
    // Intentar cargar mensajes desde PHP
    const res = await fetch('obtener_mensajes.php');
    if (!res.ok) {
      throw new Error('Error al cargar mensajes');
    }
    
    const data = await res.json();
    if (data.success && data.mensajes) {
      // Actualizar mensajes globales con datos de PHP
      mensajes = data.mensajes;
    }
  } catch (error) {
    console.log('No se pudo cargar mensajes desde PHP, usando datos locales:', error.message);
  }
  
  const mensajesContacto = mensajes[contactoId] || [];
  
  if (mensajesContacto.length === 0) {
    chatMensajes.innerHTML = `
      <div class="chat-vacio">
        <div class="chat-vacio-icon">💬</div>
        <h3>No hay mensajes</h3>
        <p>Envía el primer mensaje para comenzar la conversación</p>
      </div>
    `;
    return;
  }
  
  chatMensajes.innerHTML = '';
  
  mensajesContacto.forEach(mensaje => {
    const div = document.createElement('div');
    div.className = `chat-mensaje ${mensaje.tipo}`;
    
    div.innerHTML = `
      ${mensaje.texto}
      <div class="mensaje-hora">${mensaje.hora}</div>
      ${mensaje.tipo === 'saliente' ? `
        <div class="mensaje-estado ${mensaje.visto ? 'mensaje-visto' : ''}">
          ${mensaje.visto ? '✓✓' : '✓'}
        </div>
      ` : ''}
    `;
    
    chatMensajes.appendChild(div);
  });
  
  // Scroll al final
  chatMensajes.scrollTop = chatMensajes.scrollHeight;
  
  // Marcar mensajes como vistos
  await marcarMensajesComoVistos(contactoId);
}

async function enviarMensaje() {
  const input = document.getElementById('mensaje-input');
  const texto = input.value.trim();
  
  if (!texto || !contactoActivo) return;
  
  const nuevoMensaje = {
    id: Date.now(),
    texto: texto,
    tipo: 'saliente',
    hora: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}),
    visto: false
  };
  
  // Agregar mensaje localmente
  if (!mensajes[contactoActivo.id]) {
    mensajes[contactoActivo.id] = [];
  }
  
  mensajes[contactoActivo.id].push(nuevoMensaje);
  
  // Limpiar input
  input.value = '';
  input.style.height = 'auto';
  
  // Intentar guardar en PHP
  try {
    const res = await fetch('guardar_mensaje.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jugador_id: contactoActivo.id,
        mensaje: texto,
        tipo: 'saliente'
      })
    });
    
    if (!res.ok) {
      throw new Error('Error al guardar mensaje');
    }
    
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Error desconocido');
    }
  } catch (error) {
    console.log('No se pudo guardar mensaje en PHP:', error.message);
    // Continuar con funcionalidad local
  }
  
  // Recargar mensajes
  await cargarMensajes(contactoActivo.id);
  
  // Actualizar lista de contactos
  await cargarContactos();
  
  // Simular respuesta automática después de 2-5 segundos
  setTimeout(() => {
    simularRespuestaAutomatica();
  }, Math.random() * 3000 + 2000);
  
  // Mostrar notificación
  mostrarNotificacion('Mensaje enviado', 'success');
}

function simularRespuestaAutomatica() {
  if (!contactoActivo) return;
  
  const respuestasAleatorias = [
    "¡Perfecto, DT!",
    "Entendido 👍",
    "¡Vamos equipo! ⚽",
    "Gracias por la información",
    "Nos vemos en el entrenamiento",
    "¡Dale que podemos! 💪",
    "Perfecto, ahí estaré",
    "¡A ganar! 🏆"
  ];
  
  const respuesta = respuestasAleatorias[Math.floor(Math.random() * respuestasAleatorias.length)];
  
  const mensajeRespuesta = {
    id: Date.now(),
    texto: respuesta,
    tipo: 'entrante',
    hora: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}),
    visto: true
  };
  
  mensajes[contactoActivo.id].push(mensajeRespuesta);
  
  // Recargar si el contacto sigue activo
  if (contactoActivo) {
    cargarMensajes(contactoActivo.id);
    cargarContactos();
    
    // Mostrar notificación
    mostrarNotificacion(`Nuevo mensaje de ${contactoActivo.nombre}`, 'info');
  }
}

function mostrarEscribiendo() {
  if (!contactoActivo) return;
  
  // Limpiar timeout anterior
  clearTimeout(escribiendoTimeout);
  
  // Mostrar indicador
  const chatMensajes = document.getElementById('chat-mensajes');
  let indicadorEscribiendo = document.getElementById('indicador-escribiendo');
  
  if (!indicadorEscribiendo) {
    indicadorEscribiendo = document.createElement('div');
    indicadorEscribiendo.id = 'indicador-escribiendo';
    indicadorEscribiendo.className = 'escribiendo';
    indicadorEscribiendo.innerHTML = `
      Escribiendo
      <div class="escribiendo-puntos">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    chatMensajes.appendChild(indicadorEscribiendo);
  }
  
  // Ocultar después de 2 segundos
  escribiendoTimeout = setTimeout(() => {
    if (indicadorEscribiendo) {
      indicadorEscribiendo.remove();
    }
  }, 2000);
}

function filtrarContactos() {
  const termino = document.getElementById('buscar-contactos').value.toLowerCase();
  const contactos = document.querySelectorAll('.contacto-item');
  
  contactos.forEach(contacto => {
    const nombre = contacto.querySelector('.contacto-nombre').textContent.toLowerCase();
    const posicion = contacto.querySelector('.contacto-posicion').textContent.toLowerCase();
    
    if (nombre.includes(termino) || posicion.includes(termino)) {
      contacto.style.display = 'block';
    } else {
      contacto.style.display = 'none';
    }
  });
}

async function marcarMensajesComoVistos(contactoId) {
  // Marcar localmente
  if (mensajes[contactoId]) {
    mensajes[contactoId].forEach(mensaje => {
      if (mensaje.tipo === 'entrante') {
        mensaje.visto = true;
      }
    });
  }
  
  // Intentar marcar en PHP
  try {
    const res = await fetch('marcar_mensaje_visto.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jugador_id: contactoId
      })
    });
    
    if (!res.ok) {
      throw new Error('Error al marcar mensajes como vistos');
    }
    
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Error desconocido');
    }
  } catch (error) {
    console.log('No se pudo marcar mensajes como vistos en PHP:', error.message);
    // Continuar con funcionalidad local
  }
}

function mostrarNotificacion(mensaje, tipo = 'success') {
  const notif = document.createElement('div');
  notif.className = 'notificacion-mensaje';
  notif.textContent = mensaje;
  
  if (tipo === 'info') {
    notif.style.background = 'linear-gradient(45deg, #3b82f6, #1d4ed8)';
  }
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Exportar función
window.mostrarMensajes = mostrarMensajes;