import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../services/orderService";
import { getSupportReply } from "../services/supportChat";

const welcome = { role: "assistant", text: "Hello! Welcome to Ayurvedic support. I can help with your orders, delivery address, and shopping questions. How can I help you today?" };
const suggestions = ["Track my order", "Help with an address", "Browse products", "Returns & refunds", "Contact support"];

function ChatIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2v-10A8.5 8.5 0 0 1 10.5 3h2a8.5 8.5 0 0 1 8.5 8.5Z" /><path strokeLinecap="round" d="M7 10h9M7 14h6" /></svg>;
}

export default function SupportChat() {
  const [messages, setMessages] = useState([welcome]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(false);
  const transcript = useRef(null);
  const input = useRef(null);
  const email = import.meta.env.VITE_SUPPORT_EMAIL?.trim();
  const phone = import.meta.env.VITE_SUPPORT_PHONE?.trim();

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [messages, busy]);

  const send = async value => {
    const text = value.trim().slice(0, 500);
    if (!text || pending.current) return;
    pending.current = true;
    setBusy(true);
    setDraft("");
    setMessages(current => [...current, { role: "user", text }]);
    try {
      const reply = await getSupportReply(text, { getOrders });
      if (mounted.current) setMessages(current => [...current, { role: "assistant", ...reply }]);
    } catch {
      if (mounted.current) setMessages(current => [...current, { role: "assistant", text: "Sorry, something went wrong. Please try again or use the contact page." }]);
    } finally {
      pending.current = false;
      if (mounted.current) {
        setBusy(false);
        input.current?.focus();
      }
    }
  };

  return (
    <section aria-label="Support chat" className="max-w-2xl overflow-hidden rounded-2xl border border-green-900/10 bg-white shadow-sm">
      <header className="flex items-center gap-3 bg-green-900 px-4 py-5 text-white sm:px-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15"><ChatIcon /></span>
        <div className="min-w-0 flex-1"><h2 className="font-semibold">Ayurvedic assistant</h2><p className="mt-0.5 text-xs text-green-100">Automated help for your shopping</p></div>
        <button type="button" disabled={busy || messages.length === 1} onClick={() => { setMessages([welcome]); setDraft(""); input.current?.focus(); }} className="min-h-11 rounded-lg px-3 text-xs hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40">New chat</button>
      </header>

      <div ref={transcript} role="log" aria-label="Chat messages" aria-live="polite" aria-relevant="additions" tabIndex={0} className="h-80 space-y-5 overflow-y-auto overscroll-contain bg-stone-50/80 p-4 sm:h-96 sm:p-6">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words sm:max-w-[85%] ${message.role === "user" ? "rounded-br-sm bg-green-800 text-white" : "rounded-bl-sm border border-stone-200 bg-white text-stone-700"}`}>
              <p className={`mb-1 text-xs font-semibold ${message.role === "user" ? "text-green-100" : "text-green-800"}`}>{message.role === "user" ? "You" : "Ayurvedic assistant"}</p>
              <p className="whitespace-pre-wrap">{message.text}</p>
              {message.actions && <div className="mt-3 flex flex-wrap gap-2">{message.actions.map(item => <Link key={item.to} to={item.to} className="inline-flex min-h-11 items-center rounded-lg border border-green-800/20 px-3 text-xs font-medium text-green-800 hover:bg-green-50">{item.label}</Link>)}</div>}
            </div>
          </div>
        ))}
        {busy && <p role="status" className="text-xs text-stone-500">Assistant is checking...</p>}
      </div>

      <div className="border-t border-stone-100 p-4 sm:px-6">
        <div aria-label="Suggested questions" className="mb-4 flex flex-wrap gap-2">{suggestions.map(label => <button key={label} type="button" disabled={busy} onClick={() => send(label)} className="min-h-11 rounded-full border border-green-800/20 bg-green-50/60 px-3 py-2 text-xs text-green-900 hover:bg-green-100 disabled:opacity-50">{label}</button>)}</div>
        <form onSubmit={event => { event.preventDefault(); send(draft); }} className="flex items-center gap-2">
          <label htmlFor="support-message" className="sr-only">Your message</label>
          <input ref={input} id="support-message" value={draft} onChange={event => setDraft(event.target.value)} maxLength={500} autoComplete="off" placeholder="Type your question..." className="min-h-12 min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-green-700" />
          <button type="submit" disabled={busy || !draft.trim()} className="min-h-12 rounded-xl bg-green-800 px-4 text-sm font-medium text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-40">Send</button>
        </form>
        <p className="mt-3 text-xs text-stone-500">Automated replies. This chat doesn't connect to a live agent.</p>
        <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-green-800">
          <Link to="/contact" className="inline-flex min-h-11 items-center underline">Contact the store</Link>
          {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "") && <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center underline">Email support</a>}
          {phone && <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="inline-flex min-h-11 items-center underline">Call support</a>}
        </div>
      </div>
    </section>
  );
}
