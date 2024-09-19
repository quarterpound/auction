'use client'

import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';
import { useCallback, useEffect, useState } from "react";

dayjs.extend(duration);

type TimerProps = {
  data: Date
}

const Timer = ({data}: TimerProps) => {
  const calculateTimeLeft = useCallback(() => {
    const now = dayjs();
    const endDate = dayjs(data);
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

  }, [data]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, data]);

  return (
    <span suppressHydrationWarning={true}>
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  );
}

export default Timer
