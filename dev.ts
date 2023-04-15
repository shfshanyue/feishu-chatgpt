
import { createServerWithHelpers } from './lib/helpter'
import webHookHandler from './api/webhook/[id]'
import weComHookHandler from './api/webhook/wecom/[id]'

const server = createServerWithHelpers(async (req, res) => {
  const reWecom = /^\/api\/webhook\/wecom\/([\w-]+)$/
  if (req.url && reWecom.test(req.url)) {
    const id = req.url.match(reWecom)?.[1] || '';
    (req as any).query.id = id
    await weComHookHandler(req, res)
  }

  const re = /^\/api\/webhook\/([\w-]+)$/
  if (req.url && re.test(req.url)) {
    const id = req.url.match(re)?.[1] || '';
    (req as any).query.id = id
    await webHookHandler(req, res)
  }
})

server.listen(3000, () => {
  console.log('Start server at :3000')
})
