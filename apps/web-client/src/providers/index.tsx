import AuthProvider from "./auth-provider"
import QueryProvider from "./query-provider"

const Provider = async ({children}: React.PropsWithChildren) => {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>

  )
}

export default Provider
