import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono';
import { appRouter } from './router';
import { env } from './env';
import { cors } from 'hono/cors';
import { getCookie } from 'hono/cookie';
import { logger } from 'hono/logger'

const app = new Hono();

app.use(cors({origin: ['http://localhost:3000'], credentials: true,}))
app.use(logger())

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => {
      const authorization = getCookie(c, 'authorization') ?? null

      console.log(getCookie(c))

      return ({
        authorization
      })
    }

  })
)

export default {
  port: env.SERVER_PORT,
  fetch: app.fetch,
};
