import type {AppRouter} from "server/router"

import { createTRPCClient, createTRPCReact } from '@trpc/react-query';
import { createWSClient, httpBatchLink, httpLink, loggerLink, splitLink, wsLink } from '@trpc/client';
import superjson from 'superjson'

export const links = [
  splitLink({
    condition: (op) => {
      return op.type === 'subscription'
    },
    true: wsLink({
      client: createWSClient({
        url: process.env.NEXT_PUBLIC_WS_URL ?? 'https://ws.auksiyon.az',
      }),
      transformer: superjson
    }),
    false: httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_TRPC_URL ?? 'https://api.auksiyon.az'}/trpc` ?? '',
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
      transformer: superjson,
    })
  }),
  loggerLink({
  }),
]

export const trpc = createTRPCReact<AppRouter>();

export const trpcVanillaClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: process.env.TRPC_URL ?? '',
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
