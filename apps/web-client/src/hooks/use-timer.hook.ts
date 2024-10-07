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

  const formatTimeLeft = useCallback((timeLeft: ReturnType<typeof calculateTimeLeft>): string => {
    const parts = [];

    if (timeLeft.days > 0) {
      parts.push(`${timeLeft.days}d`);
    }

    if (timeLeft.hours > 0) {
      parts.push(`${timeLeft.hours}h`);
    }

    if (timeLeft.minutes > 0) {
      parts.push(`${timeLeft.minutes}m`);
    }

    if (timeLeft.seconds > 0) {
      parts.push(`${timeLeft.seconds}s`);
    }

    // Join all non-zero parts with a space
    return parts.join(' ');
  }, []);

  return formatTimeLeft(timeLeft)
}
