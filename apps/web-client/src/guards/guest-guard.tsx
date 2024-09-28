import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PropsWithChildren } from "react"

const GuestGuard = async ({children}: PropsWithChildren) => {
  const user = await auth()

  if(user) {
    redirect('/')
  }

  return <>{children}</>
}

export default GuestGuard
