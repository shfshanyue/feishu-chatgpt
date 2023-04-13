import { VercelRequest, VercelResponse } from '@vercel/node'
import { decrypt, getSignature } from '@wecom/crypto'
import xml2js from 'xml2js'
import wretch from 'wretch'

import config from '../../../config'
import eventHandles from '../../../event'
import { cache } from '../../../lib/cache'
import { rawBody } from '../../../lib/helpter'
import { reply } from '../../../lib/reply'

async function getAccessToken(id: string, secret: string) {
  const key = `AccessToken:${id}`
  if (cache.get(key)) {
    return cache.get(key)
  }
  const {
    access_token, errcode, errmsg
  } = await fetch(
    `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${id}&corpsecret=${secret}`
  ).then(res => res.json())
  if (errcode === 0 && errmsg === 'ok') {
    cache.set(key, access_token, {
      ttl: 7100000
    })
    return access_token
  } else {
    console.error(errmsg)
    return ''
  }
}

async function createMessage({
  id,
  secret,
  text,
  user,
  agentId,
}: Record<string, string>) {
  const token = await getAccessToken(id, secret)
  const res = await wretch(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`)
    .post(
      {
        touser: user,
        msgtype: 'text',
        agentid: agentId,
        text: {
          content: text
        }
      }
    )
    .json(json => {
      console.log(json)
    })
    .catch((e) => {
      console.error(e)
    })
  return res
}

export default async function webhook(
  request: VercelRequest,
  response: VercelResponse
) {
  const { msg_signature, timestamp, nonce, echostr, id } = request.query as Record<string, string>

  const app = config.wxwork[id as string]

  // 如果找不到该应用，则不回复
  if (!app) {
    return response.status(404).send(`App ${id} Not Found`)
  }

  if (echostr) {
    const signature = getSignature(app.token, timestamp, nonce, echostr)
    if (signature !== msg_signature) {
      return response.send('')
    } else {
      const { message } = decrypt(app.aesKey, echostr)
      return response.send(message)
    }
  }

  const body = await rawBody(request)
  const {
    xml: { Encrypt }
  } = await xml2js.parseStringPromise(body)
  const { message } = decrypt(app.aesKey, Encrypt[0])
  const xml = await xml2js.parseStringPromise(message)
  const {
    xml: { FromUserName, Content, MsgType, AgentID }
  } = xml

  console.log(xml)

  if (MsgType[0] === 'text') {
    const answer = await reply([
      {
        role: 'user',
        content: `${app.prompt || ''} ${Content}`,
      },
    ])
    console.log(answer)
    const result = await createMessage({
      id: app.corpId,
      secret: app.secret,
      text: answer,
      user: FromUserName[0],
      agentid: AgentID[0]
    })
    console.log(result)
  }
  return response.send('')
}