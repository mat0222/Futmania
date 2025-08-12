document.addEventListener('DOMContentLoaded', () => {
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const carta = document.getElementById('carta-fifa');
  const nombreCarta = document.getElementById('carta-nombre');
  

  btnLogin.addEventListener('click', () => {
    btnLogin.classList.add('active');
    btnRegister.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  });

  btnRegister.addEventListener('click', () => {
    btnRegister.classList.add('active');
    btnLogin.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  });

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario-login').value;
    const clave = document.getElementById('clave-login').value;

    const res = await fetch('login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ usuario, clave })
    });

    const data = await res.json();
    alert(data.message);
    if (data.success) {
      // Mostrar carta
      nombreCarta.textContent = data.message.replace('Bienvenido, ', '');
      carta.classList.remove('oculto');
      carta.classList.add('mostrar');

      // Sonido
      sonidoEstadio.play();

      // Redirigir luego de 3s
      setTimeout(() => {
        window.location.href = 'http://localhost/fulbito/inicio.html';
      }, 3000);
    }
  });

  // Registro
  registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usuario = document.getElementById('usuario-register').value;
  const clave = document.getElementById('clave-register').value;

  const res = await fetch('registro.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ usuario, clave })
  });

  const data = await res.json();
  alert(data.message);
  if (data.success) registerForm.reset();
  });

});

