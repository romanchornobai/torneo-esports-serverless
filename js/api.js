// TU endpoint real de API Gateway.
const API_URL = 'https://99mr1udul5.execute-api.us-east-1.amazonaws.com/dev/contact';

document.addEventListener('DOMContentLoaded', () => {
  // Soporta tanto la clase del cuaderno como el id del Torneo de eSports
  const form = document.querySelector('.ebook-download-form') || document.getElementById('form-registro');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    // Evitamos la recarga normal del formulario.
    event.preventDefault();

    // Leemos los valores del DOM de forma robusta
    const inputName = document.getElementById('ebook-form-name') || document.getElementById('nombre');
    const inputEmail = document.getElementById('ebook-email') || document.getElementById('email');

    const name = (inputName ? inputName.value : '').trim();
    const email = (inputEmail ? inputEmail.value : '').trim();

    // El payload envía tanto name como nombre para máxima compatibilidad
    const payload = { name, email, nombre: name };
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
        feedbackText.textContent = `${result.message} (${name})!`;
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
