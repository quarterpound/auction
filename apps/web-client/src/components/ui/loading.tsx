import { cn } from "@/lib/utils"
import { LoaderCircle } from "lucide-react"
import { HTMLAttributes } from "react"

const Loading = ({className, ...props}: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("min-h-[calc(100vh-290px)] flex items-center justify-center", className)} {...props}>
    <LoaderCircle className="w-12 h-12 animate-spin" />
  </div>
}

export default Loading
