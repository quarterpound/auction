'use client'

import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { LoginValidation } from "./validation"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAppState } from "@/store"
import { trpc } from "@/trpc"

const LoginForm = () => {
  const router = useRouter();
  const setInitialState = useAppState(state => state.setInitialState)

  const loginMutation = trpc.auth.login.useMutation()

  const form = useForm<LoginValidation>({
    values: {
      username: '',
      password: ''
    }
  })

  const handleSubmit = async (data: LoginValidation) => {
    const { user } = await loginMutation.mutateAsync(data)

    setCookie('authorization', token, {
      maxAge: 60 * 7 * 24
    });

    setInitialState({
      authUser: user,
      isAuthLoading: false,
      hasMadeBids: user._count.Bids !== 0,
      favorites: user.UserFavorites
    })

    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className="min-w-[400px]">
          <CardHeader>
            <CardTitle>
              <h1>Login</h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <FormItem>
              <FormLabel>Email or phone number</FormLabel>
              <FormControl>
                <Input {...form.register('username')} placeholder="example@example.com"  />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type='password' {...form.register('password')}  />
              </FormControl>
            </FormItem>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Login</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default LoginForm
