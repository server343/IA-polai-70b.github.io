import express from 'express';
import { HfInference } from '@huggingface/inference';

const app = express();
const hf = new HfInference('tu_token_de_acceso');
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Chat con Hugging Face</title>
        <style>
            html, body {
                height: 100%;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #f0f0f0; /* Fondo ligeramente gris */
            }

            #chat-container {
                display: flex;
                flex-direction: column;
                height: 100vh; /* Altura completa de la ventana del navegador */
                width: 100vw; /* Ancho completo de la ventana del navegador */
                background-color: #fff; /* Fondo blanco para el contenedor del chat */
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Sombra suave */
            }

            #chat-box {
                flex-grow: 1;
                overflow-y: auto;
                padding: 20px;
                border-bottom: 1px solid #ccc; /* Borde entre los mensajes y el input */
            }

            #input-container {
                display: flex;
                padding: 10px;
            }

            #chat-input {
                flex: 1;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 10px;
                margin-right: 10px;
            }

            #send-btn {
                width: 50px;
                height: 50px;
                background-color: #007BFF;
                border: none;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }

            .plane-icon {
                width: 20px;
                height: 20px;
                background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23ffffff" viewBox="0 0 24 24"><path d="M2.6 13.083L22 3l-7.4 11.6L8 13l-5.4 11 2.8-10.4L2.6 13.083z"/></svg>');
                background-size: cover;
            }

            #send-btn:focus {
                outline: none;
            }

            #send-btn:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <div id="chat-container">
            <div id="chat-box"></div>
            <div id="input-container">
                <input type="text" id="chat-input" placeholder="Escribe un mensaje...">
                <button id="send-btn">
                    <div class="plane-icon"></div>
                </button>
            </div>
        </div>
        <script>
            document.getElementById('send-btn').addEventListener('click', function() {
                var input = document.getElementById('chat-input');
                var message = input.value.trim();
                if (message !== '') {
                    var chatBox = document.getElementById('chat-box');
                    var userMessage = document.createElement('div');
                    userMessage.textContent = "Tú: " + message;
                    chatBox.appendChild(userMessage);
                    input.value = '';
                    fetch('/generate-text', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({text: message})
                    })
                    .then(response => response.json())
                    .then(data => {
                        var aiMessage = document.createElement('div');
                        aiMessage.textContent = "AI: " + data.text;
                        chatBox.appendChild(aiMessage);
                    })
                    .catch(error => console.error('Error:', error));
                }
            });
        </script>
    </body>
    </html>
    `);
});

app.post('/generate-text', async (req, res) => {
    const inputText = req.body.text;
    try {
        const response = await hf.textGeneration({
            model: 'meta-llama/Meta-Llama-3-7B-Instruct',
            inputs: inputText
        });
        res.json({ text: response.generated_text });
    } catch ( error ) {
        res.status(500).json({ error: 'Failed to generate text' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
