import { useState, useEffect, useRef, useCallback } from "react";

interface UseMinigameTimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
}

export function useMinigameTimer({ duration, onTimeUp }: UseMinigameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep the ref updated with the latest onTimeUp function to avoid it being a dependency in the main useEffect
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // Do nothing if the timer is not running.
    if (!isRunning) {
      return;
    }

    // Set up the interval when the timer is running.
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // When time is up, stop the timer and call the callback.
            setIsRunning(false);
            onTimeUpRef.current();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    // Cleanup function: clear the interval when the effect is cleaned up
    // (i.e., when isRunning becomes false or the component unmounts).
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]); // This effect should only depend on `isRunning`.

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(duration);
  }, [duration]);

  return {
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    progressPercent: (timeLeft / duration) * 100,
  };
}