# app.py (o main.py)
import os
from flask import Flask, render_template, request, redirect, url_for, flash
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Carga las variables de entorno desde el archivo .env
# Asegúrate de tener un archivo .env en la misma carpeta que app.py
# con las variables SECRET_KEY, EMAIL_PASSWORD, etc.
load_dotenv()

app = Flask(__name__)
# La SECRET_KEY es necesaria para que Flask pueda manejar sesiones y mensajes flash.
# Es crucial que sea un valor seguro y aleatorio. Lo obtiene de .env o usa un valor por defecto.
app.secret_key = os.getenv('SECRET_KEY', 'una_clave_secreta_super_segura_y_larga_por_defecto_si_no_esta_en_env')

# --- Configuración de Correo ---
# Tu dirección de correo de Gmail desde la que se enviarán los mensajes.
# Asegúrate de que esta variable esté en tu archivo .env: EMAIL_USER=hernanluislang@gmail.com
EMAIL_USER = os.getenv('EMAIL_USER')

# La contraseña de aplicación para tu cuenta de Gmail.
# NUNCA uses tu contraseña de Gmail aquí directamente.
# Genera una contraseña de aplicación en la configuración de seguridad de tu cuenta de Google.
# Asegúrate de que esta variable esté en tu archivo .env: EMAIL_PASSWORD=tu_contraseña_de_aplicacion
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')

# La dirección de correo a la que quieres recibir los mensajes del formulario.
# En este caso, será tu misma dirección de Gmail.
EMAIL_RECEIVER = "hernanluislang@gmail.com"

# Servidor SMTP de Gmail y puerto
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587 # Puerto estándar para TLS

# --- Rutas de la Aplicación ---

@app.route('/')
def index():
    """
    Renderiza la página principal del portafolio (index.html).
    Asume que index.html está en la carpeta 'templates/'.
    """
    return render_template('index.html')

@app.route('/submit_form', methods=['POST'])
def submit_form():
    """
    Maneja el envío del formulario de contacto desde el frontend.
    """
    if request.method == 'POST':
        # Obtiene los datos del formulario
        name = request.form.get('name')
        email = request.form.get('email')
        subject = request.form.get('subject')
        message = request.form.get('message')

        # Valida que los datos esenciales no estén vacíos
        if not all([name, email, subject, message]):
            flash("Por favor, completa todos los campos del formulario.", "error")
            return redirect(url_for('index') + '#contacto') # Redirige de vuelta a la sección de contacto

        # Verifica que las credenciales de correo estén configuradas
        if not EMAIL_USER or not EMAIL_PASSWORD:
            flash("Error: Las credenciales de envío de correo no están configuradas correctamente en el servidor. Por favor, contacta al administrador.", "error")
            return redirect(url_for('index') + '#contacto')

        # Crea el mensaje de correo
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = EMAIL_RECEIVER
        msg['Subject'] = f"Mensaje de Portafolio: {subject} de {name} ({email})"

        body = f"Nombre: {name}\nEmail: {email}\n\nMensaje:\n{message}"
        msg.attach(MIMEText(body, 'plain'))

        try:
            # Establece la conexión con el servidor SMTP de Gmail
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls() # Habilita Transport Layer Security (TLS) para una conexión segura
            server.login(EMAIL_USER, EMAIL_PASSWORD) # Inicia sesión en tu cuenta de Gmail
            text = msg.as_string() # Convierte el mensaje MIME a string
            server.sendmail(EMAIL_USER, EMAIL_RECEIVER, text) # Envía el correo
            server.quit() # Cierra la conexión

            flash("¡Gracias! Tu mensaje ha sido enviado correctamente.", "success")
        except Exception as e:
            # Captura cualquier error que ocurra durante el envío del correo
            print(f"Error al enviar el correo: {e}") # Para depuración en consola
            flash(f"Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde o contáctame directamente. Error: {e}", "error")

        # Redirige de vuelta a la sección de contacto después de enviar
        return redirect(url_for('index') + '#contacto')

# --- Ejecución de la Aplicación ---
if __name__ == '__main__':
    # Obtiene el modo de depuración de .env. Si no está definido, se asume True.
    debug_mode = os.getenv('DEBUG_MODE', 'True').lower() == 'true'
    # Define el puerto en el que se ejecutará la aplicación.
    port = int(os.getenv('PORT', 5000)) # Puerto por defecto 5000

    app.run(debug=debug_mode, port=port)
