import { Post } from "@prisma/client"
import { useMemo } from "react"
import { AddedBid } from "server/events"
import { formatNumber } from "utils"

const useNotifications = () => {
  const positive = useMemo(() => typeof Audio !== "undefined" ? new Audio('/notifications/positive.wav') : null, [])
  const negative = useMemo(() => typeof Audio !== "undefined" ? new Audio('/notifications/negative.wav') : null, [])

  const outbid = (bid: AddedBid, auction: Post, onclick?: () => void,) => {
    try {
      negative?.play()

      if(!document.hasFocus()) {
        if(window.Notification.permission === 'granted') {
          const notif = new Notification("You have been outbid", {
            body: `New price set at ${formatNumber(bid.amount, auction.currency)}`
          });
          notif.onclick = () => {
            onclick?.()
          }
        }
      }
    } catch(e) {
      console.error(e)
    }
  }

  const bidAccepted = () => {
    try {
      positive?.play()
    } catch(e) {
      console.error(e)
    }
  }

  const getPermission = () => {
    if('Notification' in window) {
      if(window.Notification.permission !== 'granted') {
        window.Notification.requestPermission().then(() => {
          new Notification("Thanks!", {
            body: 'You will be notified when you are outbid'
          })
        })
      }
    }
  }

  return {
    bidAccepted,
    outbid,
    getPermission
  }
}

export {useNotifications}
