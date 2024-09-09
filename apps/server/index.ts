import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono';
import { appRouter } from './router';
import { env } from './env';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(cors({origin: '*'}))

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter
  })
)

export default {
  port: env.SERVER_PORT,
  fetch: app.fetch,
};
