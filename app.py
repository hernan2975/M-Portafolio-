import os
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import re # Importar el módulo re para expresiones regulares

# Cargar variables de entorno desde .env
load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='') # Configura Flask para servir archivos desde la carpeta actual

# --- Configuración del Correo Electrónico desde variables de entorno ---
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
RECIPIENT_EMAIL = os.getenv('RECIPIENT_EMAIL')

if not all([EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, RECIPIENT_EMAIL]):
    print("ADVERTENCIA: Las variables de entorno para el correo no están configuradas correctamente.")
    print("Asegúrate de que EMAIL_HOST_USER, EMAIL_HOST_PASSWORD y RECIPIENT_EMAIL estén en tu archivo .env")

# --- Rutas de la Aplicación ---

@app.route('/')
def serve_index():
    """Sirve la página principal del portafolio (index.html)."""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Sirve otros archivos estáticos (CSS, JS, imágenes)."""
    return send_from_directory('.', path)

@app.route('/submit_form', methods=['POST'])
def submit_form():
    """
    Maneja el envío del formulario de contacto.
    Extrae los datos, construye el email y lo envía.
    """
    if request.method == 'POST':
        try:
            name = request.form.get('name')
            email = request.form.get('email')
            subject = request.form.get('subject')
            message_body = request.form.get('message')

            # Validaciones básicas
            if not all([name, email, subject, message_body]):
                return jsonify({'success': False, 'message': 'Todos los campos del formulario son obligatorios.'}), 400
            
            if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                return jsonify({'success': False, 'message': 'Formato de email inválido.'}), 400

            # --- Construir el Email ---
            msg = MIMEMultipart()
            msg['From'] = EMAIL_HOST_USER
            msg['To'] = RECIPIENT_EMAIL
            msg['Subject'] = f"Mensaje del Portafolio: {subject} (De: {name})"

            html_body = f"""
                <html>
                    <body>
                        <p><strong>De:</strong> {name} &lt;{email}&gt;</p>
                        <p><strong>Asunto:</strong> {subject}</p>
                        <p><strong>Fecha/Hora:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                        <hr>
                        <p><strong>Mensaje:</strong></p>
                        <p>{message_body}</p>
                    </body>
                </html>
            """
            msg.attach(MIMEText(html_body, 'html'))

            # --- Enviar el Email ---
            try:
                # Determinar el servidor SMTP basado en el remitente si no es Gmail
                # Para Gmail, 'smtp.gmail.com' es el estándar.
                smtp_server = 'smtp.gmail.com' 

                with smtplib.SMTP(smtp_server, EMAIL_PORT) as server:
                    if EMAIL_USE_TLS:
                        server.starttls()
                    server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
                    server.send_message(msg)
                    
                print(f"[{datetime.now()}] Mensaje enviado con éxito de {email}")
                return jsonify({'success': True, 'message': '¡Tu mensaje ha sido enviado con éxito! Hernán se pondrá en contacto contigo pronto.'}), 200

            except smtplib.SMTPAuthenticationError:
                print(f"[{datetime.now()}] Error de autenticación SMTP. Revisa tus credenciales en .env.")
                return jsonify({'success': False, 'message': 'Error al enviar el mensaje. Problema de autenticación del servidor de correo.'}), 500
            except Exception as e:
                print(f"[{datetime.now()}] Error inesperado al enviar el mensaje: {e}")
                return jsonify({'success': False, 'message': f'Error inesperado al enviar el mensaje: {e}'}), 500

        except Exception as e:
            print(f"[{datetime.now()}] Error al procesar el formulario: {e}")
            return jsonify({'success': False, 'message': f'Error interno del servidor al procesar el formulario: {e}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
