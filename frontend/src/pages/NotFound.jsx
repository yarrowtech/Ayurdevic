import { Link } from "react-router-dom";

export default function NotFound() {
  return <section className="mx-auto my-16 max-w-xl text-center">
    <p className="text-sm text-green-800">404</p>
    <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
    <p className="mt-4 text-stone-600">This page is unavailable. You can return to the store to continue browsing.</p>
    <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-green-800 px-5 text-white">Back to store</Link>
  </section>;
}
