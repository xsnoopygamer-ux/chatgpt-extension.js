class ChatGPTExtension {
  getInfo() {
    return {
      id: 'chatgptbot',
      name: 'ChatGPT Bot',
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
          output: 'string'
        }
      ]
    };
  }

  constructor() {
    this.bots = {};
  }

  createBot({ name, role }) {
    this.bots[name] = { role: role, lastResponse: '' };
  }

  async sendMessage({ text, name }) {
    const bot = this.bots[name];
    if (!bot) return;

    // Llama a la API de OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer TU_API_KEY_AQUI"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: bot.role },
          { role: "user", content: text }
        ]
      })
    });

    const data = await response.json();
    bot.lastResponse = data.choices[0].message.content;
  }

  lastResponse({ name }) {
    const bot = this.bots[name];
    return bot ? bot.lastResponse : '';
  }
}

Scratch.extensions.register(new ChatGPTExtension());
