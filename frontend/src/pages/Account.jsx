import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import { addAddress, deleteAddress, getAddresses, updateAddress } from "../services/addressService";
import { getOrders } from "../services/orderService";
import { getCurrentAddress } from "../services/locationService";
import SupportChat from "../components/SupportChat";

const tabs = ["Profile", "Addresses", "Orders", "Support"];
const emptyAddress = { label: "Home", line1: "", line2: "", city: "", state: "", postalCode: "", country: "India", phone: "", isDefault: false };
const inputStyle = "mt-1 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-700";
const errorMessage = error => error?.response?.data?.message || "Unable to connect. Please try again.";

function AddressForm({ initial, busy, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationError, setLocationError] = useState("");
  const locationRequest = useRef(null);
  useEffect(() => () => locationRequest.current?.abort(), []);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const useCurrentLocation = async () => {
    if (locationRequest.current || busy) return;
    const controller = new AbortController();
    locationRequest.current = controller;
    const snapshot = { ...form };
    setLocating(true);
    setLocationError("");
    setLocationMessage("Finding your location...");
    try {
      const address = await getCurrentAddress(controller.signal);
      if (controller.signal.aborted) return;
      setForm(current => {
        const next = { ...current };
        for (const [key, value] of Object.entries(address)) {
          // Keep any edits made while the location request was running.
          if (current[key] === snapshot[key]) next[key] = value;
        }
        return next;
      });
      setLocationMessage("Location found. Check the address and add any missing house, apartment, or postal details before saving.");
    } catch (error) {
      if (controller.signal.aborted) return;
      setLocationMessage("");
      setLocationError(error.message);
    } finally {
      if (!controller.signal.aborted) {
        locationRequest.current = null;
        setLocating(false);
      }
    }
  };
  return (
    <form onSubmit={event => { event.preventDefault(); if (!locating && !busy) onSave(form); }} className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
      <div className="space-y-2 rounded-lg bg-green-50 p-4">
        <button type="button" disabled={busy || locating} onClick={useCurrentLocation} className="min-h-11 rounded-lg border border-green-800 px-4 font-medium text-green-800 hover:bg-green-100 disabled:opacity-50">
          {locating ? "Finding location..." : "Use current location"}
        </button>
        <p className="text-xs text-stone-600">Allow location access to fill your address. Your coordinates are shared with Photon for address lookup.</p>
        <p className="text-xs text-stone-500">Address data: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap contributors</a></p>
        {locationMessage && <p role="status" className="text-sm text-green-800">{locationMessage}</p>}
        {locationError && <p role="alert" className="text-sm text-red-700">{locationError}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">Label<input value={form.label} onChange={e => set("label", e.target.value)} placeholder="Home, Work…" maxLength={40} className={inputStyle} /></label>
        <label className="block text-sm">Phone<input required type="tel" inputMode="numeric" autoComplete="tel-national" minLength={10} maxLength={10} pattern="[0-9]{10}" title="Enter exactly 10 digits without a country code." placeholder="10-digit phone number" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} className={inputStyle} /></label>
      </div>
      <label className="block text-sm">Address line<input required value={form.line1} onChange={e => set("line1", e.target.value)} maxLength={200} className={inputStyle} /></label>
      <label className="block text-sm">Apartment, suite, etc. (optional)<input value={form.line2} onChange={e => set("line2", e.target.value)} maxLength={200} className={inputStyle} /></label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">City<input required value={form.city} onChange={e => set("city", e.target.value)} maxLength={100} className={inputStyle} /></label>
        <label className="block text-sm">State<input required value={form.state} onChange={e => set("state", e.target.value)} maxLength={100} className={inputStyle} /></label>
        <label className="block text-sm">Postal code<input required value={form.postalCode} onChange={e => set("postalCode", e.target.value)} maxLength={12} className={inputStyle} /></label>
      </div>
      <label className="block text-sm">Country<input required value={form.country} onChange={e => set("country", e.target.value)} maxLength={60} className={inputStyle} /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={e => set("isDefault", e.target.checked)} />Set as default address</label>
      <div className="flex flex-wrap gap-3">
        <button disabled={busy || locating} className="min-h-11 rounded-lg bg-green-800 px-5 text-white hover:bg-green-900 disabled:opacity-50">{busy ? "Saving…" : "Save address"}</button>
        <button type="button" disabled={busy} onClick={onCancel} className="min-h-11 px-3 text-stone-600">Cancel</button>
      </div>
    </form>
  );
}

