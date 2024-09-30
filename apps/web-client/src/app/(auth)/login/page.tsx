import LoginForm from "./client"

export const metadata = {
  title: 'Login'
}

interface LoginFormProps {
  searchParams: {
    next?: string
  }
}


const Login = ({ searchParams: { next } }: LoginFormProps) => {
  return (
    <div className="min-h-[calc(100vh-230px)] flex items-center justify-center">
      <LoginForm next={next} />
    </div>
  )
}

export default Login
