export default {
  // TODO: 可置于数据库中
  app: {
    'shanyue-gpt': {
      // 与飞书机器人上的名称保持一致
      name: '翻译润色',

      appId: process.env.SHANYUE_GPT_APP_ID,
      appSecret: process.env.SHANYUE_GPT_APP_SECRET,
      prompt: '将我输入的任何语言翻译成中文，如果我输入的是中文则翻译成英文。 '
    },
    'shanyue-sql': {
      // 与飞书机器人上的名称保持一致
      name: 'SQL Pro',

      appId: process.env.SHANYUE_SQL_APP_ID,
      appSecret: process.env.SHANYUE_SQL_APP_SECRET,
      prompt: ''
    },
  },

  baseURL: process.env.BASE_URL || 'https://api.openai.com',
  apiKey: (process.env.OPEN_API_KEY ?? '').split(','),
  model: process.env.GPT_MODEL || 'gpt-3.5-turbo',
}
