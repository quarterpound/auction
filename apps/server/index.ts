import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono';
import { appRouter } from './router';
import { env } from './env';
import { cors } from 'hono/cors';
import { getCookie } from 'hono/cookie';
import { logger } from 'hono/logger'
import { uploadRouter } from './router/uploads/router'
import { etag } from 'hono/etag';

const app = new Hono();

app.use(cors({origin: ['http://localhost:3000'], credentials: true,}))
app.use(etag(),logger())

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => {
      const authorization = getCookie(c, 'authorization') ?? null

      return ({
        authorization,
        c,
      })
    }

  })
)

app.route('/', uploadRouter)


export default {
  port: env.SERVER_PORT,
  fetch: app.fetch,
};
