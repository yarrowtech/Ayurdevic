import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const tones = {
  herbal: 'from-[#d7ecb4] to-[#efe7d1]',
  clay: 'from-[#f3e6c8] to-[#e8d6ae]',
};

// Shared "Trending Deals"-style rail: a tinted panel with a heading, a
// link to the full catalog, and a horizontally scrolling row of products.
export default function ProductRail({ title, products, viewAllTo = '/products', tone = 'herbal' }) {
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
  }, [measure, products.length]);

  if (!products.length) return null;
  const nudge = direction => track.current?.scrollBy({ left: direction * 320, behavior: 'smooth' });
  const headingId = `${title.replace(/\s+/g, '-').toLowerCase()}-rail-title`;

  return (
    <section aria-labelledby={headingId} className="mt-16">
      <div className={`rounded-2xl border border-[var(--clay)]/70 bg-gradient-to-br ${tones[tone] || tones.herbal} p-4 shadow-sm sm:p-6`}>
        <div className="flex items-center justify-between gap-4">
          <h2 id={headingId} className="font-heading text-xl text-[var(--ink)] sm:text-2xl">{title}</h2>
          <Link
            to={viewAllTo}
            onClick={() => scrollTo(0, 0)}
            aria-label={`See all ${title.toLowerCase()}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--herbal)] text-white shadow-sm transition hover:bg-[var(--herbal-dark)]"
          >
            →
          </Link>
        </div>

        <div className="relative mt-4">
          {overflowing && <button type="button" aria-label={`Scroll ${title.toLowerCase()} left`} onClick={() => nudge(-1)} className="absolute -left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--clay)] bg-white text-lg shadow md:flex">‹</button>}
          <ul ref={track} className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4">
            {products.map(product => (
              <li key={product._id} className="flex w-40 shrink-0 sm:w-48">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
          {overflowing && <button type="button" aria-label={`Scroll ${title.toLowerCase()} right`} onClick={() => nudge(1)} className="absolute -right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--clay)] bg-white text-lg shadow md:flex">›</button>}
        </div>
      </div>
    </section>
  );
}
