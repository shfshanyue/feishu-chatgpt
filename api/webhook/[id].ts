import * as lark from '@larksuiteoapi/node-sdk'
import LRU from 'lru-cache'
import { VercelRequest, VercelResponse } from '@vercel/node'

import config from '../../config'

export const cache = new LRU({
  max: 1000,
  maxSize: 50000,
  ttl: 1000 * 60 * 60 * 2,
  sizeCalculation(key, value) {
    return typeof value === 'string' ? value.length : 1
  },
})

function createLarkClient(appId: string, appSecret: string) {
  let client = cache[appId]
  if (client) {
    return client
  }
  client = new lark.Client({
    appId,
    appSecret,
  })
  return client
}

// {
//   "schema": "2.0",
//   "header": {
//       "event_id": "5e3702a84e847582be8db7fb73283c02",
//       "event_type": "im.message.receive_v1",
//       "create_time": "1608725989000",
//       "token": "rvaYgkND1GOiu5MM0E1rncYC6PLtF7JV",
//       "app_id": "cli_9f5343c580712544",
//       "tenant_key": "2ca1d211f64f6438"
//   },
//    "event": {
//       "sender": {
//           "sender_id": {
//               "union_id": "on_8ed6aa67826108097d9ee143816345",
//               "user_id": "e33ggbyz",
//               "open_id": "ou_84aad35d084aa403a838cf73ee18467"
//           },
//           "sender_type": "user"
//       },
//       "message": {
//           "message_id": "om_5ce6d572455d361153b7cb51da133945",
//           "root_id": "om_5ce6d572455d361153b7cb5xxfsdfsdfdsf",
//           "parent_id": "om_5ce6d572455d361153b7cb5xxfsdfsdfdsf",
//           "create_time": "1609073151345",
//           "chat_id": "oc_5ce6d572455d361153b7xx51da133945",
//           "chat_type": "group",
//           "message_type": "text",
//           "content": "{"text":"@_user_1 hello"}",
//           "mentions": [
//               {
//                   "key": "@_user_1",
//                   "id": {
//                       "union_id": "on_8ed6aa67826108097d9ee143816345",
//                       "user_id": "e33ggbyz",
//                       "open_id": "ou_84aad35d084aa403a838cf73ee18467"
//                   },
//                   "name": "Tom"
//               }
//           ]
//       }
//   }
// }

// TODO: 由于 @larksuiteoapi/node-sdk 中包含 fs 模块，暂时使用 edge function，有时间拆 sdk 换成 serverless function
export default async function webhook(
  request: VercelRequest,
  response: VercelResponse
) {
  const { id } = request.query
  const body = request.body || {}

  const app = config.app[id as string]

  if (!app) {
    return response.status(404).send(`App ${id} Not Found`)
  }

  const client = createLarkClient(app.appId, app.appSecret)

  if (body.challenge) {
    return response.json({ challenge: body.challenge })
  }

  const eventId = body.header.event_id
  if (cache.get(eventId)) {
    return response.json({
      retry: true
    })
  }
  cache.set(eventId, true, {
    // 十小时
    ttl: 10 * 3600 * 1000,
  })

  const message = body.event.message
  const text = JSON.parse(message.content).text

  await client.im.message.create({
    params: {
      receive_id_type: 'chat_id',
    },
    data: {
      receive_id: message.chat_id,
      content: JSON.stringify({ text }),
      msg_type: 'text',
    },
  })
  return response.json({
    done: true,
  })
}
