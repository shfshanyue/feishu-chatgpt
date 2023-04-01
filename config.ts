export default {
  // TODO: 可置于数据库中
  app: {
    'shanyue-gpt': {
      appId: process.env.SHANYUE_GPT_APP_ID,
      appSecret: process.env.SHANYUE_GPT_APP_SECRET,
    },
    'shanyue-sql': {
      appId: process.env.SHANYUE_SQL_APP_ID,
      appSecret: process.env.SHANYUE_SQL_APP_SECRET,
    },
  }
}
