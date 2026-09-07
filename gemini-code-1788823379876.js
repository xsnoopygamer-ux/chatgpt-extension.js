(function (Scratch) {
    'use strict';

    class OfflineBotExtension {
        constructor() {
            this.bots = {};
        }

        getInfo() {
            return {
                id: 'offlinebot',
                name: 'IA Bot Local (Sin API)',
                color1: '#4C97FF',
                color2: '#3373CC',
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
                                defaultValue: 'Eres una IA relajada'
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

        askBot(args) {
            const botName = args.BOT_NAME;
            const input = (args.QUESTION || '').toLowerCase().trim();

            if (!this.bots[botName]) {
                this.bots[botName] = { personality: '', lastResponse: '' };
            }

            const isRelaxed = (this.bots[botName].personality || '').toLowerCase().includes('relajada');

            // Sistema de respuestas offline basado en palabras clave
            if (input.includes('hola') || input.includes('buenas') || input.includes('que tal')) {
                this.bots[botName].lastResponse = isRelaxed 
                    ? "¡Hola! Todo tranquilo por aquí. ¿En qué te ayudo?" 
                    : "¡Hola! Estoy listo para responder tu consulta.";
            } 
            else if (input.includes('como estas') || input.includes('cómo estás')) {
                this.bots[botName].lastResponse = isRelaxed 
                    ? "Relax total, procesando datos sin estrés. ¿Tú qué tal?" 
                    : "Funcionando al 100% de mi capacidad.";
            } 
            else if (input.includes('quien eres') || input.includes('quién eres') || input.includes('nombre')) {
                this.bots[botName].lastResponse = `Soy ${botName}, tu asistente virtual en PenguinMod.`;
            } 
            else if (input.includes('juego') || input.includes('jugar') || input.includes('ayuda')) {
                this.bots[botName].lastResponse = isRelaxed 
                    ? "¡Claro! Dime qué necesitas para tu juego y le buscamos solución." 
                    : "Dime la instrucción de tu juego y la procesaré.";
            } 
            else if (input.includes('adios') || input.includes('chao') || input.includes('hasta luego')) {
                this.bots[botName].lastResponse = isRelaxed 
                    ? "Nos vemos, cuídate." 
                    : "Hasta luego. Sesión finalizada.";
            } 
            else {
                // Respuesta por defecto cuando no reconoce la frase
                this.bots[botName].lastResponse = isRelaxed 
                    ? "Mmm no entendí muy bien eso, pero suena interesante. ¿Me lo dices de otra forma?" 
                    : "Instrucción no reconocida en mi base de datos local.";
            }
        }

        getLastResponse(args) {
            const botName = args.BOT_NAME;
            return this.bots[botName] ? this.bots[botName].lastResponse : '';
        }
    }

    Scratch.extensions.register(new OfflineBotExtension());
})(Scratch);