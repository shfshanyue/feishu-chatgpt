import { reply } from '../lib/reply'

export default {
  'im.message.receive_v1': async (body: any, { client, app }) => {
    const message = body.event.message
    const text = JSON.parse(message.content).text.replace('@_user_1', '').trim()
    const answer = await reply([
      {
        role: 'user',
        content: `${app.prompt || ''} ${text}`,
      },
    ])
    await client.im.message.create({
      params: {
        receive_id_type: 'chat_id',
      },
      data: {
        receive_id: message.chat_id,
        content: JSON.stringify({ text: answer }),
        msg_type: 'text',
      },
    })
  },
}
