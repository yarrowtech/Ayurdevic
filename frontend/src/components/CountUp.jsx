import { useEffect, useRef, useState } from 'react';

// Animates a number counting up to `value` whenever it changes.
// Pass `formatter` to render the animated number as currency, etc.
export default function CountUp({ value, duration = 600, formatter }) {
  const numeric = Number(value) || 0;
  const [display, setDisplay] = useState(numeric);
  const fromRef = useRef(numeric);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setDisplay(numeric); fromRef.current = numeric; return; }
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (numeric - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = numeric;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [numeric, duration]);

  return <>{formatter ? formatter(display) : Math.round(display).toLocaleString('en-IN')}</>;
}
