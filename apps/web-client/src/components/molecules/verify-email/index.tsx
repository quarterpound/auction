import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MailIcon } from "lucide-react"

const VerifyEmail = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <MailIcon className="h-10 w-10 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-blue-600">Verify Your Email</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600 mb-4">
         {"We've sent a verification email to your inbox. Please check your email and click on the verification link to activate your account."}
        </p>
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
