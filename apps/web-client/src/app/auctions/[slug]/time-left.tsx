import { useTimer } from "@/hooks/useTimer.hook"

interface TimeLeftProps {
  date: Date
}

const TimeLeft = ({date}: TimeLeftProps) => {
  const time = useTimer(date)

  return (
    <span className="text-xl font-semibold" suppressHydrationWarning={true}>{`${time} left`}</span>
  )
}

export default TimeLeft
