import { useEffect, useRef, useState } from 'react';

// Fades + rises an element into place the first time it scrolls into view.
// Respects prefers-reduced-motion (see .reveal / .reveal-visible in index.css).
export default function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`} style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}>
      {children}
    </div>
  );
}
