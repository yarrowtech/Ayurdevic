import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { checkAuth, loginUser, logoutUser } from "../services/userService";
import { useAppContext } from "../context/AppContext";
import AdminCategories from "../components/AdminCategories";

const emptyProduct = { name: "", category: "", price: "", offerPrice: "", images: "", description: "", inStock: true, showInBanner: false, isBestSeller: false };
const inputStyle = "min-w-0 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-700";
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
  const [uploading, setUploading] = useState(false);
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  useEffect(() => {
    if (session?.role === "admin" && tab === "Products") {
      api.get("/api/admin/categories").then(({ data }) => setCategoryOptions(data.categories)).catch(err => toast.error(errorMessage(err)));
    }
  }, [session, tab]);
  const imageUrls = form.images.split("\n").map(url => url.trim()).filter(Boolean);

  const uploadImages = async event => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (imageUrls.length + files.length > 8) return toast.error("You can add up to 8 images per product.");
    if (files.some(file => !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type))) {
      return toast.error("Choose JPEG, PNG, GIF, or WebP images.");
    }
    if (files.some(file => file.size > 5 * 1024 * 1024)) return toast.error("Each image must be 5 MB or smaller.");
    setUploading(true);
    let uploaded = 0;
    try {
      for (const file of files) {
        const response = await api.post("/api/admin/images", file, { headers: { "Content-Type": file.type } });
        const url = new URL(response.data.path, new URL(api.defaults.baseURL, window.location.origin)).href;
        setForm(current => ({ ...current, images: [...current.images.split("\n").map(s => s.trim()).filter(Boolean), url].join("\n") }));
        uploaded++;
      }
      toast.success(`${uploaded} image${uploaded === 1 ? "" : "s"} uploaded`);
    } catch (err) {
      toast.error(`${uploaded ? `${uploaded} uploaded. ` : ""}${errorMessage(err)}`);
    } finally { setUploading(false); }
  };

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
    setForm({
      name: product.name ?? "", category: product.category ?? "",
      price: product.price ?? "", offerPrice: product.offerPrice ?? "",
      images: (product.image ?? []).join("\n"), description: (product.description ?? []).join("\n"),
      inStock: product.inStock ?? true,
      showInBanner: product.showInBanner ?? false,
      isBestSeller: product.isBestSeller ?? false,
    });
    setShowForm(true);
  };
  const saveProduct = async event => {
    event.preventDefault();
    if (uploading) return;
    if (!imageUrls.length || imageUrls.length > 8) return toast.error("Add between 1 and 8 images.");
    setBusy(true);
    const data = {
      name: form.name, category: form.category, price: Number(form.price), offerPrice: Number(form.offerPrice),
      image: form.images.split("\n").map(s => s.trim()).filter(Boolean),
      description: form.description.split("\n").map(s => s.trim()).filter(Boolean), inStock: form.inStock,
      showInBanner: form.showInBanner,
      isBestSeller: form.isBestSeller,
    };
    try {
      const response = editing
        ? await api.put(`/api/admin/products/${editing}`, data)
        : await api.post("/api/admin/products", data);
      if (response.data.product?.showInBanner !== data.showInBanner) {
        throw { response: { data: { message: "The server did not save the banner setting. Restart the backend and save this product again." } } };
      }
      if (response.data.product?.isBestSeller !== data.isBestSeller) {
        throw { response: { data: { message: "The server did not save the Best seller setting. Restart the backend and save this product again." } } };
      }
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
      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-8 shadow-sm border border-stone-200">
        <Link to="/" className="text-green-800 font-semibold">Ayurvedic / Administration</Link>
        <h1 className="text-3xl font-semibold mt-8 mb-2">{session ? "Admin access required" : "Welcome back"}</h1>
        <p className="text-stone-500 mb-6">{session ? "Your current account does not have admin access." : "Sign in with your administrator account."}</p>
        {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
        {session ? <button disabled={busy || uploading || categoryBusy} onClick={logout} className={buttonStyle}>Sign out to switch accounts</button> : (
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
            <button disabled={busy || uploading} className={`${buttonStyle} w-full`}>{busy ? "Signing in…" : "Sign in"}</button>
          </form>
        )}
        <Link to="/" className="inline-block mt-6 text-sm text-stone-500 underline">Back to store</Link>
      </div>
    </div>
  );

  return (
    <div className="admin-layout min-h-screen bg-stone-50 text-stone-800 lg:flex">
      <aside className="bg-green-950 text-white p-4 sm:p-6 lg:w-60 lg:min-h-screen shrink-0">
        <Link to="/" className="text-2xl font-semibold">Ayurvedic<span className="block text-xs tracking-widest uppercase text-green-200 mt-2">Store administration</span></Link>
        <nav aria-label="Admin sections" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2 mt-5 lg:mt-8">
          {["Overview", "Products", "Categories", "Users"].map(item => <button disabled={uploading || busy || categoryBusy} key={item} onClick={() => { setTab(item); setShowForm(false); }} aria-current={tab === item ? "page" : undefined} className={`text-left rounded-lg px-4 py-3 ${tab === item ? "bg-white/15" : "hover:bg-white/10"}`}>{item}</button>)}
        </nav>
        <Link to="/" className="block mt-4 lg:mt-10 text-green-200 text-sm">← View storefront</Link>
      </aside>
      <div className="flex-1 min-w-0 p-4 sm:p-6 xl:p-10">
        <header className="flex flex-wrap justify-between items-center gap-4 border-b border-stone-200 pb-6 mb-8">
          <div><p className="text-sm text-stone-500">Welcome, {session.name}</p><h1 className="text-3xl font-semibold mt-1">{tab}</h1></div>
          <button disabled={busy || uploading || categoryBusy} onClick={logout} className="border border-stone-300 rounded-lg px-4 py-2">Sign out</button>
        </header>
        {error && <div role="alert" className="mb-5 p-4 rounded-lg bg-red-50 text-red-700">{error} <button onClick={load} className="underline" disabled={loading}>Retry</button></div>}
        {loading ? <p role="status">Loading store data…</p> : <>
          {tab === "Overview" && <>
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-5">
              {[["Total products", stats?.products], ["In-stock products", stats?.inStock], ["Registered accounts", stats?.users]].map(([label, value]) => <div key={label} className="bg-white border border-stone-200 rounded-xl p-6"><p className="text-stone-500 text-sm">{label}</p><p className="text-4xl font-semibold mt-3">{value ?? "—"}</p></div>)}
            </div>
            <div className="mt-8 rounded-xl border border-stone-200 bg-white p-7"><h2 className="text-xl font-semibold">Manage your catalog</h2><p className="text-stone-500 mt-2 mb-5">Add products, update prices, and keep availability current.</p><button onClick={() => setTab("Products")} className={buttonStyle}>Manage products</button></div>
          </>}
          {tab === "Products" && <>
            <div className="flex flex-wrap justify-between gap-3 mb-6"><input aria-label="Search products" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} className={`${inputStyle} max-w-sm`} /><button disabled={busy || uploading} className={buttonStyle} onClick={() => { setEditing(null); setForm(emptyProduct); setShowForm(true); }}>+ Add product</button></div>
            {showForm && <form onSubmit={saveProduct} className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 mb-6 space-y-4">
              <h2 className="text-xl font-semibold">{editing ? "Edit product" : "New product"}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[["name", "Product name"], ["price", "Regular price"], ["offerPrice", "Sale price"]].map(([key, label]) => <label key={key} className="block text-sm">{label}<input required maxLength={key === "name" ? 150 : key === "category" ? 60 : undefined} type={key.includes("rice") ? "number" : "text"} min="0" step="0.01" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className={inputStyle} /></label>)}
              </div>
              <label className="block text-sm">Category<select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputStyle}>
                <option value="">Select category</option>
                {form.category && !categoryOptions.some(item => item.key === form.category) && <option value={form.category}>{form.category} (existing)</option>}
                {categoryOptions.map(item => <option key={item._id} value={item.key}>{item.name}{item.visible ? "" : " (hidden)"}</option>)}
              </select><span className="mt-1 block text-xs text-stone-500">Add and manage categories from the Categories sidebar section.</span></label>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Upload images
                  <input type="file" multiple accept="image/jpeg,image/png,image/gif,image/webp" disabled={busy || uploading || imageUrls.length >= 8} onChange={uploadImages} aria-describedby="image-upload-help" className="mt-2 block w-full rounded-lg border border-dashed border-green-700 bg-green-50 p-4 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-green-800 file:px-4 file:py-2 file:text-white disabled:opacity-50" />
                </label>
                <p id="image-upload-help" className="text-xs text-stone-500">Select multiple images at once. JPEG, PNG, GIF or WebP, up to 5 MB each. {imageUrls.length}/8 images added.</p>
                {uploading && <p role="status" className="text-sm text-green-800">Uploading images...</p>}
                {imageUrls.length > 0 && <div className="flex flex-wrap gap-3">
                  {imageUrls.map((url, index) => <div key={`${index}-${url}`} className="w-28 rounded-lg border border-stone-200 p-2">
                    <img src={url} alt={`Product image ${index + 1}`} className="h-24 w-full rounded object-contain" />
                    <button type="button" disabled={busy || uploading} onClick={() => setForm(current => ({ ...current, images: current.images.split("\n").map(s => s.trim()).filter(Boolean).filter((_, i) => i !== index).join("\n") }))} aria-label={`Remove image ${index + 1}`} className="mt-2 w-full text-xs text-red-700 disabled:opacity-50">Remove</button>
                  </div>)}
                </div>}
                <label className="block text-sm">Or add image URLs (one HTTP or HTTPS URL per line)<textarea disabled={busy || uploading} rows={3} value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} className={inputStyle} /></label>
              </div>
              <label className="block text-sm">Description (one point per line)<textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputStyle} /></label>
              <label className="flex gap-2 items-center"><input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} />In stock</label>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <label className="flex gap-2 items-center font-medium text-green-900"><input type="checkbox" checked={form.isBestSeller} onChange={e => setForm({ ...form, isBestSeller: e.target.checked })} />Best seller</label>
                <p className="mt-1 text-sm text-stone-600">Show this product in the homepage Best Sellers section while it is in stock. Only selected products appear there.</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <label className="flex gap-2 items-center font-medium text-green-900"><input type="checkbox" checked={form.showInBanner} onChange={e => setForm({ ...form, showInBanner: e.target.checked })} />Show in homepage banner</label>
                <p className="mt-1 text-sm text-stone-600">Display this product's image, name and price in the top homepage slider while it is in stock. Uncheck to remove it from the banner.</p>
              </div>
              <div className="flex flex-wrap gap-3"><button disabled={busy || uploading} className={buttonStyle}>{busy ? "Saving…" : "Save product"}</button><button type="button" disabled={busy || uploading} onClick={() => setShowForm(false)} className="px-4 py-2">Cancel</button></div>
            </form>}
            <div className="overflow-x-auto bg-white rounded-xl border border-stone-200"><table className="admin-table w-full text-left text-sm"><thead className="bg-stone-100"><tr>{["Product", "Category", "Price", "Availability", "Highlights", "Actions"].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead><tbody>
              {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => <tr key={p._id} className="border-t border-stone-100"><td data-label="Product" className="p-4"><div className="flex items-center gap-3"><img src={p.image[0]} alt="" className="w-12 h-12 rounded object-cover" /><span>{p.name}</span></div></td><td data-label="Category" className="p-4">{p.category}</td><td data-label="Price" className="p-4">{p.offerPrice.toFixed(2)}</td><td data-label="Availability" className="p-4"><span className={`rounded-full px-3 py-1 whitespace-nowrap ${p.inStock ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-500"}`}>{p.inStock ? "In stock" : "Out of stock"}</span></td><td data-label="Highlights" className="p-4"><div className="flex flex-wrap gap-1">{p.isBestSeller && <span className="rounded-full bg-amber-100 px-2 py-1 text-xs whitespace-nowrap text-amber-800">Best seller</span>}{p.showInBanner && <span className="rounded-full bg-green-100 px-2 py-1 text-xs whitespace-nowrap text-green-800">Banner</span>}{!p.isBestSeller && !p.showInBanner && <span className="text-xs text-stone-400">—</span>}</div></td><td data-label="Actions" className="p-4 whitespace-nowrap"><button disabled={busy || uploading} onClick={() => editProduct(p)} className="text-green-800 mr-4">Edit</button><button disabled={busy || uploading} onClick={() => deleteProduct(p)} className="text-red-700">Delete</button></td></tr>)}
              {!products.some(p => p.name.toLowerCase().includes(search.toLowerCase())) && <tr><td colSpan={6} className="p-10 text-center text-stone-500">{search ? "No matching products." : "No products yet. Add your first product to publish it in the store."}</td></tr>}
            </tbody></table></div>
          </>}
          {tab === "Categories" && <AdminCategories onBusyChange={setCategoryBusy} />}
          {tab === "Users" && <><p className="text-sm text-stone-500 mb-4">Latest 100 registered accounts</p><div className="overflow-x-auto bg-white border border-stone-200 rounded-xl"><table className="admin-table w-full text-left text-sm"><thead className="bg-stone-100"><tr>{["Name", "Email", "Role", "Joined"].map(label => <th className="p-4" key={label}>{label}</th>)}</tr></thead><tbody>{users.map(account => <tr key={account._id} className="border-t border-stone-100"><td data-label="Name" className="p-4">{account.name}</td><td data-label="Email" className="p-4">{account.email}</td><td data-label="Role" className="p-4">{account.role || "user"}</td><td data-label="Joined" className="p-4">{new Date(account.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></>}
        </>}
      </div>
    </div>
  );
}
