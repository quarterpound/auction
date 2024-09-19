import DashboardLayout from "@/components/layout/dashboard-layout"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PropsWithChildren } from "react"

const Layout = async ({children}: PropsWithChildren) => {
  const user = await auth()

  if(!user) {
    redirect('/')
  }

  return (
    <DashboardLayout title="Your profile">{children}</DashboardLayout>

  )
}

export default Layout
