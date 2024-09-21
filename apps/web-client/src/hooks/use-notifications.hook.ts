import { useMemo } from "react"

const useNotifications = () => {
  const positive = useMemo(() => new Audio('/notifications/positive.wav'), [])
  const negative = useMemo(() => new Audio('/notifications/negative.wav'), [])


  const outbid = () => {
    try {
      negative.play()
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

  return {
    bidAccepted,
    outbid
  }
}

export {useNotifications}
