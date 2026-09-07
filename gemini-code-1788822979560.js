(function (Scratch) {
    'use strict';

    class ChatGPTBotExtension {
        constructor() {
            this.bots = {};
            this.apiKey = '';
        }

        getInfo() {
            return {
                id: 'chatgptbot',
                name: 'ChatGPT Bot',
                color1: '#10A37F', // Color verde característico de OpenAI
                color2: '#1A7F64',
                blocks: [
                    {
                        opcode: 'setApiKey',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Configurar API Key a [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'sk-proj-tu_clave_aqui'
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

            if (!this.apiKey || this.apiKey.includes('tu_clave_aqui')) {
                this.bots[botName].lastResponse = "Error: Faltó poner la API Key de OpenAI.";
                return;
            }

            const personalityInstruction = this.bots[botName].personality;

            // Estructura oficial de mensajes de OpenAI
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
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini", // Modelo súper rápido e ideal para proyectos de Scratch/PenguinMod
                        messages: messages,
                        max_tokens: 300
                    })
                });

                const data = await response.json();

                if (data.choices && data.choices.length > 0) {
                    this.bots[botName].lastResponse = data.choices[0].message.content.trim();
                } else if (data.error) {
                    this.bots[botName].lastResponse = "Error de OpenAI: " + data.error.message;
                } else {
                    this.bots[botName].lastResponse = "Error al recibir la respuesta de ChatGPT.";
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

    Scratch.extensions.register(new ChatGPTBotExtension());
})(Scratch);