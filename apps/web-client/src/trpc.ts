import type {AppRouter} from "server/router"

import { createTRPCClient, createTRPCReact } from '@trpc/react-query';
import { createWSClient, httpBatchLink, httpLink, splitLink, wsLink } from '@trpc/client';
import superjson from 'superjson'
import { env } from "./env";

export const links = [
  splitLink({
    condition: (op) => {
      return op.type === 'subscription'
    },
    true: wsLink({
      client: createWSClient({
        url: env.WS_URL,
      }),
      transformer: superjson
    }),
    false: httpBatchLink({
      url: env.WS_URL,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
          cache: 'no-store',
        });
      },
      transformer: superjson,
    })
  })
]

export const trpc = createTRPCReact<AppRouter>();

export const trpcVanillaClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: env.TRPC_URL,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
          cache: 'no-store',
        });
      },

      headers: (opts) => {
        if(opts.op.context.authorization) {
          return {
            Cookie: `authorization=${opts.op.context.authorization}`
          }
        }

        return {}
      },
      transformer: superjson,
    })
  ],
});
