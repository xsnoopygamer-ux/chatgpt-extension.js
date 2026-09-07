(function (Scratch) {
    'use strict';

    class FreeAIBotExtension {
        constructor() {
            this.bots = {};
        }

        getInfo() {
            return {
                id: 'freeaibot',
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
            const prompt = `Instrucciones: ${personality}\nPregunta: ${question}`;

            // Dirección usando proxy para evitar bloqueos de red en navegadores
            const targetUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

            try {
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const text = await response.text();
                    this.bots[botName].lastResponse = text.trim();
                } else {
                    // Intento de respaldo directo si falla el proxy
                    const directResponse = await fetch(targetUrl);
                    if (directResponse.ok) {
                        const directText = await directResponse.text();
                        this.bots[botName].lastResponse = directText.trim();
                    } else {
                        this.bots[botName].lastResponse = 'El servidor de IA está ocupado. Intenta de nuevo.';
                    }
                }
            } catch (error) {
                this.bots[botName].lastResponse = 'Error de conexión: Verifica tu acceso a internet.';
            }
        }

        getLastResponse(args) {
            const botName = args.BOT_NAME;
            return this.bots[botName] ? this.bots[botName].lastResponse : '';
        }
    }

    Scratch.extensions.register(new FreeAIBotExtension());
})(Scratch);