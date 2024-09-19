import { PropsWithChildren } from "react"
import StateProvider from "./state-provider"
import { trpcVanillaClient } from "@/trpc"
import { cookies } from "next/headers"
import { InitialState } from "@/store/types"

const AuthProvider = async ({children}: PropsWithChildren) => {

  let user: InitialState['authUser'] | null = null;

  try {
    user = await trpcVanillaClient.auth.me.query(undefined, {
      context: {
        authorization: cookies().get('authorization')?.value
      },

    })
  } catch (error) {
  }

  return (
    <StateProvider initialState={{
      authUser: user,
      isAuthLoading: false,
    }}>
      {children}
    </StateProvider>
  )
}

export default AuthProvider
