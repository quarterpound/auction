'use client'

import { PropsWithChildren } from "react"
import StateProvider from "./state-provider"
import { trpc } from "@/trpc"

const AuthProvider = (props: PropsWithChildren) => {
  const { children } = props

  const {data: user, isFetched, isError } = trpc.auth.me.useQuery(undefined, {retry: false})

  return (
    <StateProvider initialState={{
      authUser: isFetched && !isError ? user ?? null : null,
      isAuthLoading: !isFetched,
    }}>
      {children}
    </StateProvider>
  )
}

export default AuthProvider
