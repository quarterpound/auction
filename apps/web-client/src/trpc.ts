import type {AppRouter} from "server/router"

import { createTRPCClient, createTRPCReact } from '@trpc/react-query';
import { createWSClient, httpBatchLink, httpLink, wsLink } from '@trpc/client';
import superjson from 'superjson'

export const links = [
  wsLink({
    client: createWSClient({
      url: `ws://localhost:3001`,
    }),
    transformer: superjson
 }),
  httpBatchLink({
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
