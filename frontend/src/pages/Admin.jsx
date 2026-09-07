import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { checkAuth, loginUser, logoutUser } from "../services/userService";
import { useAppContext } from "../context/AppContext";

const emptyProduct = { name: "", category: "", price: "", offerPrice: "", images: "", description: "", inStock: true };
const inputStyle = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-700";
const buttonStyle = "rounded-lg bg-green-800 px-5 py-2.5 text-white disabled:opacity-50 hover:bg-green-900";
const errorMessage = error => error?.response?.data?.message || "Unable to connect. Check that the backend is running.";

export default function Admin() {
  const { setUser, refreshProducts } = useAppContext();
  const [session, setSession] = useState(undefined);
  const [tab, setTab] = useState("Overview");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const verifySession = useCallback(async () => {
    setError("");
    try { const data = await checkAuth(); setSession(data.user); }
    catch (err) {
      setSession(null);
      if (err.response?.status !== 401) setError(errorMessage(err));
    }
  }, []);
  useEffect(() => { verifySession(); }, [verifySession]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [overview, catalog, accounts] = await Promise.all([
        api.get("/api/admin/overview"), api.get("/api/admin/products"), api.get("/api/admin/users"),
      ]);
      setStats(overview.data.stats);
      setProducts(catalog.data.products);
      setUsers(accounts.data.users);
    } catch (err) {
      if (err.response?.status === 401) setSession(null);
      if (err.response?.status === 403) await verifySession();
      setError(errorMessage(err));
    } finally { setLoading(false); }
  }, [verifySession]);
  useEffect(() => { if (session?.role === "admin") load(); }, [session, load]);

  const login = async event => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await loginUser({ email: email.trim().toLowerCase(), password });
      const data = await checkAuth();
      setSession(data.user);
      setUser(data.user);
      setPassword("");
      setShowPassword(false);
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  };
  const logout = async () => {
    setBusy(true);
    try { await logoutUser(); setSession(null); setUser(null); setProducts([]); setUsers([]); }
    catch (err) { toast.error(errorMessage(err)); }
    finally { setBusy(false); }
  };
  const editProduct = product => {
    setEditing(product._id);
    setForm({ ...product, images: product.image.join("\n"), description: product.description.join("\n") });
    setShowForm(true);
  };
  const saveProduct = async event => {
    event.preventDefault();
    setBusy(true);
    const data = {
      name: form.name, category: form.category, price: Number(form.price), offerPrice: Number(form.offerPrice),
      image: form.images.split("\n").map(s => s.trim()).filter(Boolean),
      description: form.description.split("\n").map(s => s.trim()).filter(Boolean), inStock: form.inStock,
    };
    try {
      if (editing) await api.put(`/api/admin/products/${editing}`, data);
      else await api.post("/api/admin/products", data);
      setShowForm(false);
      setEditing(null);
      setForm(emptyProduct);
      toast.success("Product saved");
      await load();
      await refreshProducts();
    } catch (err) { toast.error(errorMessage(err)); }
    finally { setBusy(false); }
  };
  const deleteProduct = async product => {
    if (!window.confirm(`Delete ${product.name}? This removes it from the storefront.`)) return;
    setBusy(true);
    try {
      await api.delete(`/api/admin/products/${product._id}`);
      toast.success("Product deleted");
      await load();
      await refreshProducts();
    } catch (err) { toast.error(errorMessage(err)); }
    finally { setBusy(false); }
  };

  if (session === undefined) return <div className="p-16 text-center" role="status">Checking admin access…</div>;
  if (!session || session.role !== "admin") return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-stone-200">
        <Link to="/" className="text-green-800 font-semibold">Ayurvedic / Administration</Link>
        <h1 className="text-3xl font-semibold mt-8 mb-2">{session ? "Admin access required" : "Welcome back"}</h1>
        <p className="text-stone-500 mb-6">{session ? "Your current account does not have admin access." : "Sign in with your administrator account."}</p>
        {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
        {session ? <button disabled={busy} onClick={logout} className={buttonStyle}>Sign out to switch accounts</button> : (
          <form onSubmit={login} className="space-y-5">
            <label className="block">Email<input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} /></label>
            <div>
              <label htmlFor="admin-password" className="block">Password</label>
              <div className="relative">
                <input id="admin-password" required type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={`${inputStyle} pr-20`} />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-controls="admin-password" onClick={() => setShowPassword(visible => !visible)} className="absolute inset-y-0 right-0 rounded-r-lg px-4 text-sm font-medium text-green-800 hover:text-green-950 focus-visible:outline-2 focus-visible:outline-green-700">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button disabled={busy} className={`${buttonStyle} w-full`}>{busy ? "Signing in…" : "Sign in"}</button>
          </form>
        )}
        <Link to="/" className="inline-block mt-6 text-sm text-stone-500 underline">Back to store</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 md:flex">
      <aside className="bg-green-950 text-white p-6 md:w-64 md:min-h-screen shrink-0">
        <Link to="/" className="text-2xl font-semibold">Ayurvedic<span className="block text-xs tracking-widest uppercase text-green-200 mt-2">Store administration</span></Link>
        <nav aria-label="Admin sections" className="flex md:flex-col gap-2 mt-8">
          {["Overview", "Products", "Users"].map(item => <button key={item} onClick={() => { setTab(item); setShowForm(false); }} aria-current={tab === item ? "page" : undefined} className={`text-left rounded-lg px-4 py-3 ${tab === item ? "bg-white/15" : "hover:bg-white/10"}`}>{item}</button>)}
        </nav>
        <Link to="/" className="block mt-10 text-green-200 text-sm">← View storefront</Link>
      </aside>
      <div className="flex-1 min-w-0 p-5 md:p-10">
        <header className="flex justify-between items-center gap-4 border-b border-stone-200 pb-6 mb-8">
          <div><p className="text-sm text-stone-500">Welcome, {session.name}</p><h1 className="text-3xl font-semibold mt-1">{tab}</h1></div>
          <button disabled={busy} onClick={logout} className="border border-stone-300 rounded-lg px-4 py-2">Sign out</button>
        </header>
        {error && <div role="alert" className="mb-5 p-4 rounded-lg bg-red-50 text-red-700">{error} <button onClick={load} className="underline" disabled={loading}>Retry</button></div>}
        {loading ? <p role="status">Loading store data…</p> : <>
          {tab === "Overview" && <>
            <div className="grid sm:grid-cols-3 gap-5">
              {[["Total products", stats?.products], ["In-stock products", stats?.inStock], ["Registered accounts", stats?.users]].map(([label, value]) => <div key={label} className="bg-white border border-stone-200 rounded-xl p-6"><p className="text-stone-500 text-sm">{label}</p><p className="text-4xl font-semibold mt-3">{value ?? "—"}</p></div>)}
            </div>
            <div className="mt-8 rounded-xl border border-stone-200 bg-white p-7"><h2 className="text-xl font-semibold">Manage your catalog</h2><p className="text-stone-500 mt-2 mb-5">Add products, update prices, and keep availability current.</p><button onClick={() => setTab("Products")} className={buttonStyle}>Manage products</button></div>
          </>}
          {tab === "Products" && <>
            <div className="flex flex-wrap justify-between gap-3 mb-6"><input aria-label="Search products" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} className={`${inputStyle} max-w-sm`} /><button className={buttonStyle} onClick={() => { setEditing(null); setForm(emptyProduct); setShowForm(true); }}>+ Add product</button></div>
            {showForm && <form onSubmit={saveProduct} className="bg-white rounded-xl border border-stone-200 p-6 mb-6 space-y-4">
              <h2 className="text-xl font-semibold">{editing ? "Edit product" : "New product"}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[["name", "Product name"], ["category", "Category"], ["price", "Regular price"], ["offerPrice", "Sale price"]].map(([key, label]) => <label key={key} className="block text-sm">{label}<input required maxLength={key === "name" ? 150 : key === "category" ? 60 : undefined} type={key.includes("rice") ? "number" : "text"} min="0" step="0.01" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className={inputStyle} /></label>)}
              </div>
              <label className="block text-sm">Image URLs (one HTTP or HTTPS URL per line)<textarea required rows={3} value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} className={inputStyle} /></label>
              <label className="block text-sm">Description (one point per line)<textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputStyle} /></label>
              <label className="flex gap-2 items-center"><input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} />In stock</label>
              <div className="flex gap-3"><button disabled={busy} className={buttonStyle}>{busy ? "Saving…" : "Save product"}</button><button type="button" disabled={busy} onClick={() => setShowForm(false)} className="px-4 py-2">Cancel</button></div>
            </form>}
            <div className="overflow-x-auto bg-white rounded-xl border border-stone-200"><table className="w-full text-left text-sm"><thead className="bg-stone-100"><tr>{["Product", "Category", "Price", "Availability", "Actions"].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead><tbody>
              {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => <tr key={p._id} className="border-t border-stone-100"><td className="p-4"><div className="flex items-center gap-3"><img src={p.image[0]} alt="" className="w-12 h-12 rounded object-cover" /><span>{p.name}</span></div></td><td className="p-4">{p.category}</td><td className="p-4">{p.offerPrice.toFixed(2)}</td><td className="p-4"><span className={`rounded-full px-3 py-1 whitespace-nowrap ${p.inStock ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-500"}`}>{p.inStock ? "In stock" : "Out of stock"}</span></td><td className="p-4 whitespace-nowrap"><button disabled={busy} onClick={() => editProduct(p)} className="text-green-800 mr-4">Edit</button><button disabled={busy} onClick={() => deleteProduct(p)} className="text-red-700">Delete</button></td></tr>)}
              {!products.some(p => p.name.toLowerCase().includes(search.toLowerCase())) && <tr><td colSpan={5} className="p-10 text-center text-stone-500">{search ? "No matching products." : "No products yet. Add your first product to publish it in the store."}</td></tr>}
            </tbody></table></div>
          </>}
          {tab === "Users" && <><p className="text-sm text-stone-500 mb-4">Latest 100 registered accounts</p><div className="overflow-x-auto bg-white border border-stone-200 rounded-xl"><table className="w-full text-left text-sm"><thead className="bg-stone-100"><tr>{["Name", "Email", "Role", "Joined"].map(label => <th className="p-4" key={label}>{label}</th>)}</tr></thead><tbody>{users.map(account => <tr key={account._id} className="border-t border-stone-100"><td className="p-4">{account.name}</td><td className="p-4">{account.email}</td><td className="p-4">{account.role || "user"}</td><td className="p-4">{new Date(account.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></>}
        </>}
      </div>
    </div>
  );
}
