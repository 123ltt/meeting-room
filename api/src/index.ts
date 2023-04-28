import Hapi from '@hapi/hapi'
import HapiInert from '@hapi/inert'
import * as Path from 'path'
import fetch from './fetch'

async function bootstrap() {
  const server = Hapi.server({
    port: process.env.PORT || 3100,
    // host: 'localhost'
  })
  await server.register(HapiInert)

  server.route([
    {
      method: 'get',
      path: '/api/list',
      options: {
        timeout: {
          server: 30000
        }
      },
      async handler(req) {
        try {
          return { status: true, data: await fetch(req.query.date) }
        } catch (err) {
          return { status: false, info: err.message }
        }
      },
    },
    {
      method: 'get',
      path: '/{p*}',
      options: {
        timeout: {
          server: 10000
        }
      },
      handler(request, h) {
        const filepath = request.path === '/' ? 'index.html' : request.path
        return h.file(Path.join(__dirname, '../public', filepath))
      }
    }
  ])

  server.start()
}

bootstrap()