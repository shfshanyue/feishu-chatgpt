# 三分钟搭建飞书机器人

三分钟，将 ChatGPT 飞书机器人部署到 vercel，并同时支持多个应用，可一次性添加多个机器人。

以下是飞书机器人后台管理平台，可快速添加多个机器人应用，并使得企业管理员更好地管理。（后台管理源码尚未开源）

![](https://static.shanyue.tech/images/23-04-03/clipboard-4646.c8fcac.webp)

## 特性

+ 负载均衡：多个 Token 增强其稳定性
+ 多机器人：可同时配置多个飞书机器人
+ 场景模式：可通过 PROMPT 配置机器人为专业的翻译、面试官、医生等
+ 反向代理：为不同地区提供更快的 OpenAI 的代理 API 地址

### 待做

+ 群聊控制：可通过正则表达式根据群聊名称控制在哪个群开启机器人
+ 私聊控制：可通过正则表达式根据私聊微信昵称控制开启机器人
+ 支持日志：可查看每天多少条记录

## 配置与环境变量

编辑 `./config.ts` 配置文件。

``` ts
export default {
  // 可配置多个飞书机器人
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
  },

  baseURL: process.env.BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.OPEN_API_KEY.split(','),
  model: process.env.GPT_MODEL || 'gpt-3.5-turbo',

  // // 判断在哪里开启机器人，默认是私聊以及艾特机器人的群聊
  // // 是否开启群聊模式，可使用正则以及 boolen，如果是正则用以决定在那些群开启群聊
  // enableGroup: /^(技术交流群|面试直通车|学习)$/,
  // // enableGroup: true,

  // // 是否开启私聊模式，可使用正则以及 boolen，如果是正则用以决定与谁私聊
  // // enablePrivate: true,
  // enablePrivate: /(山月)/,
}
```

对于 OpenAI 的 `key` 及国内代理 BaseURL 等敏感数据，可以置于环境变量中，编辑 `.env` 配置文件。

``` .env
OPEN_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxybnC"
```

其中，`OPEN_API_KEY` 支持多个 `key` 负载均衡，在环境变量中使用 `,` 隔开

``` .env
OPEN_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxybnC,k-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxybnC,k-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxybnC"
```

## 步骤

1. 编辑环境变量

``` bash
$ cp .example.env .env
```

并编辑以下环境变量。**注意，如果你在国内服务器部署，必须配置 `BASE_URL` 环境变量，其为 OpenAI 在国内的代理 API，需自行搭建**。

``` bash
# 如果部署在 vercel 等境外服务器，则不需要此项配置
# 如果部署在境内，可以使用山月的临时代理 API，不过强烈建议自行搭建
BASE_URL="https://ai.devtool.tech/proxy"
OPEN_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 并配置你 config.ts 中 config.app 对应的环境变量
SHANYUE_GPT_APP_ID="xxx"
SHANYUE_GPT_APP_SECRET="xxx"
```

2. 配置多个飞书机器人应用

编辑 `./config.ts`，配置多个飞书机器人应用。

``` js
export default {
  // 可配置多个飞书机器人
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
}
```

3. 将其部署到 vercel

``` bash
$ npx vercel deploy --prod
```

4. 配置飞书应用域名 

可参考飞书文档：

1. [事件订阅指南](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)

配置飞书中的**事件订阅**的请求地址，其为以下形式，需要根据你们的配置自行填写：

+ `xxx.vercel.app`：你在 vercel 部署的生产环境的地址
+ `api/webhook`：webhook 统一出口
+ `shanyue-gpt`：在 `./config.ts` 中配置的飞书应用的前缀

``` bash
https://xxx.vercel.app/api/webhook/shanyue-gpt
```

5. 开始与机器人聊天

<img src="https://static.shanyue.tech/images/23-04-02/clipboard-3293.749782.webp" width="300">

## 交流

<img src="https://static.shanyue.tech/images/23-04-02/wechat.892011.webp" width="600">

