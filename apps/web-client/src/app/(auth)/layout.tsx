import GuestGuard from "@/guards/guest-guard"
import { PropsWithChildren } from "react"

const AuthLayout = (props: PropsWithChildren) => {
  const { children } = props

  return <GuestGuard>{children}</GuestGuard>
}

export default AuthLayout