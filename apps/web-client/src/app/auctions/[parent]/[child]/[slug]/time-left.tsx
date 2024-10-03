import { useTimer } from "@/hooks/use-timer.hook"

interface TimeLeftProps {
  date: Date
}

const TimeLeft = ({date}: TimeLeftProps) => {
  const time = useTimer(date)

  return (
    <span className="md:text-xl md:font-semibold" suppressHydrationWarning={true}>{`${time} left`}</span>
  )
}

export default TimeLeft
