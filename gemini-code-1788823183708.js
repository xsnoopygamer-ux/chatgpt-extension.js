(function (Scratch) {
    'use strict';

    class FreeAIBotExtension {
        constructor() {
            this.bots = {};
            this.apiKey = '';
        }

        getInfo() {
            return {
                id: 'freeaibot',
                name: 'IA Gratis Bot',
                color1: '#F55036',
                color2: '#D03010',
                blocks: [
                    {
                        opcode: 'setApiKey',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Configurar API Key a [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'gsk_tu_clave_gratis'
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
            this.apiKey = args.KEY ? args.KEY.toString().trim() : '';
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

            if (!this.apiKey || this.apiKey.includes('tu_clave_gratis')) {
                this.bots[botName].lastResponse = "Error: Faltó colocar tu API Key de Groq.";
                return;
            }

            const personalityInstruction = this.bots[botName].personality;
            const messages = [];

            if (personalityInstruction && personalityInstruction.trim() !== '') {
                messages.push({
                    role: "system",
                    content: personalityInstruction
                });
            }

            messages.push({
                role: "user",
                content: question
            });

            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: messages,
                        max_tokens: 300
                    })
                });

                const data = await response.json();

                if (data.choices && data.choices.length > 0) {
                    this.bots[botName].lastResponse = data.choices[0].message.content.trim();
                } else if (data.error) {
                    this.bots[botName].lastResponse = "Error de API: " + data.error.message;
                } else {
                    this.bots[botName].lastResponse = "Error inesperado al recibir respuesta.";
                }
            } catch (error) {
                this.bots[botName].lastResponse = "Error de conexión: " + error.message;
            }
        }

        getLastResponse(args) {
            const botName = args.BOT_NAME;
            return this.bots[botName] ? this.bots[botName].lastResponse : '';
        }
    }

    Scratch.extensions.register(new FreeAIBotExtension());
})(Scratch);