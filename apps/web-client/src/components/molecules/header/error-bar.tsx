'use client'

import { Button } from "@/components/ui/button"
import { useAppState } from "@/store"
import { trpc } from "@/trpc"
import { useState } from "react"
import { toast } from "sonner"

const ErrorBar = () => {
  const {authUser, hasPendingAuctions} = useAppState()
  const [submitted, setSubmitted] = useState(false)

  const resendMutation = trpc.profile.resendVerificationEmail.useMutation({
    onSuccess: () => {
      setSubmitted(true)
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

  if(hasPendingAuctions) {
    return <div className="bg-orange-400">
      <div className="container text-sm mx-auto py-2 flex items-center justify-between">
        <p className="text-white font-bold">You have pending auctions, please verify your email to post</p>
        {
          !submitted && (
            <Button onClick={() => resendMutation.mutate()} disabled={resendMutation.isPending} variant={'link'} className="text-white font-bold">{`Didn't recieve an email? Resend`}</Button>
          )
        }
      </div>
    </div>
  }

  return (
    <div className="bg-orange-400">
      <div className="container text-sm mx-auto py-2 flex items-center justify-between">
        <p className="text-white font-bold">Please verify your email</p>
        {
          !submitted && (
            <Button onClick={() => resendMutation.mutate()} disabled={resendMutation.isPending} variant={'link'} className="text-white font-bold">{`Didn't recieve an email? Resend`}</Button>
          )
        }
      </div>
    </div>
  )
}

export default ErrorBar
