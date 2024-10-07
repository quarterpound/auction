import VerifyEmail from "@/components/molecules/verify-email"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

interface EmailVerifyProps {
  searchParams: {
    next?: string
  }
}

const EmailVerify = async ({searchParams: {next}}: EmailVerifyProps) => {

  const user = await auth()

  if(!user) {
    redirect('/')
  }

  return (
    <VerifyEmail next={next} />
  )
}

export default EmailVerify
