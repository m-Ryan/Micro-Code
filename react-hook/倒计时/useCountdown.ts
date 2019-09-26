import { useState, useEffect, useMemo } from "react";

const ONE_MINUTE = 60;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

const formatTime = (t: number) => {
  return t < 10 ? "0" + t : t;
};

const getTime = (seconds: number) => {
  if (seconds <= 0) {
    return {
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
    };
  }
  const day = Math.floor(seconds / ONE_DAY);
  const hour = Math.floor((seconds - day * ONE_DAY) / ONE_HOUR);
  const minute = Math.floor(
    (seconds - day * ONE_DAY - hour * ONE_HOUR) / ONE_MINUTE
  );
  const second = Math.floor(
    seconds - day * ONE_DAY - hour * ONE_HOUR - minute * ONE_MINUTE
  );
  return {
    day,
    hour,
    minute,
    second,
  };
};

export function useCountdown(
  initSeconds: number,
  options: {
    autoStart: boolean;
  } = {
    autoStart: true,
  }
) {
  const { autoStart } = options;
  const [seconds, setSeconds] = useState(initSeconds);
  const [millisecond, setMillisecond] = useState(0);
  const [isStart, setIsStart] = useState(autoStart);

  const isEnd = useMemo(() => seconds <= 0, [seconds]);

  useEffect(() => {
    if (!isStart) return;
    // 开始的时候立即减一
    setSeconds((seconds) => seconds - 1);
    const secondTimer = setInterval(() => {
      if (isEnd) return;
      setSeconds((seconds) => seconds - 1);
    }, 1000);

    const millisecondTimer = setInterval(() => {
      if (isEnd) return;
      setMillisecond(
        parseInt(new Date().getTime().toString().substr(-3).substr(0, 1) + "0")
      );
    }, 50);

    return () => {
      secondTimer && clearInterval(secondTimer);
      millisecondTimer && clearInterval(millisecondTimer);
    };
  }, [isStart, isEnd]);

  const formatDate = useMemo(() => {
    const { day, hour, minute, second } = getTime(seconds);
    return {
      day: formatTime(day),
      hour: formatTime(hour),
      minute: formatTime(minute),
      second: formatTime(second),
    };
  }, [seconds]);

  return {
    ...formatDate,
    millisecond: formatTime(isEnd ? 0 : millisecond),
    startCountDount: () => setIsStart(true),
    setSeconds,
    isEnd,
  };
}
