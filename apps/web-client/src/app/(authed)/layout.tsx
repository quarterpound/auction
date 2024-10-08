import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PropsWithChildren } from "react"

const Layout = async ({children}: PropsWithChildren) => {
  const user = await auth()

  if(!user) {
    redirect('/')
  }

  return (
    children
  )
}

export default Layout
