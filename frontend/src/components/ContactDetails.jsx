export default function ContactDetails() {
  const email = import.meta.env.VITE_SUPPORT_EMAIL?.trim();
  const phone = import.meta.env.VITE_SUPPORT_PHONE?.trim();
  const address = import.meta.env.VITE_SUPPORT_ADDRESS?.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
  return (
    <div className="space-y-4">
      {address && <div className="rounded-xl border border-green-900/10 bg-green-50/60 p-4"><h3 className="text-sm text-stone-500">Address</h3><p className="mt-2 break-words font-medium text-stone-700">{address}</p></div>}
      {email && <div className="rounded-xl border border-green-900/10 bg-green-50/60 p-4"><h3 className="text-sm text-stone-500">Email us</h3>{validEmail ? <a href={`mailto:${email}`} className="inline-flex min-h-11 max-w-full items-center break-all font-medium text-green-800 underline">{email}</a> : <p className="mt-2 break-all font-medium text-stone-700">{email}</p>}</div>}
      {phone && <div className="rounded-xl border border-green-900/10 bg-green-50/60 p-4"><h3 className="text-sm text-stone-500">Call us</h3><a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="inline-flex min-h-11 max-w-full items-center break-all font-medium text-green-800 underline">{phone}</a></div>}
      {!email && !phone && !address && <p className="rounded-xl bg-stone-50 p-4 text-stone-600">Our contact details will be available here soon.</p>}
    </div>
  );
}
