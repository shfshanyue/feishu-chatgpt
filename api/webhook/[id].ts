import * as lark from '@larksuiteoapi/node-sdk'
import { VercelRequest, VercelResponse } from '@vercel/node'

import config from '../../config'
import eventHandles from '../../event'
import { cache } from '../../lib/cache'

function createLarkClient(appId: string, appSecret: string): lark.Client {
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

// https://open.feishu.cn/document/ukTMukTMukTM/uYDNxYjL2QTM24iN0EjN/event-subscription-configure-/configure-encrypt-key
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

  // body 数据结构见：https://open.feishu.cn/document/ukTMukTMukTM/uYDNxYjL2QTM24iN0EjN/event-subscription-configure-/configure-encrypt-key
  const body = request.body || {}

  const app = config.app[id as string]

  // 如果找不到该应用，则不回复
  if (!app) {
    return response.status(404).send(`App ${id} Not Found`)
  }
  // 如果没有提及机器人，则不回复
  // TODO: 后续通过发接口获取 name，无需用户手动指定 
  if (app.name !== body?.event?.message?.mentions?.[0]?.name) {
    return response.json({
      mention: false
    })
  }

  const client = createLarkClient(app.appId, app.appSecret)

  if (body.challenge) {
    return response.json({ challenge: body.challenge })
  }

  const eventId = body.header.event_id
  if (cache.get(eventId)) {
    return response.json({
      retry: true,
    })
  }
  cache.set(eventId, true, {
    // 如果飞书没有在规定时间内接收到消息，则会重试，为了防止重试，此时使用缓存来避免次情况
    // 但是它是内存缓存，应用重新部署时会失效
    ttl: 10 * 3600 * 1000,
  })

  // 事件列表见：https://open.feishu.cn/document/ukTMukTMukTM/uYDNxYjL2QTM24iN0EjN/event-list
  await eventHandles[body.header.event_type]?.(body, { client, app })

  return response.json({
    done: true,
  })
}
