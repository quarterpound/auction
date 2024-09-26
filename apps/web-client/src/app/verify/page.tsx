import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { trpcVanillaClient } from "@/trpc"
import { AlertCircle, CheckCircle, Gavel, MailIcon, RefreshCw } from "lucide-react"
import Link from "next/link"

interface VerifyPageProps {
  searchParams: {
    token: string
    identifier: string
  }
}


const VerifyPage = async ({searchParams: {token, identifier}}: VerifyPageProps) => {
  try {
    await trpcVanillaClient.auth.verify.mutate({
      token,
      identifier: identifier.replace(' ', '+')
    })

    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Email Verified!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Thank you for verifying your email address. Your account is now fully activated and ready to use.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Gavel className="h-4 w-4" />
              <span>{"You're all set to start bidding and selling!"}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/auctions">
                Explore Auctions
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/profile">
                Complete Your Profile
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  } catch(e) {
    return (
      <div className="flex items-center justify-center min-h-screen min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              {"We're sorry, but we couldn't verify your email address. This could be due to:"}
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside mb-4">
              <li>An expired verification link</li>
              <li>An already verified email</li>
              <li>A technical issue on our end</li>
            </ul>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <MailIcon className="h-4 w-4" />
              <span>Please try the options below to resolve this issue</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/resend-verification">
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Verification Email
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/contact-support">
                Contact Support
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
}

export default VerifyPage
