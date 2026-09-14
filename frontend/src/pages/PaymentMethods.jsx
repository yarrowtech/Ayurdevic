import { Link } from "react-router-dom";
import ContactDetails from "../components/ContactDetails";

const methods = [
  { title: "Cash on Delivery (COD)", body: "Pay in cash when your order is delivered. Available on all orders unless noted otherwise at checkout." },
  { title: "Online Payment", body: "Pay securely at checkout using your preferred method. Your payment is confirmed before the order is shipped." },
];

export default function PaymentMethods() {
  return <section className="mx-auto my-10 max-w-3xl sm:my-16">
    <p className="mb-2 text-sm font-medium text-green-800">Ayurvedic support</p>
    <h1 className="text-3xl font-semibold sm:text-4xl">Payment methods</h1>
    <p className="mt-4 text-stone-600">Choose how you'd like to pay when you check out.</p>
    <div className="mt-8 space-y-5">
      {methods.map(method => (
        <div key={method.title} className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="font-medium text-stone-800">{method.title}</h2>
          <p className="mt-2 text-stone-600">{method.body}</p>
        </div>
      ))}
    </div>
    <div className="mt-8">
      <p className="mb-3 text-sm font-medium text-stone-500">Questions about a payment or a charge?</p>
      <ContactDetails />
    </div>
    <Link to="/cart" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-green-800 px-5 text-white hover:bg-green-900">Go to cart</Link>
  </section>;
}
