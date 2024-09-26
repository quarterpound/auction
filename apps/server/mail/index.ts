import { LoopsClient } from 'loops'
import { env } from '../env'
import dayjs, { Dayjs } from 'dayjs'

export const getClient = () => {
  return new LoopsClient(env.LOOPS_API_KEY)
}

type SendTransactionalEmailReturnType = Awaited<ReturnType<LoopsClient['sendTransactionalEmail']>>
type AddEmailToAudienceReturnType = Awaited<ReturnType<LoopsClient['createContact']>>

export const sendWelcomeEmail = async (email: string, identifier: string, token: string, addToAudience = false): Promise<SendTransactionalEmailReturnType> => {
  const client = getClient();

  const data = await client.sendTransactionalEmail({
    transactionalId: 'cm0vm889l00ag3akzl5wi785d',
    email,
    addToAudience,
    dataVariables: {
      link: `${env.CLIENT_URL}/verify?token=${token}&identifier=${identifier}`
    }
  })

  return data
}

export const sendAuctionSubmitEmail = async (email: string, name: string, auctionTitle: string, startBid: number, endDate: Date): Promise<SendTransactionalEmailReturnType> => {
  return getClient().sendTransactionalEmail({
    transactionalId: 'cm1313ds401viyi37fzq0sp4o',
    email,
    addToAudience: true,
    dataVariables: {
      name,
      auction_title: auctionTitle,
      start_bid: startBid,
      endDate: dayjs(endDate).format('YYYY-MM-DD HH:mm'),
    }
  })
}

export const addEmailToAudience = (email: string): Promise<AddEmailToAudienceReturnType> => {
  return getClient().createContact(email)
}
