// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Usa el puerto de entorno o 3000 por defecto

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sirve archivos estáticos desde la carpeta actual (donde está index.html, style.css, etc.)
app.use(express.static(path.join(__dirname)));
// También sirve la carpeta 'documentos' para los PDFs
app.use('/documentos', express.static(path.join(__dirname, 'documentos')));

// Configuración del transporter de Nodemailer
// Usaremos Gmail como ejemplo, pero puedes configurar cualquier servicio SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Tu correo configurado en .env
        pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación/generada en .env
    }
});

// Ruta para manejar el envío del formulario
app.post('/submit_form', (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).send('Todos los campos son obligatorios.');
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,    // Quien envía el correo
        to: process.env.EMAIL_USER,      // A dónde quieres recibir los correos del formulario
        subject: `Mensaje del portafolio: ${subject}`,
        html: `
            <p><strong>De:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Asunto:</strong> ${subject}</p>
            <p><strong>Mensaje:</strong><br>${message}</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo:', error);
            // Podrías redirigir a una página de error o mostrar un mensaje en el mismo formulario
            return res.status(500).send('Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.');
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

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
