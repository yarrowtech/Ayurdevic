import { Link } from "react-router-dom";
import ContactDetails from "../components/ContactDetails";

const sections = [
  { title: "Delivery timelines", body: "Orders are shipped within 24–48 hours of confirmation. Delivery typically takes 2–5 business days depending on your location, and 5–8 business days for remote areas." },
  { title: "Shipping fees", body: "Shipping is free on orders over ₹999. Orders below that amount may carry a small shipping fee shown at checkout before you place the order." },
  { title: "Order tracking", body: "Once your order ships, its status is visible any time from your account's order history." },
  { title: "Delivery attempts", body: "Our delivery partner will attempt delivery to the address on your order. If nobody is available, they will reattempt or leave instructions for pickup." },
];

export default function DeliveryInformation() {
  return <section className="mx-auto my-10 max-w-3xl sm:my-16">
    <p className="mb-2 text-sm font-medium text-green-800">Ayurvedic support</p>
    <h1 className="text-3xl font-semibold sm:text-4xl">Delivery information</h1>
    <p className="mt-4 text-stone-600">What to expect once you place an order.</p>
    <div className="mt-8 space-y-5">
      {sections.map(section => (
        <div key={section.title} className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="font-medium text-stone-800">{section.title}</h2>
          <p className="mt-2 text-stone-600">{section.body}</p>
        </div>
      ))}
    </div>
    <div className="mt-8">
      <p className="mb-3 text-sm font-medium text-stone-500">Still have a question about your delivery?</p>
      <ContactDetails />
    </div>
    <Link to="/account?tab=orders" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-green-800 px-5 text-white hover:bg-green-900">Track your order</Link>
  </section>;
}
