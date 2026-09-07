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

            // Lista de nombres de modelos a probar en orden de compatibilidad
            const modelsToTry = [
                'gemini-1.5-flash-latest',
                'gemini-1.5-flash-001',
                'gemini-1.5-flash-002',
                'gemini-pro'
            ];

            let success = false;

            for (const model of modelsToTry) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
                    
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
                        success = true;
                        break; // Si un modelo responde con éxito, salimos del bucle
                    }
                } catch (e) {
                    // Intenta con el siguiente modelo si falla
                }
            }

            if (!success) {
                this.bots[botName].lastResponse = "Error: Ningún modelo de Gemini respondió. Revisa si tu API Key es válida.";
            }
        }

        getLastResponse(args) {
            const botName = args.BOT_NAME;
            return this.bots[botName] ? this.bots[botName].lastResponse : '';
        }
    }

    Scratch.extensions.register(new GeminiBotExtension());
})(Scratch);