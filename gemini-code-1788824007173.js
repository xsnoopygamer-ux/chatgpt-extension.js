(function (Scratch) {
    'use strict';

    class MultiEngineAIBotExtension {
        constructor() {
            this.bots = {};
        }

        getInfo() {
            return {
                id: 'multiengineaibot',
                name: 'IA Bot Chat (Gratis)',
                color1: '#0F9D58',
                color2: '#0B8043',
                blocks: [
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

            this.bots[botName].lastResponse = 'Pensando...';

            const personality = this.bots[botName].personality || 'Eres una IA relajada.';
            const prompt = `Instrucciones de personalidad: ${personality}\nPregunta: ${question}`;

            // Intento 1: Servidor de respaldo primario rápido
            try {
                const targetUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=mistral`;
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
                
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const text = await response.text();
                    if (text && text.trim().length > 0 && !text.includes('Internal Server Error')) {
                        this.bots[botName].lastResponse = text.trim();
                        return;
                    }
                }
            } catch (e) {
                // Si falla, pasa al intento 2
            }

            // Intento 2: Servidor alternativo directo
            try {
                const directUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`;
                const directResponse = await fetch(directUrl);
                
                if (directResponse.ok) {
                    const directText = await directResponse.text();
                    if (directText && directText.trim().length > 0) {
                        this.bots[botName].lastResponse = directText.trim();
                        return;
                    }
                }
            } catch (e) {
                // Si falla, muestra el error final
            }

            this.bots[botName].lastResponse = 'Los servidores están saturados en este momento. Intenta preguntar de nuevo en un momento.';
        }

        getLastResponse(args) {
            const botName = args.BOT_NAME;
            return this.bots[botName] ? this.bots[botName].lastResponse : '';
        }
    }

    Scratch.extensions.register(new MultiEngineAIBotExtension());
})(Scratch);