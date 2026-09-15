import { useEffect, useRef } from "react";

// Generic confirmation dialog for destructive/important admin actions —
// replaces native window.confirm() with a styled, accessible modal.
export default function ConfirmDialog({ title, description, confirmLabel = "Confirm", busyLabel, danger = true, busy, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    cancelRef.current.focus();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      aria-busy={busy}
      onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-0 text-stone-800 shadow-2xl backdrop:bg-stone-950/45 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        {danger && (
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
            </svg>
          </div>
        )}
        <h2 id="confirm-dialog-title" className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p id="confirm-dialog-description" className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-stone-100 bg-stone-50 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
        <button ref={cancelRef} type="button" disabled={busy} onClick={onCancel} className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 disabled:opacity-50">Cancel</button>
        <button type="button" disabled={busy} onClick={onConfirm} className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60 ${danger ? "bg-red-700 hover:bg-red-800 focus-visible:outline-red-700" : "bg-green-800 hover:bg-green-900 focus-visible:outline-green-800"}`}>
          {busy && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />}
          {busy ? (busyLabel || "Working…") : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
