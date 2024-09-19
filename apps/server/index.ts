import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono';
import { appRouter } from './router';
import { env } from './env';
import { cors } from 'hono/cors';
import { getCookie } from 'hono/cookie';
import { logger } from 'hono/logger'
import { uploadRouter } from './router/uploads/router'
import { etag } from 'hono/etag';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { createBunWebSocket } from 'hono/bun';
import ws from 'ws';

const app = new Hono();

const socket = new ws.Server({
  port: 3001,
})

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


const handler = applyWSSHandler({
  wss: socket,
  router: appRouter,
  createContext: (opts) => {
    const authorization = opts.req.headers.cookie?.split('; ').find((row) => row.startsWith('authorization='))?.split('=')[1]

    return {
      authorization: authorization ?? null,
    }
  },
  // Enable heartbeat messages to keep connection open (disabled by default)
  keepAlive: {
    enabled: true,
    // server ping message interval in milliseconds
    pingMs: 30000,
    // connection is terminated if pong message is not received in this many milliseconds
    pongWaitMs: 5000,
  },
});

app.route('/', uploadRouter)

socket.on('connection', (ws) => {
  console.log(`➕➕ Connection (${socket.clients.size})`);
  ws.once('close', () => {
    console.log(`➖➖ Connection (${socket.clients.size})`);
  });
});
console.log('✅ WebSocket Server listening on ws://localhost:3001');
process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  socket.close();
});


export default {
  port: env.SERVER_PORT,
  fetch: app.fetch,
};
