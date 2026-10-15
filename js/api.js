// TU endpoint real de API Gateway.
const API_URL = 'https://99mr1udul5.execute-api.us-east-1.amazonaws.com/dev/contact';

document.addEventListener('DOMContentLoaded', () => {
  // Soporta tanto la clase del cuaderno como el id del Torneo de eSports
  const form = document.querySelector('.ebook-download-form') || document.getElementById('form-registro');
  if (!form) return;

  const inputName = document.getElementById('ebook-form-name') || document.getElementById('nombre');
  const inputEmail = document.getElementById('ebook-email') || document.getElementById('email');
  const inputInterest = document.getElementById('interest') || document.getElementById('ebook-interest');

  const errorName = document.getElementById('error-nombre');
  const errorEmail = document.getElementById('error-email');
  const errorInterest = document.getElementById('error-interest');

  // Limpiar errores en tiempo real
  if (inputName) inputName.addEventListener('input', () => { inputName.classList.remove('is-invalid'); if (errorName) errorName.textContent = ''; });
  if (inputEmail) inputEmail.addEventListener('input', () => { inputEmail.classList.remove('is-invalid'); if (errorEmail) errorEmail.textContent = ''; });
  if (inputInterest) inputInterest.addEventListener('change', () => { inputInterest.classList.remove('is-invalid'); if (errorInterest) errorInterest.textContent = ''; });

  form.addEventListener('submit', async (event) => {
    // Evitamos la recarga normal del formulario.
    event.preventDefault();

    const name = (inputName ? inputName.value : '').trim();
    const email = (inputEmail ? inputEmail.value : '').trim();
    const interest = (inputInterest ? inputInterest.value : '').trim();

    // Validación cliente
    let isValid = true;
    if (!name) {
      if (inputName) inputName.classList.add('is-invalid');
      if (errorName) errorName.textContent = 'El nombre o gamertag es obligatorio.';
      isValid = false;
    }
    if (!email) {
      if (inputEmail) inputEmail.classList.add('is-invalid');
      if (errorEmail) errorEmail.textContent = 'El correo electrónico es obligatorio.';
      isValid = false;
    }
    if (!interest) {
      if (inputInterest) inputInterest.classList.add('is-invalid');
      if (errorInterest) errorInterest.textContent = 'Por favor selecciona tu disciplina o evento de interés.';
      isValid = false;
    }

    if (!isValid) return;

    // Payload con los 3 campos mínimos de evaluación: name, email, interest
    const payload = {
      name,
      nombre: name,
      email,
      interest,
      message: `Inscripción para disciplina: ${interest}`
    };
    console.log('[API.JS] Enviando payload:', payload);

    // Feedback visual en la interfaz si existe
    const feedbackBox = document.getElementById('form-feedback');
    const feedbackText = document.getElementById('feedback-text');
    const feedbackIcon = document.getElementById('feedback-icon');
    const btnSubmit = document.getElementById('btn-enviar');

    if (btnSubmit) btnSubmit.disabled = true;

    try {
      // Enviamos JSON mediante POST a API Gateway.
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? 'Error al enviar la solicitud');
      }

      console.log('[API.JS] Éxito:', result);

      if (feedbackBox && feedbackText) {
        feedbackBox.className = 'form-feedback success';
        if (feedbackIcon) feedbackIcon.textContent = '✓';
        feedbackText.textContent = `${result.message} (${name} - ${interest})!`;
        feedbackBox.style.display = 'flex';
      } else {
        alert(result.message);
      }

      form.reset();
    } catch (error) {
      console.error('[API.JS] Error API:', error);

      if (feedbackBox && feedbackText) {
        feedbackBox.className = 'form-feedback error';
        if (feedbackIcon) feedbackIcon.textContent = '⚠️';
        feedbackText.textContent = error.message;
        feedbackBox.style.display = 'flex';
      } else {
        alert(error.message);
      }
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
    }
  });
});
