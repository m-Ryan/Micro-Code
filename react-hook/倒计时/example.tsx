import React, { useEffect } from "react";
import "./App.css";
import { useCountdown } from "./useCountdown";

function Example() {
  const {
    minute,
    second,
    millisecond,
    startCountDount,
    setSeconds,
    isEnd,
  } = useCountdown(3, { autoStart: false });

  useEffect(() => {
    if (isEnd) {
      console.log("isEnd");
    }
  }, [isEnd]);

  return (
    <div className="App">
      {minute}: {second}: {millisecond}
      <div>{isEnd && "已结束"}</div>
      <div onClick={startCountDount}>start</div>
      <div onClick={() => setSeconds(5)}>restart</div>
    </div>
  );
}
