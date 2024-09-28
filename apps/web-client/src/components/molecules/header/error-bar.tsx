'use client'

import { Button } from "@/components/ui/button"
import { useAppState } from "@/store"
import { trpc } from "@/trpc"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { usePathname } from 'next/navigation'

const ErrorBar = () => {
  const {authUser, hasPendingAuctions} = useAppState()
  const pathname = usePathname()

  const resendMutation = trpc.profile.resendVerificationEmail.useMutation({
    onSuccess: () => {
      toast.success("Check your email!")
    },
    onError: (e) => {
      toast.error(`Something went wrong: ${e.message}`)
    }
  })

  if(!authUser) {
    return <></>
  }

  if(authUser.emailVerified) {
    return <></>
  }

  if(pathname !== '/verify-email') {
    if(hasPendingAuctions) {
      return <div className="bg-orange-100 border-b border-orange-200">
        <div className="container mx-auto py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-500" />
              <p className="text-sm font-medium text-orange-800">
                You have pending auctions. Please verify your email to post them
              </p>
            </div>
            {
              !resendMutation.isSuccess && (
                <Button
                  onClick={() => resendMutation.mutate()}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto bg-white hover:bg-orange-50 text-orange-600 border-orange-300 hover:border-orange-400"
                >
                  Resend Verification Email
                </Button>
              )
            }
          </div>
        </div>
      </div>
    }

    return (
      <div className="bg-orange-100 border-b border-orange-200">
        <div className="container mx-auto py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-500" />
              <p className="text-sm font-medium text-orange-800">
                Please verify your email to fully access all features.
              </p>
            </div>
            {
              !resendMutation.isSuccess && (
                <Button
                  onClick={() => resendMutation.mutate()}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto bg-white hover:bg-orange-50 text-orange-600 border-orange-300 hover:border-orange-400"
                >
                  Resend Verification Email
                </Button>
              )
            }
          </div>
        </div>
      </div>
    )
  }

  return <></>
}

export default ErrorBar
