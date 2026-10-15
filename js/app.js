/**
 * NEXUS ARENA 2026 - eSports Tournament
 * Client-side Controller & AWS Serverless Integration
 */

// Global configuration: in Bloque 03 we will set the live API Gateway endpoint here
const CONFIG = {
    // API_URL will be populated with the AWS API Gateway endpoint (e.g. https://xxxxxx.execute-api.us-east-1.amazonaws.com/prod/registro)
    API_URL: window.API_GATEWAY_URL || ""
};

document.addEventListener("DOMContentLoaded", () => {
    initForm();
    initSmoothScroll();
});

/**
 * Handle registration form validation and submission
 */
function initForm() {
    const form = document.getElementById("form-registro");
    const inputNombre = document.getElementById("nombre");
    const inputEmail = document.getElementById("email");
    const btnSubmit = document.getElementById("btn-enviar");
    const btnText = btnSubmit.querySelector(".btn-text");
    const btnSpinner = document.getElementById("btn-spinner");
    const errorNombre = document.getElementById("error-nombre");
    const errorEmail = document.getElementById("error-email");
    const feedbackBox = document.getElementById("form-feedback");
    const feedbackIcon = document.getElementById("feedback-icon");
    const feedbackText = document.getElementById("feedback-text");

    if (!form) return;

    // Real-time validation clear on input
    inputNombre.addEventListener("input", () => {
        inputNombre.classList.remove("is-invalid");
        errorNombre.textContent = "";
    });

    inputEmail.addEventListener("input", () => {
        inputEmail.classList.remove("is-invalid");
        errorEmail.textContent = "";
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Clear previous state
        clearFeedback();
        let isValid = true;

        const nombre = inputNombre.value.trim();
        const email = inputEmail.value.trim();

        // Validate Nombre
        if (!nombre || nombre.length < 2) {
            inputNombre.classList.add("is-invalid");
            errorNombre.textContent = "Por favor introduce un nombre o gamertag válido (mínimo 2 caracteres).";
            isValid = false;
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            inputEmail.classList.add("is-invalid");
            errorEmail.textContent = "Por favor introduce un correo electrónico válido.";
            isValid = false;
        }

        if (!isValid) return;

        // Payload
        const payload = {
            nombre: nombre,
            email: email,
            timestamp: new Date().toISOString()
        };

        // UI Loading state
        setLoading(true);

        try {
            if (CONFIG.API_URL && CONFIG.API_URL.startsWith("http")) {
                // Live AWS API Gateway POST
                const response = await fetch(CONFIG.API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || `Error del servidor (${response.status})`);
                }

                const result = await response.json().catch(() => ({}));
                showFeedback("success", `¡Inscripción confirmada! Te hemos registrado en NEXUS ARENA 2026. Revisa tu correo (${email}).`);
                form.reset();
            } else {
                // Local simulation mode before API Gateway deployment (Bloque 02)
                await new Promise((resolve) => setTimeout(resolve, 800));
                console.log("[NEXUS ARENA] Datos listos para AWS Serverless:", payload);
                showFeedback(
                    "success", 
                    `¡Inscripción registrada en modo local! Jugador: ${nombre} (${email}). Conectaremos API Gateway en el siguiente bloque.`
                );
                form.reset();
            }
        } catch (error) {
            console.error("[NEXUS ARENA] Error en envío:", error);
            showFeedback("error", `Hubo un error al procesar la inscripción: ${error.message}`);
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        btnSubmit.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = "none";
            btnSpinner.style.display = "inline-block";
        } else {
            btnText.style.display = "inline-block";
            btnSpinner.style.display = "none";
        }
    }

    function showFeedback(type, message) {
        feedbackBox.className = `form-feedback ${type}`;
        feedbackIcon.textContent = type === "success" ? "✓" : "⚠️";
        feedbackText.textContent = message;
        feedbackBox.style.display = "flex";
    }

    function clearFeedback() {
        feedbackBox.style.display = "none";
        feedbackBox.className = "form-feedback";
        feedbackText.textContent = "";
    }
}

/**
 * Smooth scrolling for navigation links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
}
