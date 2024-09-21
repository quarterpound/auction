import { PropsWithChildren } from "react"
import Menu from "./menu"
import Logout from "@/components/molecules/log-out"

interface DashboardLayoutProps {
  title: string
}

const DashboardLayout = ({children, title}: DashboardLayoutProps & PropsWithChildren) => {
  return (
    <div className="grid gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Logout />
      </div>
      <div className="grid gap-5 grid-cols-[3fr_7fr]">
        <div>
          <Menu />
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