function AddressesTab() {
  const [addresses, setAddresses] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try { setAddresses((await getAddresses()).addresses); }
    catch (err) { setError(errorMessage(err)); }
  };
  useEffect(() => { load(); }, []);

  const save = async data => {
    setBusy(true);
    try {
      const response = editing ? await updateAddress(editing, data) : await addAddress(data);
      setAddresses(response.addresses);
      setShowForm(false);
      setEditing(null);
      toast.success("Address saved");
    } catch (err) { toast.error(errorMessage(err)); }
    finally { setBusy(false); }
  };
  const remove = async addressId => {
    if (!window.confirm("Delete this address?")) return;
    setBusy(true);
    try { setAddresses((await deleteAddress(addressId)).addresses); toast.success("Address deleted"); }
    catch (err) { toast.error(errorMessage(err)); }
    finally { setBusy(false); }
  };

  if (error) return <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;
  if (!addresses) return <p role="status" className="text-stone-500">Loading addresses…</p>;

  return (
    <div className="space-y-4">
      {!showForm && <button onClick={() => { setEditing(null); setShowForm(true); }} className="min-h-11 rounded-lg bg-green-800 px-5 text-white hover:bg-green-900">+ Add address</button>}
      {showForm && <AddressForm key={editing || "new"} initial={editing ? addresses.find(a => a._id === editing) : emptyAddress} busy={busy} onCancel={() => { setShowForm(false); setEditing(null); }} onSave={save} />}
      {addresses.length === 0 && !showForm && <p className="text-stone-500">You haven't saved any addresses yet.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map(address => (
          <div key={address._id} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{address.label || "Address"}</p>
              {address.isDefault && <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Default</span>}
            </div>
            <p className="mt-2 text-sm text-stone-600">{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
            <p className="text-sm text-stone-600">{address.city}, {address.state} {address.postalCode}</p>
            <p className="text-sm text-stone-600">{address.country}</p>
            <p className="mt-1 text-sm text-stone-600">{address.phone}</p>
            <div className="mt-3 flex gap-4 text-sm">
              <button disabled={busy} onClick={() => { setEditing(address._id); setShowForm(true); }} className="text-green-800 disabled:opacity-50">Edit</button>
              <button disabled={busy} onClick={() => remove(address._id)} className="text-red-700 disabled:opacity-50">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ user, logout }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="max-w-md space-y-6 rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
      <div>
        <p className="text-sm text-stone-500">Name</p>
        <p className="text-lg font-medium">{user.name}</p>
      </div>
      <div>
        <p className="text-sm text-stone-500">Email</p>
        <p className="break-all text-lg font-medium">{user.email}</p>
      </div>
      <button disabled={busy} onClick={async () => { setBusy(true); await logout(); }} className="min-h-11 rounded-lg border border-stone-300 px-5 text-stone-700 hover:bg-stone-50 disabled:opacity-50">{busy ? "Signing out…" : "Sign out"}</button>
    </div>
  );
}

const statusStyle = { Placed: "bg-amber-100 text-amber-800", Confirmed: "bg-blue-100 text-blue-800", Shipped: "bg-blue-100 text-blue-800", Delivered: "bg-green-100 text-green-800", Cancelled: "bg-stone-100 text-stone-500" };

function OrdersTab() {
  const { currency } = useAppContext();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { getOrders().then(data => setOrders(data.orders)).catch(err => setError(errorMessage(err))); }, []);

  if (error) return <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;
  if (!orders) return <p role="status" className="text-stone-500">Loading orders…</p>;

  if (!orders.length) return (
    <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
      <p className="text-lg font-medium">No orders yet</p>
      <p className="mt-2 text-stone-600">Your order history will show up here once you place an order.</p>
      <Link to="/products" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-green-800 px-5 text-white hover:bg-green-900">Start shopping</Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order._id} className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-stone-500">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
            <span className={`rounded-full px-3 py-1 text-xs whitespace-nowrap ${statusStyle[order.status] || "bg-stone-100 text-stone-500"}`}>{order.status}</span>
          </div>
          <ul className="mt-3 space-y-1">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-3 text-sm text-stone-600">
                <span className="truncate">{item.name} × {item.quantity}</span>
                <span className="shrink-0">{currency}{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-stone-100 pt-3 font-medium">
            <span>Total</span><span>{currency}{order.total.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-sm text-stone-500">Delivering to {order.address.line1}, {order.address.city} · {order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online"}</p>
        </div>
      ))}
    </div>
  );
}

export default function Account() {
  const { user, logout, setShowUserLogin } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = tabs.find(item => item.toLowerCase() === searchParams.get("tab")?.toLowerCase());
  const [tab, setTab] = useState(requestedTab || "Profile");
  useEffect(() => { if (requestedTab) setTab(requestedTab); }, [requestedTab]);
  const selectTab = item => { setTab(item); setSearchParams(item === "Profile" ? {} : { tab: item.toLowerCase() }, { replace: true }); };

  if (!user) return (
    <div className="mx-auto my-16 max-w-md text-center">
      <h1 className="text-2xl font-semibold">Sign in to view your account</h1>
      <p className="mt-2 text-stone-600">Order history, saved addresses, and support are available once you're signed in.</p>
      <button onClick={() => setShowUserLogin(true)} className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-green-800 px-6 text-white hover:bg-green-900">Sign in</button>
    </div>
  );

  return (
    <div className="my-8 sm:my-12">
      <h1 className="text-2xl font-semibold sm:text-3xl">My Account</h1>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <nav aria-label="Account sections" className="flex gap-2 overflow-x-auto lg:w-52 lg:shrink-0 lg:flex-col">
          {tabs.map(item => (
            <button key={item} onClick={() => selectTab(item)} aria-current={tab === item ? "page" : undefined}
              className={`min-h-11 shrink-0 rounded-lg px-4 text-left ${tab === item ? "bg-green-800 text-white" : "text-stone-700 hover:bg-stone-100"}`}>
              {item}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          {tab === "Profile" && <ProfileTab user={user} logout={logout} />}
          {tab === "Addresses" && <AddressesTab />}
          {tab === "Orders" && <OrdersTab />}
          {tab === "Support" && <SupportChat />}
        </div>
      </div>
    </div>
  );
}
