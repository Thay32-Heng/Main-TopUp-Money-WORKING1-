import { useState, useEffect } from 'react';

export function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutQuart)
      const ease = 1 - Math.pow(1 - percentage, 4);
      
      setCount(Math.floor(start + (end - start) * ease));

      if (progress < duration) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(end); // Ensure it finishes strictly at end value
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration, start]);

  return count;
}
