(function (Scratch) {
    'use strict';

    class GeminiBotExtension {
        constructor() {
            // Aquí guardamos la información de cada bot (personalidad y última respuesta)
            this.bots = {};
            // Clave de API necesaria para conectarse a Gemini
            this.apiKey = '';
        }

        getInfo() {
            return {
                id: 'geminibot',
                name: 'IA Bot Chat',
                color1: '#0F9D58', // Color verde estilo IA
                color2: '#0B8043',
                blocks: [
                    {
                        opcode: 'setApiKey',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Configurar API Key a [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Tu_Clave_Aqui'
                            }
                        }
                    },
                    "---",
                    {
                        opcode: 'setPersonality',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Fijar personalidad del bot [BOT_NAME] a esto [PERSONALITY]',
                        arguments: {
                            BOT_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Boti'
                            },
                            PERSONALITY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Eres una IA relajada y amigable que ayuda en juegos.'
                            }
                        }
                    },
                    {
                        opcode: 'askBot',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Preguntar a [BOT_NAME] esto [QUESTION]',
                        arguments: {
                            BOT_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Boti'
                            },
                            QUESTION: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '¡Hola! ¿Qué puedes hacer?'
                            }
                        }
                    },
                    {
                        opcode: 'getLastResponse',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Última respuesta de [BOT_NAME]',
                        arguments: {
                            BOT_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Boti'
                            }
                        }
                    }
                ]
            };
        }

        setApiKey(args) {
            this.apiKey = args.KEY;
        }

        setPersonality(args) {
            const botName = args.BOT_NAME;
            if (!this.bots[botName]) {
                this.bots[botName] = { personality: '', lastResponse: '' };
            }
            this.bots[botName].personality = args.PERSONALITY;
        }

        // Esta función usa 'async' para que el bloque espere hasta que la IA responda
        async askBot(args) {
            const botName = args.BOT_NAME;
            const question = args.QUESTION;

            // Inicializar el bot si no existe
            if (!this.bots[botName]) {
                this.bots[botName] = { personality: '', lastResponse: '' };
            }

            if (!this.apiKey || this.apiKey === 'Tu_Clave_Aqui') {
                this.bots[botName].lastResponse = "Error: Faltó poner la API Key de Gemini.";
                return;
            }

            const personalityInstruction = this.bots[botName].personality;

            // Estructura de la petición para Gemini 1.5 Flash
            const requestBody = {
                contents: [{
                    role: "user",
                    parts: [{ text: question }]
                }]
            };

            // Añadir la personalidad si se configuró alguna
            if (personalityInstruction && personalityInstruction.trim() !== '') {
                requestBody.systemInstruction = {
                    parts: [{ text: personalityInstruction }]
                };
            }

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();
                
                if (data.candidates && data.candidates.length > 0) {
                    this.bots[botName].lastResponse = data.candidates[0].content.parts[0].text;
                } else if (data.error) {
                    this.bots[botName].lastResponse = "Error de API: " + data.error.message;
                } else {
                    this.bots[botName].lastResponse = "Error desconocido al contactar a la IA.";
                }
            } catch (error) {
                this.bots[botName].lastResponse = "Error de conexión. Revisa el internet o la API Key.";
            }
        }

        getLastResponse(args) {
            const botName = args.BOT_NAME;
            return this.bots[botName] ? this.bots[botName].lastResponse : '';
        }
    }

    Scratch.extensions.register(new GeminiBotExtension());
})(Scratch);