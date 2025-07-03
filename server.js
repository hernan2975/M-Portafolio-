// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Usa el puerto de entorno o 3000 por defecto

// --- Middleware para el Servidor ---
// Middleware para parsear JSON (para solicitudes con body JSON)
app.use(express.json());
// Middleware para parsear datos de formularios URL-encoded (para formularios HTML)
app.use(express.urlencoded({ extended: true }));

// Sirve archivos estáticos desde la carpeta actual (donde está index.html, style.css, etc.)
app.use(express.static(path.join(__dirname)));
// También sirve la carpeta 'documentos' para los PDFs, haciéndola accesible públicamente
app.use('/documentos', express.static(path.join(__dirname, 'documentos')));

// --- Configuración de Nodemailer (para el envío de correos) ---
// Define si la conexión es segura (SSL/TLS directo)
// Para el puerto 587 (STARTTLS), 'secure' debe ser false.
// Para el puerto 465 (SSL/TLS directo), 'secure' debe ser true.
const isSecureConnection = process.env.EMAIL_PORT === '465';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Por ejemplo, 'smtp.gmail.com'
    port: parseInt(process.env.EMAIL_PORT, 10), // Asegúrate de que el puerto sea un número
    secure: isSecureConnection, // true si es 465, false si es 587
    auth: {
        user: process.env.EMAIL_USER, // Tu correo configurado en .env (hernanluislang@gmail.com)
        pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación/generada en .env
    },
    // Opcional: Ignorar errores de certificado TLS si estás en desarrollo
    // No usar en producción a menos que sepas lo que haces y sea absolutamente necesario.
    tls: {
        rejectUnauthorized: false
    }
});

// --- Ruta para manejar el envío del formulario ---
app.post('/submit_form', (req, res) => {
    // Extrae los datos del cuerpo de la solicitud (del formulario)
    const { name, email, subject, message } = req.body;

    // Validación básica de campos
    if (!name || !email || !subject || !message) {
        // Envía una respuesta de error si faltan campos
        return res.status(400).send('Todos los campos del formulario son obligatorios.');
    }

    // Opciones del correo electrónico a enviar
    const mailOptions = {
        from: process.env.EMAIL_USER,    // Quién envía el correo (tu propio email)
        to: process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER, // A dónde quieres recibir los correos del formulario
        subject: `Mensaje del portafolio: ${subject}`, // Asunto del correo
        html: `
            <p><strong>De:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Asunto:</strong> ${subject}</p>
            <p><strong>Mensaje:</strong><br>${message}</p>
        `
    };

    // Envía el correo usando el transporter configurado
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo:', error);
            // Redirige al usuario a una página de error o muestra un mensaje
            return res.status(500).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error al enviar mensaje</title>
                    <link rel="stylesheet" href="style.css">
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            text-align: center;
                            background-color: var(--bg-light);
                            color: var(--text-color);
                            font-family: 'Roboto', sans-serif;
                            flex-direction: column;
                            padding: 20px;
                        }
                        .message-box {
                            background-color: white;
                            padding: 40px;
                            border-radius: 8px;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                            max-width: 500px;
                            width: 100%;
                        }
                        .message-box h1 {
                            color: #e74c3c; /* Rojo para error */
                            font-family: 'Montserrat', sans-serif;
                            font-size: 2.2em;
                            margin-bottom: 20px;
                        }
                        .message-box p {
                            font-size: 1.1em;
                            margin-bottom: 30px;
                        }
                        .message-box .btn-primary {
                            padding: 10px 25px;
                            font-size: 1em;
                        }
                    </style>
                </head>
                <body>
                    <div class="message-box">
                        <h1>¡Hubo un Error!</h1>
                        <p>No se pudo enviar tu mensaje en este momento. Por favor, inténtalo de nuevo más tarde o contáctame directamente por LinkedIn/GitHub.</p>
                        <a href="/" class="btn btn-primary">Volver al Inicio</a>
                    </div>
                </body>
                </html>
            `);
        } else {
            console.log('Correo enviado:', info.response);
            // Redirige al usuario a una página de éxito
            res.status(200).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Mensaje Enviado</title>
                    <link rel="stylesheet" href="style.css">
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            text-align: center;
                            background-color: var(--bg-light);
                            color: var(--text-color);
                            font-family: 'Roboto', sans-serif;
                            flex-direction: column;
                            padding: 20px;
                        }
                        .message-box {
                            background-color: white;
                            padding: 40px;
                            border-radius: 8px;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                            max-width: 500px;
                            width: 100%;
                        }
                        .message-box h1 {
                            color: var(--primary-color);
                            font-family: 'Montserrat', sans-serif;
                            font-size: 2.2em;
                            margin-bottom: 20px;
                        }
                        .message-box p {
                            font-size: 1.1em;
                            margin-bottom: 30px;
                        }
                        .message-box .btn-primary {
                            padding: 10px 25px;
                            font-size: 1em;
                        }
                    </style>
                </head>
                <body>
                    <div class="message-box">
                        <h1>¡Mensaje Enviado con Éxito!</h1>
                        <p>Gracias por contactarme. Me pondré en contacto contigo a la brevedad.</p>
                        <a href="/" class="btn btn-primary">Volver al Inicio</a>
                    </div>
                </body>
                </html>
            `);
        }
    });
});

// --- Inicio del Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
