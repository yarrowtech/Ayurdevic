import { Link } from "react-router-dom";
import ContactDetails from "../components/ContactDetails";

const faqs = [
  { q: "What payment methods do you accept?", a: <>We accept Cash on Delivery and Online Payment at checkout. See <Link to="/payment-methods" className="text-green-800 underline">Payment methods</Link> for details.</> },
  { q: "How long does delivery take?", a: <>Orders ship within 24–48 hours and typically arrive in 2–5 business days (5–8 for remote areas). Shipping is free over ₹999. See <Link to="/delivery-information" className="text-green-800 underline">Delivery information</Link>.</> },
  { q: "How do I track my order?", a: <>Sign in and open <Link to="/account?tab=orders" className="text-green-800 underline">My Account → Orders</Link> to see the status of every order you've placed.</> },
  { q: "What's your return policy?", a: <>Unopened items can be returned within 7 days of delivery; damaged or defective items can be returned any time within 48 hours of delivery. See <Link to="/returns" className="text-green-800 underline">Return &amp; refund policy</Link>.</> },
  { q: "Do I need an account to shop?", a: "You can browse and add items to your cart without one, but you'll need to sign in to check out, save addresses, and view order history." },
  { q: "How do I create an account?", a: "Click Login in the header and choose Create account, or use Continue with Google for a one-click sign-up." },
  { q: "I forgot my password — what do I do?", a: <>There's no automatic reset yet, so <Link to="/contact" className="text-green-800 underline">contact us</Link> and we'll help you regain access. If you originally signed up with Continue with Google, just sign in with Google again — there's no password to remember.</> },
  { q: "Can I change or cancel an order after placing it?", a: <><Link to="/contact" className="text-green-800 underline">Contact us</Link> as soon as possible with your order number — we can usually help before it ships.</> },
];

export default function Faq() {
  return <section className="mx-auto my-10 max-w-3xl sm:my-16">
    <p className="mb-2 text-sm font-medium text-green-800">Ayurvedic support</p>
    <h1 className="text-3xl font-semibold sm:text-4xl">Frequently asked questions</h1>
    <p className="mt-4 text-stone-600">Quick answers about orders, delivery, returns, and your account.</p>
    <div className="mt-8 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
      {faqs.map(({ q, a }) => (
        <details key={q} className="group p-5 sm:p-6">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium text-stone-800 marker:content-none">
            {q}
            <span aria-hidden="true" className="shrink-0 text-xl text-green-800 transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-stone-600">{a}</p>
        </details>
      ))}
    </div>
    <div className="mt-8">
      <p className="mb-3 text-sm font-medium text-stone-500">Didn't find your answer?</p>
      <ContactDetails />
    </div>
  </section>;
}
