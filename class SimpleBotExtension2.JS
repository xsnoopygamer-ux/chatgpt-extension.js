class CircleBotExtension {
  constructor() {
    this.bots = {};
  }

  getInfo() {
    return {
      id: 'circlebot',
      name: 'Circle Bot',
      blocks: [
        {
          opcode: 'createBot',
          text: 'create bot [name] with role [role]',
          arguments: {
            name: { type: 'string', defaultValue: 'Helper' },
            role: { type: 'string', defaultValue: 'Game Assistant' }
          }
        },
        {
          opcode: 'sendMessage',
          text: 'send message [text] to bot [name]',
          arguments: {
            text: { type: 'string', defaultValue: 'Hello!' },
            name: { type: 'string', defaultValue: 'Helper' }
          }
        },
        {
          opcode: 'lastResponse',
          text: 'last response of bot [name]',
          arguments: {
            name: { type: 'string', defaultValue: 'Helper' }
          },
          output: 'string' // 🔵 esto lo hace circular
        }
      ]
    };
  }

  createBot({ name, role }) {
    this.bots[name] = { role: role, lastResponse: '' };
  }

  sendMessage({ text, name }) {
    const bot = this.bots[name];
    if (!bot) return;
    // Aquí puedes conectar a una API real (ChatGPT, Groq, etc.)
    // Para pruebas, solo guardamos un texto fijo:
    bot.lastResponse = `(${bot.role}) responde: ${text}`;
  }

  lastResponse({ name }) {
    const bot = this.bots[name];
    return bot ? bot.lastResponse : '';
  }
}

Scratch.extensions.register(new CircleBotExtension());
