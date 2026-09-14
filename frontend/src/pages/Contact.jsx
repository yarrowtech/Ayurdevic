import { Link } from "react-router-dom";
import ContactDetails from "../components/ContactDetails";

export default function Contact() {
  return <section className="mx-auto my-10 max-w-3xl sm:my-16">
    <p className="mb-2 text-sm font-medium text-green-800">Ayurvedic support</p>
    <h1 className="text-3xl font-semibold sm:text-4xl">Contact us</h1>
    <p className="mt-4 text-stone-600">For questions about products, your order, or delivery, contact our store.</p>
    <div className="mt-8 space-y-5 rounded-xl border border-stone-200 bg-white p-5 sm:p-8">
      <ContactDetails />
    </div>
    <Link to="/products" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-green-800 px-5 text-white">Browse products</Link>
  </section>;
}
