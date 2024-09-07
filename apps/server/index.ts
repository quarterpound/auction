import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono';
import { appRouter } from './router';
import { env } from './env';

const app = new Hono();

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
