'use client'

import { useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { links, trpc } from "@/trpc";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const QueryProvider = ({children}: React.PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links,
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  )

}

export default QueryProvider
