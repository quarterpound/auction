import type {AppRouter} from "server/router"

import { createTRPCClient, createTRPCReact } from '@trpc/react-query';
import { createWSClient, httpBatchLink, httpLink, splitLink, wsLink } from '@trpc/client';
import superjson from 'superjson'

export const links = [
  splitLink({
    condition: (op) => {
      return op.type === 'subscription'
    },
    true: wsLink({
      client: createWSClient({
        url: `ws://localhost:3001`,
      }),
      transformer: superjson
    }),
    false: httpBatchLink({
      url: 'http://localhost:4200/trpc',
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
      url: 'http://localhost:4200/trpc',
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
