import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const STORAGE_KEY = 'promo-popup-dismissed';

export default function PromoPopup() {
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try { if (sessionStorage.getItem(STORAGE_KEY)) return; } catch { /* storage unavailable; show once for this page load */ }
    api.get('/api/promos').then(({ data }) => {
      if (cancelled || !data.promos?.length) return;
      setQueue(data.promos);
      setTimeout(() => { if (!cancelled) setOpen(true); }, 600);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const dismissAll = useCallback(() => {
    setOpen(false);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
  }, []);
  const advance = useCallback(() => {
    setIndex(current => { if (current + 1 < queue.length) return current + 1; dismissAll(); return current; });
  }, [queue.length, dismissAll]);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = event => { if (event.key === 'Escape') advance(); };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKeyDown); };
  }, [open, advance]);

  if (!open || !queue.length) return null;
  const promo = queue[index];
  const internal = promo.ctaLink?.startsWith('/');
  const ctaStyle = `inline-flex min-h-11 items-center justify-center px-6 py-3 text-lg font-medium transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-[-4px] ${promo.image ? 'w-full' : 'mt-10 rounded-lg'}`;
  const buttonColors = { backgroundColor: promo.buttonColor || (promo.image ? '#1c1917' : '#ffffff'), color: promo.buttonTextColor || (promo.image ? '#ffffff' : '#14532d') };

  return (
    <div role="presentation" onClick={advance} className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={promo.image ? undefined : 'promo-title'}
        aria-label={promo.image ? (promo.title || 'Promotion') : undefined}
        onClick={event => event.stopPropagation()}
        className={`relative max-h-[90dvh] overflow-y-auto rounded-2xl shadow-2xl ${promo.image ? 'w-fit max-w-full' : 'w-full max-w-2xl'}`}
        style={{ background: promo.image ? 'transparent' : 'linear-gradient(135deg, var(--herbal), var(--herbal-dark))' }}
      >
        <button type="button" aria-label="Close" onClick={advance} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-2xl text-white shadow-sm hover:bg-black/80">×</button>
        {promo.image && <img src={promo.image} alt={promo.title || 'Promotion'} className="mx-auto block h-auto max-h-[calc(90dvh-4rem)] w-auto max-w-full" />}
        <div className={promo.image ? 'text-center' : 'px-8 py-16 text-center text-white sm:px-16 sm:py-20'}>
          {!promo.image && <>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">Limited time</p>
          <h2 id="promo-title" className="mt-5 font-heading text-4xl leading-tight sm:text-6xl">{promo.title}</h2>
          {promo.subtitle && <p className="mx-auto mt-5 max-w-md text-lg text-white/90 sm:text-xl">{promo.subtitle}</p>}
          </>}
          {internal ? (
            <Link to={promo.ctaLink} onClick={dismissAll} className={ctaStyle} style={buttonColors}>{promo.ctaText}</Link>
          ) : (
            <a href={promo.ctaLink} target="_blank" rel="noopener noreferrer" onClick={dismissAll} className={ctaStyle} style={buttonColors}>{promo.ctaText}</a>
          )}
          {!promo.image && queue.length > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {queue.map((item, i) => <span key={item._id} className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
