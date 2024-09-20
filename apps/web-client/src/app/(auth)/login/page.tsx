import LoginForm from "./client"

export const metadata = {
  title: 'Login'
}


const Login = () => {
  return (
    <div className="min-h-[calc(100vh-230px)] flex items-center justify-center">
      <LoginForm />
    </div>
  )
}

export default Login
