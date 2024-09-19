import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration)


export const useTimer = (date: Date) => {
  const calculateTimeLeft = useCallback(() => {
    const now = dayjs();
    const endDate = dayjs(date);
    const diff = endDate.diff(now);


    if (diff > 0) {
      const dur = dayjs.duration(diff);

      return {
        days: Math.floor(dur.asDays()),
        hours: dur.hours(),
        minutes: dur.minutes(),
        seconds: dur.seconds(),
        diff,
      };
    }

    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      diff,
    }

  }, [date]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, date]);

  return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
}
