const links = {
  jugadores: document.getElementById('link-jugadores'),
  equipos: document.getElementById('link-equipos'),
  calendario: document.getElementById('link-calendario'),
  tacticas: document.getElementById('link-tacticas'),
  notas: document.getElementById('link-notas'),
  estadisticas: document.getElementById('link-estadisticas'),
  mensajes: document.getElementById('link-mensajes'),
  transferencias: document.getElementById('link-transferencias'),
  configuracion: document.getElementById('link-configuracion')
  
};

const contenido = document.getElementById('contenido');

function mostrarContenido(seccion) {
  

  // Limpiar clases activas
  Object.values(links).forEach(link => link.classList.remove('active'));

  // Activar link actual
  links[seccion].classList.add('active');

  // Cargar sección específica
  if (seccion === "tacticas") {
  mostrarTacticas(contenido);
  return;
  }


  if (seccion === "calendario") {
    mostrarCalendario(contenido);
    return;
  }

  if (seccion === "notas") {
    mostrarNotas(contenido);
    return;
  }

  if (seccion === "estadisticas") {
  mostrarEstadisticas(contenido);
  return;
}


if (seccion === "mensajes") {
  mostrarMensajes(contenido);
  return;
}

if (seccion === "equipos") {
  mostrarEquipos(contenido);
  return;
}

if (seccion === "jugadores") {
  mostrarListaJugadores(); // nueva función que hace todo
  return;
}


if (seccion === "transferencias") {
    renderTransferencias();
    return;
  }

  if (seccion === "configuracion") {
  renderConfiguracion();
  return;
}


  const titulos = {
    jugadores: "Jugadores",
    equipos: "Equipos",
    calendario: "Calendario",
    tacticas: "Tácticas",
    notas: "Notas del DT",
    estadisticas: "Estadísticas",
    mensajes: "Mensajes",
    configuracion: "Configuración",
    transferencias: "Transferencias"
  };

  contenido.innerHTML = `
    <h2>${titulos[seccion]}</h2>
    <p>Sección ${titulos[seccion]} del manager.</p>
  `;
}

Object.entries(links).forEach(([key, link]) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    mostrarContenido(key);
  });
});
