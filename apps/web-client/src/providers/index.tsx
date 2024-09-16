import AuthProvider from "./auth-provider"
import QueryProvider from "./query-provider"

const Provider = ({children}: React.PropsWithChildren) => {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>

  )
}

export default Provider
