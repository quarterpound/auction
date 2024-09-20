import RegisterForm from "./client"

export const metadata = {
  title: 'Register'
}

const RegisterPage = () => {
  return <div className="flex min-h-[calc(100vh-230px)] items-center justify-center">
    <RegisterForm />
  </div>
}

export default RegisterPage
