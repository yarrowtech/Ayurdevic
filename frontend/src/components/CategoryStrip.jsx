import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';

// Flipkart-style horizontal category rail. Icon + label chips that scroll
// sideways on overflow; keeps the storefront's Ayurvedic palette.
export default function CategoryStrip() {
  const { navigate, categories } = useAppContext();
  const track = useRef(null);
  const [overflowing, setOverflowing] = useState(false);

  const measure = useCallback(() => {
    const el = track.current;
    setOverflowing(!!el && el.scrollWidth > el.clientWidth + 4);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, categories]);

  if (!categories.length) return null;

  const go = key => { navigate(key ? `/products/${encodeURIComponent(key)}` : '/products'); scrollTo(0, 0); };
  const nudge = direction => track.current?.scrollBy({ left: direction * 240, behavior: 'smooth' });
  const items = [{ key: '', name: 'For You', image: null }, ...categories];

  return (
    <section aria-label="Shop by category" className="relative border-b border-[var(--clay)]/70 bg-[var(--paper)]/80 backdrop-blur">
      {overflowing && <button type="button" aria-label="Scroll categories left" onClick={() => nudge(-1)} className="absolute left-0 top-0 z-10 hidden h-full w-9 items-center justify-center bg-gradient-to-r from-[var(--paper)] to-transparent text-xl text-[var(--ink)]/70 md:flex">‹</button>}
      <ul ref={track} className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:px-4">
        {items.map((category, index) => (
          <li key={category.key || index} className="shrink-0">
            <button
              type="button"
              onClick={() => go(category.key)}
              className="group flex w-20 flex-col items-center gap-1.5 rounded-lg px-1 py-2 text-center transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--herbal)]/50 sm:w-24"
            >
              {category.image
                ? <img src={category.image} alt="" className="h-11 w-11 rounded-full object-cover transition-transform group-hover:scale-105 sm:h-12 sm:w-12" draggable={false} />
                : <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-lg font-semibold text-green-800 sm:h-12 sm:w-12">{category.name[0]}</span>}
              <span className="line-clamp-1 w-full text-xs font-medium text-[var(--ink)] group-hover:text-[var(--herbal-dark)]" title={category.name}>{category.name}</span>
            </button>
          </li>
        ))}
      </ul>
      {overflowing && <button type="button" aria-label="Scroll categories right" onClick={() => nudge(1)} className="absolute right-0 top-0 z-10 hidden h-full w-9 items-center justify-center bg-gradient-to-l from-[var(--paper)] to-transparent text-xl text-[var(--ink)]/70 md:flex">›</button>}
    </section>
  );
}
