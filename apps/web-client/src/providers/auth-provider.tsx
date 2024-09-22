import { PropsWithChildren } from "react"
import StateProvider from "./state-provider"
import { auth } from "@/lib/auth"

const AuthProvider = async ({children}: PropsWithChildren) => {

  const user = await auth()

  return (
    <StateProvider initialState={{
      favorites: user?.favorites ?? [],
      authUser: user,
      isAuthLoading: false,
    }}>
      {children}
    </StateProvider>
  )
}

export default AuthProvider
