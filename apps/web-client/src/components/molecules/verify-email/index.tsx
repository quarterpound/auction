'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { useAppState } from "@/store"
import { trpc } from "@/trpc"
import { setCookie } from "cookies-next"
import { MailIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface VerifyEmailProps {
  next?: string
}

const VerifyEmail = ({next}: VerifyEmailProps) => {
  const {setInitialState, authUser} = useAppState()
  const router = useRouter()

  const verifyEmailMutation = trpc.auth.verify.useMutation({
    onSuccess: ({user, jwt}) => {
      setInitialState({
        authUser: user,
        hasMadeBids: false,
        favorites: [],
        isAuthLoading: false,
        hasPendingAuctions: false,
      })
      setCookie('authorization', jwt, {
        maxAge: 7 * 60 * 60 * 24
      })

      if(next) {
        return router.push(next)
      }

      router.push('/')
    }
  })

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <MailIcon className="h-10 w-10 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-blue-600">Verify Your Email</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600">
         {"We've sent a verification email to your inbox. Please check your email and enter the code."}
        </p>
        <div className="mx-auto py-8 grid gap-2">
          <InputOTP
            onChange={(e) => {
              if(e.length === 6) {
                return verifyEmailMutation.mutate({token: e, identifier: authUser?.email ?? ''})
              }
            }}
            disabled={verifyEmailMutation.isPending}
            maxLength={6}
            containerClassName="w-[250px] mx-auto"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {
            verifyEmailMutation.isError && (
              <p className="text-sm text-red-500">{'Something went wrong while verifying'}</p>
            )
          }
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
          <MailIcon className="h-4 w-4" />
          <span>{"Didn't receive the email? Check your spam folder."}</span>
        </div>
      </CardContent>
      <CardFooter className="text-center text-sm text-gray-500">
        <p>
          {`If you're still having trouble, please `}
          <a href="/contact-support" className="text-blue-600 hover:underline">
            contact our support team
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  )
}

export default VerifyEmail
