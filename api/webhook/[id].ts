import * as lark from '@larksuiteoapi/node-sdk'
import { VercelRequest, VercelResponse } from '@vercel/node'

import config from '../../config'

function createLarkClient(appId: string, appSecret: string) {
  // TODO: cache
  return new lark.Client({
    appId,
    appSecret,
  })
}

// TODO: 由于 @larksuiteoapi/node-sdk 中包含 fs 模块，暂时使用 edge function，有时间拆 sdk 换成 serverless function
export default async function webhook(
  request: VercelRequest,
  response: VercelResponse
) {
  const { id } = request.query
  const data = request.body

  const app = config.app[id as string]

  if (!app) {
    return response.status(404).send(`App ${app} Not Found`)
  }

  const client = createLarkClient(app.appId, app.appSecret)

  // TODO: 进行了两次 AES 的解密，需优化
  const { isChallenge, challenge } = lark.generateChallenge(data, {
    encryptKey: '',
  })
  if (isChallenge) {
    return challenge
  }

  const dispatcher = new lark.EventDispatcher({
    encryptKey: 'encryptKey',
    verificationToken: '',
  }).register({
    'im.message.receive_v1': async (data) => {
      const open_chat_id = data.message.chat_id

      const res = await client.im.message.create({
        params: {
          receive_id_type: 'chat_id',
        },
        data: {
          receive_id: open_chat_id,
          content: JSON.stringify({ text: 'hello world' }),
          msg_type: 'text',
        },
      })

      return res
    },
  })

  const result = await dispatcher.invoke(data)
  return response.json(result)
}
