import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ContactDetails from "./ContactDetails";

export default function ContactModal({ onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return createPortal(
    <dialog ref={dialog} aria-labelledby="contact-title" aria-describedby="contact-description" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-green-900/10 bg-white p-0 font-body text-ink shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4 border-b border-stone-100 p-5 sm:p-6">
        <div><p className="text-sm font-medium text-green-800">Ayurvedic support</p><h2 id="contact-title" className="mt-1 text-2xl font-semibold">Contact us</h2></div>
        <button type="button" autoFocus onClick={onClose} aria-label="Close contact details" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-green-800">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <div className="space-y-5 p-5 sm:p-6"><p id="contact-description" className="text-sm leading-relaxed text-stone-600">Have a question about a product, your order, or delivery? Reach the store using the details below.</p><ContactDetails /><button type="button" onClick={onClose} className="min-h-11 w-full rounded-xl bg-green-800 px-5 text-white hover:bg-green-900">Done</button></div>
    </dialog>, document.body,
  );
}
