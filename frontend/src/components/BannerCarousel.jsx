import { getProductPrice } from "../services/productPrice";
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const defaultSlides = [
  { title: 'Serenity, the Ayurvedic way', text: 'Hand-poured aromatherapy candles in reusable ceramic jars', cta: 'Shop Now', to: '/products', from: 'var(--herbal)', to2: 'var(--herbal-dark)', ink: '#ffffff' },
  { title: 'Small-batch. Clean ingredients.', text: 'Therapeutic blends crafted to calm your space and mind', cta: 'Explore Collections', to: '/products', from: '#E6DCC6', to2: '#d8c9a6', ink: 'var(--ink)' },
  { title: 'Free shipping over ₹999', text: 'Ships in 24–48 hours across India', cta: 'Browse Deals', to: '/products', from: '#dff0c8', to2: '#c7e39c', ink: 'var(--ink)' },
];

export default function BannerCarousel() {
  const { products, currency } = useAppContext();
  const featured = products.filter(product => product.showInBanner && product.inStock);
  const slides = featured.length ? featured.map(product => ({
    title: product.name, text: product.description?.[0] || '', image: product.image?.[0],
    price: getProductPrice(product), regularPrice: product.price,
    discount: product.price > 0 && getProductPrice(product) >= 0 && getProductPrice(product) < product.price
      ? Math.round((product.price - getProductPrice(product)) / product.price * 100) : 0,
    cta: 'View product', to: `/products/${encodeURIComponent(product.category.toLowerCase())}/${product._id}`,
    from: '#ffffff', to2: '#ffffff', ink: 'var(--ink)',
  })) : defaultSlides;
  const track = useRef(null);
  const paused = useRef(false);
  const stops = useRef([0]);
  const [navigation, setNavigation] = useState({ active: 0, count: 1 });
  const [autoPlay, setAutoPlay] = useState(() => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const moveTo = index => {
    const positions = stops.current;
    const target = ((index % positions.length) + positions.length) % positions.length;
    track.current?.scrollTo({ left: positions[target], behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    const element = track.current;
    const update = () => {
      const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
      const cards = [...element.children];
      const start = cards[0]?.offsetLeft || 0;
      stops.current = [...new Set(cards.map(card => Math.min(card.offsetLeft - start, maxScroll)))];
      if (!stops.current.length) stops.current = [0];
      const active = stops.current.reduce((best, value, index) => Math.abs(value - element.scrollLeft) < Math.abs(stops.current[best] - element.scrollLeft) ? index : best, 0);
      setNavigation(current => current.active === active && current.count === stops.current.length ? current : { active, count: stops.current.length });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, [slides.length]);

  useEffect(() => {
    if (!autoPlay || navigation.count < 2) return;
    const timer = setInterval(() => {
      if (!paused.current && document.visibilityState === 'visible') moveTo(navigation.active + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay, navigation.active, navigation.count]);

  return <section aria-roledescription="carousel" aria-label="Promotions" className="relative mx-auto mt-4 w-full"
    onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}
    onTouchStart={() => { paused.current = true; }}
    onFocusCapture={() => { paused.current = true; }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) paused.current = false; }}>
    <div className="relative">
      <div ref={track} tabIndex={0} aria-label="Promotional banners" className="promotion-track" onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); moveTo(navigation.active + (event.key === 'ArrowRight' ? 1 : -1)); }
      }}>
        {slides.map((slide, index) => <article key={slide.to + index} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}
          className={`promotion-card ${slide.image ? 'promotion-card-with-image promotion-card-product' : ''}`} style={{ background: `linear-gradient(120deg, ${slide.from}, ${slide.to2})`, color: slide.ink }}>
          <div className="relative z-10 flex min-w-0 flex-col items-start justify-center gap-3">
            <h2 className="line-clamp-3 break-words font-heading text-xl leading-tight sm:text-2xl" title={slide.title}>{slide.title}</h2>
            {slide.text && <p className="line-clamp-2 break-words text-xs opacity-90 sm:text-sm">{slide.text}</p>}
            {slide.price != null && <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="whitespace-nowrap text-xl font-bold text-[var(--herbal-dark)]">{currency}{Number(slide.price).toLocaleString('en-IN')}</span>
              {slide.regularPrice > slide.price && <span className="whitespace-nowrap text-xs line-through opacity-60">{currency}{Number(slide.regularPrice).toLocaleString('en-IN')}</span>}
              {slide.discount > 0 && <span className="whitespace-nowrap rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">{slide.discount}% OFF</span>}
            </div>}
            <Link to={slide.to} onClick={() => scrollTo(0, 0)} className={`inline-flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold shadow-sm sm:text-sm ${slide.image ? 'bg-[var(--herbal)] text-white hover:bg-[var(--herbal-dark)]' : 'bg-white/95 text-green-900 hover:bg-white'}`}>{slide.cta}</Link>
          </div>
          {slide.image && <Link to={slide.to} aria-label={`View ${slide.title}`} className="flex h-48 min-w-0 items-center justify-center self-center sm:h-60"><img src={slide.image} alt={slide.title} className="h-full w-full object-contain" /></Link>}
        </article>)}
      </div>
    </div>
    {navigation.count > 1 && <div className="mt-1 flex items-center justify-between gap-2">
      <button type="button" aria-label="Previous slide" onClick={() => moveTo(navigation.active - 1)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-xl text-green-900">‹</button>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center">
      {Array.from({ length: navigation.count }, (_, index) => <button key={index} type="button" aria-label={`Go to slide ${index + 1}`} aria-current={index === navigation.active} onClick={() => moveTo(index)} className="flex h-11 w-6 items-center justify-center"><span className={`h-1.5 rounded-full ${index === navigation.active ? 'w-5 bg-green-800' : 'w-1.5 bg-stone-300'}`} /></button>)}
      <button type="button" onClick={() => setAutoPlay(current => !current)} className="min-h-11 px-2 text-xs text-green-800">{autoPlay ? 'Pause slideshow' : 'Play slideshow'}</button>
      </div>
      <button type="button" aria-label="Next slide" onClick={() => moveTo(navigation.active + 1)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-xl text-green-900">›</button>
    </div>}
  </section>;
}
