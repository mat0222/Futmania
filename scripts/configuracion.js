function renderConfiguracion() {
  const contenido = document.getElementById('contenido');
  contenido.innerHTML = `
    <h2>⚙️ Configuración del Sistema</h2>
    
    <!-- Agregar jugador -->
    <div class="config-section">
      <form id="formAgregarJugador" style="max-width:500px; background:rgba(51, 65, 85, 0.6); padding:2rem; border-radius:16px; color:#ddd; margin: 0 auto;">
        <h3>➕ Agregar Nuevo Jugador</h3>
        <label>🔢 Número de Camiseta:</label><br/>
        <input type="number" id="numero" name="numero" min="1" max="99" required style="width:100%; padding:0.75rem; margin-bottom:1rem; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:8px;" placeholder="Ej: 10" />
              
        <label>👤 Nombre Completo:</label><br/>
        <input type="text" id="nombre" name="nombre" required style="width:100%; padding:0.75rem; margin-bottom:1rem; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:8px;" placeholder="Ej: Lionel Messi" />
              
                 <label>⚽ Posición:</label><br/>
         <select id="posicion" name="posicion" required style="width:100%; padding:0.75rem; margin-bottom:1rem; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:8px;">
           <option value="">🎯 Selecciona una posición</option>
           <option value="arquero">🥅 Arquero</option>
           <option value="defensa">🛡️ Defensa</option>
           <option value="mediocampista">⚡ Mediocampista</option>
           <option value="delantero">🎯 Delantero</option>
         </select>
         
         <label>🎂 Edad:</label><br/>
         <input type="number" id="edad" name="edad" min="15" max="50" style="width:100%; padding:0.75rem; margin-bottom:1rem; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:8px;" placeholder="Ej: 25" />
         
         <label>🌍 Nacionalidad:</label><br/>
         <input type="text" id="nacionalidad" name="nacionalidad" style="width:100%; padding:0.75rem; margin-bottom:1.5rem; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:8px;" placeholder="Ej: Argentina" />
         
         <button type="submit" style="background:linear-gradient(135deg, #3b82f6, #1d4ed8); color:#fff; border:none; padding:0.875rem 2rem; border-radius:10px; cursor:pointer; width:100%; font-weight:600; text-transform:uppercase;">✨ Agregar Jugador</button>
      </form>
      <div id="mensajeConfig" style="margin-top:1rem; font-weight:bold; text-align:center; padding:1rem; border-radius:8px;"></div>
    </div>

    <!-- Importar / Exportar CSV -->
    <div class="config-section">
      <h3>📂 Importar jugadores desde CSV</h3>
      <form id="formImportarCSV" enctype="multipart/form-data" style="background:rgba(51, 65, 85, 0.6); padding:1.5rem; border-radius:12px; display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
        <input type="file" id="csv" name="csv" accept=".csv" required style="flex:1; padding:0.75rem; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(148, 163, 184, 0.3); border-radius:8px; color:#fff;" />
        <button type="submit" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; border:none; padding:0.75rem 1.5rem; border-radius:8px; cursor:pointer; font-weight:600;">📥 Importar</button>
      </form>
      <div id="mensajeImportacion" style="margin-bottom:1.5rem; text-align:center; padding:1rem; border-radius:8px; font-weight:600;"></div>
      
      <h3>📤 Exportar jugadores a CSV</h3>
      <a href="exportar_jugadores.php" style="display:inline-flex; align-items:center; gap:0.5rem; margin-top:1rem; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; padding:0.875rem 2rem; border-radius:10px; text-decoration:none; font-weight:600;">📥 Descargar CSV</a>
    </div>

    <!-- Tabla jugadores -->
    <div class="config-section">
      <h3>✏️ Editar / Borrar jugadores</h3>
      <div class="table-container">
                 <table id="tablaConfigJugadores" style="width:100%; margin-top:1rem; background:rgba(30, 41, 59, 0.8); border-collapse:collapse; border-radius:12px; overflow:hidden;">
           <thead>
           <tr style="background:rgba(51, 65, 85, 0.8); color:#fff;">
           <th style="padding:1rem 0.75rem;">#️⃣</th>
           <th style="padding:1rem 0.75rem;">👤 Nombre</th>
           <th style="padding:1rem 0.75rem;">⚽ Posición</th>
           <th style="padding:1rem 0.75rem;">🎂 Edad</th>
           <th style="padding:1rem 0.75rem;">🌍 Nacionalidad</th>
           <th style="padding:1rem 0.75rem;">🥅 Goles</th>
           <th style="padding:1rem 0.75rem;">🎯 Asistencias</th>
           <th style="padding:1rem 0.75rem;">📊 Partidos</th>
           <th style="padding:1rem 0.75rem;">🏥 Lesiones</th>
           <th style="padding:1rem 0.75rem;">⚙️ Acciones</th>
           </tr>
           </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `;

  const form = document.getElementById('formAgregarJugador');
  const mensaje = document.getElementById('mensajeConfig');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Agregar estado de carga
    form.classList.add('loading');
    mensaje.textContent = '⏳ Agregando jugador...';
    mensaje.style.color = '#60a5fa';
    mensaje.style.background = 'rgba(59, 130, 246, 0.1)';
    
         const data = {
       numero: form.numero.value,
       nombre: form.nombre.value,
       posicion: form.posicion.value,
       edad: form.edad.value,
       nacionalidad: form.nacionalidad.value
     };
    
    try {
      const res = await fetch('agregar_jugador.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      form.classList.remove('loading');
      mensaje.style.color = result.success ? '#10b981' : '#ef4444';
      mensaje.style.background = result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
      mensaje.textContent = result.success ? '✅ ' + result.message : '❌ ' + result.message;
      
      if (result.success) {
        form.reset();
        cargarJugadoresTabla(); // recargar lista
      }
    } catch (error) {
      form.classList.remove('loading');
      mensaje.style.color = '#ef4444';
      mensaje.style.background = 'rgba(239, 68, 68, 0.1)';
      mensaje.textContent = '❌ Error en la comunicación con el servidor.';
    }
  });

  // Importar CSV
  const formImportar = document.getElementById('formImportarCSV');
  const mensajeImport = document.getElementById('mensajeImportacion');
  
  formImportar.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Estado de carga
    formImportar.classList.add('loading');
    mensajeImport.textContent = '⏳ Importando jugadores...';
    mensajeImport.style.color = '#60a5fa';
    mensajeImport.style.background = 'rgba(59, 130, 246, 0.1)';
    
    const formData = new FormData(formImportar);
    
    try {
      const res = await fetch('importar_jugadores.php', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      
      formImportar.classList.remove('loading');
      mensajeImport.style.color = result.success ? '#10b981' : '#ef4444';
      mensajeImport.style.background = result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
      mensajeImport.textContent = result.success ? '✅ ' + result.message : '❌ ' + result.message;
      
      if (result.success) {
        cargarJugadoresTabla();
        formImportar.reset();
      }
    } catch (err) {
      formImportar.classList.remove('loading');
      mensajeImport.style.color = '#ef4444';
      mensajeImport.style.background = 'rgba(239, 68, 68, 0.1)';
      mensajeImport.textContent = '❌ Error en la importación.';
    }
  });

  // Cargar lista
  async function cargarJugadoresTabla() {
    try {
      const res = await fetch('obtener_jugadores.php');
      if (!res.ok) {
        throw new Error('Error al cargar jugadores');
      }
      
      const data = await res.json();
      const tbody = document.querySelector('#tablaConfigJugadores tbody');
      tbody.innerHTML = '';
      
      // Handle both old and new response formats
      let jugadores = [];
      if (data.success && data.jugadores && Array.isArray(data.jugadores)) {
        jugadores = data.jugadores;
      } else if (Array.isArray(data)) {
        jugadores = data;
      } else {
        console.error('Invalid data format:', data);
        throw new Error('Formato de datos inválido');
      }
      
             jugadores.forEach(j => {
         const tr = document.createElement('tr');
         tr.innerHTML = `
         <td><input value="${j.numero}" class="edit-numero" style="width:60px; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:6px; padding:0.5rem;" /></td>
         <td><input value="${j.nombre}" class="edit-nombre" style="width:150px; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:6px; padding:0.5rem;" /></td>
        <td>
        <select class="edit-posicion" style="background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:6px; padding:0.5rem;">
         <option value="arquero" ${j.posicion === 'arquero' ? 'selected' : ''}>🥅 Arquero</option>
         <option value="defensa" ${j.posicion === 'defensa' ? 'selected' : ''}>🛡️ Defensa</option>
         <option value="mediocampista" ${j.posicion === 'mediocampista' ? 'selected' : ''}>⚡ Mediocampista</option>
         <option value="delantero" ${j.posicion === 'delantero' ? 'selected' : ''}>🎯 Delantero</option>
        </select>
        </td>
        <td><input type="number" value="${j.edad || ''}" class="edit-edad" style="width:70px; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:6px; padding:0.5rem;" min="15" max="50" /></td>
        <td><input value="${j.nacionalidad || ''}" class="edit-nacionalidad" style="width:120px; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:6px; padding:0.5rem;" placeholder="Ej: Argentina" /></td>
        <td><input type="number" value="${j.goles || 0}" class="edit-goles" style="width:70px; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:6px; padding:0.5rem;" /></td>
        <td><input type="number" value="${j.asistencias || 0}" class="edit-asistencias" style="width:70px; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:6px; padding:0.5rem;" /></td>
        <td><input type="number" value="${j.partidos || 0}" class="edit-partidos" style="width:70px; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:6px; padding:0.5rem;" /></td>
        <td><input type="number" value="${j.lesiones || 0}" class="edit-lesiones" style="width:70px; background:rgba(15, 23, 42, 0.8); color:#fff; border:1px solid rgba(148, 163, 184, 0.3); border-radius:6px; padding:0.5rem;" /></td>
        <td>
        <button class="btn-guardar" data-id="${j.id}" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; border:none; padding:0.5rem 1rem; border-radius:6px; cursor:pointer; margin-right:0.5rem; font-weight:500;">💾 Guardar</button>
        <button class="btn-borrar" data-id="${j.id}" style="background:linear-gradient(135deg, #ef4444, #dc2626); color:#fff; border:none; padding:0.5rem 1rem; border-radius:6px; cursor:pointer; font-weight:500;">🗑️ Borrar</button>
        </td>`;
        tbody.appendChild(tr);
      });

      // Borrar
      document.querySelectorAll('.btn-borrar').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('🗑️ ¿Estás seguro de que quieres eliminar este jugador?')) {
            btn.textContent = '⏳ Borrando...';
            btn.disabled = true;
            
            await fetch('eliminar_jugador.php', {
              method: 'POST',
              body: new URLSearchParams({ id: btn.dataset.id })
            });
            cargarJugadoresTabla();
          }
        });
      });

      // Guardar edición
      document.querySelectorAll('.btn-guardar').forEach(btn => {
        btn.addEventListener('click', async () => {
          const row = btn.closest('tr');
          const id = btn.dataset.id;
          const numero = row.querySelector('.edit-numero').value;
          const nombre = row.querySelector('.edit-nombre').value;
          const posicion = row.querySelector('.edit-posicion').value;
          const edad = row.querySelector('.edit-edad').value;
          const nacionalidad = row.querySelector('.edit-nacionalidad').value;
          const goles = row.querySelector('.edit-goles').value;
          const asistencias = row.querySelector('.edit-asistencias').value;
          const partidos = row.querySelector('.edit-partidos').value;
          const lesiones = row.querySelector('.edit-lesiones').value;
          
          btn.textContent = '⏳ Guardando...';
          btn.disabled = true;
          
          await fetch('editar_jugador.php', {
          method: 'POST',
          body: new URLSearchParams({ id, numero, nombre, posicion, edad, nacionalidad, goles, asistencias, partidos, lesiones })
          });
                  
          cargarJugadoresTabla();
        });
      });
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
    }
  }

  cargarJugadoresTabla();
}
