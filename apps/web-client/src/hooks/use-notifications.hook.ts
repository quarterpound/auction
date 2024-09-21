import { useMemo } from "react"

const useNotifications = () => {
  const positive = useMemo(() => new Audio('/notifications/positive.wav'), [])
  const negative = useMemo(() => new Audio('/notifications/negative.wav'), [])

  const outbid = (onclick?: () => void) => {
    try {
      negative.play()

      if(!document.hasFocus()) {
        if(window.Notification.permission === 'granted') {
          const notif = new Notification("You have been outbid");
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
      positive.play()
    } catch(e) {
      console.error(e)
    }
  }

  const getPermission = () => {
    if('Notification' in window) {
      if(window.Notification.permission !== 'granted') {
        window.Notification.requestPermission().then(() => {
          new Notification("We will only notify you when you have been outbid")
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
