(function (Scratch) {
    'use strict';

    class GeminiBotExtension {
        constructor() {
            this.bots = {};
            this.apiKey = '';
        }

        getInfo() {
            return {
                id: 'geminibot',
                name: 'IA Bot Chat',
                color1: '#0F9D58',
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
                                defaultValue: '¡Hola!'
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
            this.apiKey = args.KEY ? args.KEY.trim() : '';
        }

        setPersonality(args) {
            const botName = args.BOT_NAME;
            if (!this.bots[botName]) {
                this.bots[botName] = { personality: '', lastResponse: '' };
            }
            this.bots[botName].personality = args.PERSONALITY;
        }

        async askBot(args) {
            const botName = args.BOT_NAME;
            const question = args.QUESTION;

            if (!this.bots[botName]) {
                this.bots[botName] = { personality: '', lastResponse: '' };
            }

            if (!this.apiKey || this.apiKey === 'Tu_Clave_Aqui') {
                this.bots[botName].lastResponse = "Error: Faltó poner la API Key.";
                return;
            }

            const personalityInstruction = this.bots[botName].personality;

            const requestBody = {
                contents: [{
                    role: "user",
                    parts: [{ text: question }]
                }]
            };

            if (personalityInstruction && personalityInstruction.trim() !== '') {
                requestBody.systemInstruction = {
                    parts: [{ text: personalityInstruction }]
                };
            }

            try {
                // Usamos gemini-2.0-flash directamente en la API v1beta
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
                
                const response = await fetch(url, {
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
                    this.bots[botName].lastResponse = "Sin respuesta del modelo.";
                }
            } catch (error) {
                this.bots[botName].lastResponse = "Error de red: " + error.message;
            }
        }

        getLastResponse(args) {
            const botName = args.BOT_NAME;
            return this.bots[botName] ? this.bots[botName].lastResponse : '';
        }
    }

    Scratch.extensions.register(new GeminiBotExtension());
})(Scratch);