import { Link } from "react-router-dom";
import ContactDetails from "../components/ContactDetails";

const sections = [
  { title: "Return window", body: "Unopened, unused items can be returned within 7 days of delivery. Perishable and personal-care items that have been opened cannot be returned unless they arrived damaged or defective." },
  { title: "Damaged or wrong items", body: "If an item arrives damaged, defective, or different from what you ordered, contact us within 48 hours of delivery with your order details and we'll arrange a replacement or refund." },
  { title: "How refunds work", body: "Once a return is received and inspected, refunds are issued to your original payment method (or as store credit for Cash on Delivery orders) within 5–7 business days." },
  { title: "Starting a return", body: "Contact us with your order number and the reason for the return, and we'll share the next steps." },
];

export default function Returns() {
  return <section className="mx-auto my-10 max-w-3xl sm:my-16">
    <p className="mb-2 text-sm font-medium text-green-800">Ayurvedic support</p>
    <h1 className="text-3xl font-semibold sm:text-4xl">Return &amp; refund policy</h1>
    <p className="mt-4 text-stone-600">How returns, replacements, and refunds work.</p>
    <div className="mt-8 space-y-5">
      {sections.map(section => (
        <div key={section.title} className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="font-medium text-stone-800">{section.title}</h2>
          <p className="mt-2 text-stone-600">{section.body}</p>
        </div>
      ))}
    </div>
    <div className="mt-8">
      <p className="mb-3 text-sm font-medium text-stone-500">Ready to start a return, or have a question?</p>
      <ContactDetails />
    </div>
    <Link to="/account?tab=orders" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-green-800 px-5 text-white hover:bg-green-900">View your orders</Link>
  </section>;
}
