import { LoopsClient } from 'loops'
import { env } from '../env'

export const getClient = () => {
  return new LoopsClient(env.LOOPS_API_KEY)
}

type SendTransactionalEmailReturnType = Awaited<ReturnType<LoopsClient['sendTransactionalEmail']>>

export const sendWelcomeEmail = async (email: string, link: string): Promise<SendTransactionalEmailReturnType> => {
  const client = getClient();

  const data = await client.sendTransactionalEmail({
    transactionalId: 'cm0vm889l00ag3akzl5wi785d',
    email,
    addToAudience: true,
    dataVariables: {
      link
    }
  })

  return data
}
