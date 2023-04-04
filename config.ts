export default {
  // TODO: 可置于数据库中
  app: {
    // key 代表你飞书应用的唯一标识，在下边飞书机器人事件订阅的前缀中会被使用到
    'shanyue-gpt': {
      // 填入每一个飞书机器人应用的 appi_id/app_secret
      appId: process.env.SHANYUE_GPT_APP_ID,
      appSecret: process.env.SHANYUE_GPT_APP_SECRET,
      prompt: ''
    },
    'shanyue-translation': {
      appId: process.env.SHANYUE_TRANSLATION_APP_ID,
      appSecret: process.env.SHANYUE_TRANSLATION_APP_SECRET,
      // 填入 prompt，让每一个飞书机器人都做不同的事儿
      prompt: '以下我输入的语言，如果是任意语言则翻译其为中文，如果为中文则将其翻译为英文：\n'
    },
  },

  baseURL: process.env.BASE_URL || 'https://api.openai.com',
  apiKey: (process.env.OPEN_API_KEY ?? '').split(','),
  model: process.env.GPT_MODEL || 'gpt-3.5-turbo',
}
