import RegisterForm from "./client"

export const metadata = {
  title: 'Register',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_CLIENT_URL}/login`
  }
}

const RegisterPage = () => {
  return <div className="flex min-h-[calc(100vh-230px)] items-center justify-center">
    <RegisterForm />
  </div>
}

export default RegisterPage
