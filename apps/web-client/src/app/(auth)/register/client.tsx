'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { registerValidation, RegisterValidation } from "./validation"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAppState } from "@/store"
import { register } from "./actions"
import { Checkbox } from "@/components/ui/checkbox"
import { zodResolver } from "@hookform/resolvers/zod"

const RegisterForm = () => {
  const router = useRouter();
  const setInitialState = useAppState(state => state.setInitialState)

  const form = useForm<RegisterValidation>({
    values: {
      name: '',
      email: '',
      phone: '',
      password: '',
      acceptTerms: false,
      addToAudiences: false
    },
    resolver: zodResolver(registerValidation)
  })

  const handleSubmit = async (data: RegisterValidation) => {
    const user = await register(data)

    setInitialState({
      authUser: user,
      isAuthLoading: false,
      favorites: [],
    })

    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className="min-w-[400px]">
          <CardHeader>
            <CardTitle>
              <h1>Register</h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input {...form.register('name')} placeholder="Ali Gasimzade"  />
              </FormControl>
              <FormMessage>
                {form.formState.errors.name?.message}
              </FormMessage>
            </FormItem>
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...form.register('email')} placeholder="example@example.com"  />
              </FormControl>
              <FormMessage>
                {form.formState.errors.email?.message}
              </FormMessage>
            </FormItem>
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...form.register('phone')} placeholder="+994 516492912"  />
              </FormControl>
              <FormMessage>
                {form.formState.errors.phone?.message}
              </FormMessage>
            </FormItem>
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type='password' {...form.register('password')}  />
              </FormControl>
              <FormMessage>
                {form.formState.errors.password?.message}
              </FormMessage>
            </FormItem>
            <FormField
              control={form.control}
              name="addToAudiences"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox onCheckedChange={field.onChange} checked={field.value} />
                    </FormControl>
                    <FormLabel className="p-0 m-0" style={{ marginTop: 0 }}>Receive news and updates</FormLabel>
                  </div>
                  <div>
                    <FormMessage className="block">
                      {form.formState.errors.addToAudiences?.message}
                    </FormMessage>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox onCheckedChange={field.onChange} checked={field.value} />
                    </FormControl>
                    <FormLabel className="p-0 m-0 text-foreground" style={{ marginTop: 0 }}>Accept terms and conditions</FormLabel>
                  </div>
                  <div>
                    <FormMessage className="block">
                      {form.formState.errors.acceptTerms?.message}
                    </FormMessage>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button className="w-full">Register</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default RegisterForm
