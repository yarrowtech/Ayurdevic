import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAppContext } from "../context/AppContext";
import ConfirmDialog from "./ConfirmDialog";

const empty = { name: "", image: "", offer: "", visible: true };
const input = "mt-1 min-w-0 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5";
const button = "rounded-lg bg-green-800 px-5 py-2.5 text-white hover:bg-green-900 disabled:opacity-50";
const message = error => error.response?.data?.message || "Unable to connect to the backend.";

export default function AdminCategories({ onBusyChange }) {
  const { refreshCategories } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const locked = busy || uploading;
  useEffect(() => { onBusyChange(locked); return () => onBusyChange(false); }, [locked, onBusyChange]);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setCategories((await api.get("/api/admin/categories")).data.categories); }
    catch (err) { setError(message(err)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const upload = async event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      return toast.error("Choose a JPEG, PNG, GIF or WebP image up to 5 MB.");
    }
    setUploading(true);
    try {
      const { data } = await api.post("/api/admin/images", file, { headers: { "Content-Type": file.type } });
      setForm(current => ({ ...current, image: new URL(data.path, new URL(api.defaults.baseURL, window.location.origin)).href }));
    } catch (err) { toast.error(message(err)); }
    finally { setUploading(false); }
  };
  const save = async event => {
    event.preventDefault();
    if (locked) return;
    setBusy(true);
    try {
      if (editing) await api.put(`/api/admin/categories/${editing}`, form);
      else await api.post("/api/admin/categories", form);
      setShowForm(false);
      toast.success("Category saved");
      await Promise.all([load(), refreshCategories()]);
    } catch (err) { toast.error(message(err)); }
    finally { setBusy(false); }
  };
  const changeCategory = async (category, remove = false) => {
    setBusy(true);
    try {
      if (remove) await api.delete(`/api/admin/categories/${category._id}`);
      else await api.put(`/api/admin/categories/${category._id}`, { ...category, visible: !category.visible });
      toast.success(remove ? "Category deleted" : category.visible ? "Category hidden" : "Category shown");
      await Promise.all([load(), refreshCategories()]);
    } catch (err) { toast.error(message(err)); }
    finally { setBusy(false); }
  };
  const confirmDeleteCategory = async () => {
    if (busy || !categoryToDelete) return;
    await changeCategory(categoryToDelete, true);
    setCategoryToDelete(null);
  };
  return <div>
    <p className="mb-5 text-sm text-stone-500">Manage storefront categories, images and promotional offers. Hiding or deleting a category keeps its products available.</p>
    <div className="mb-6 flex flex-wrap justify-between gap-3">
      <input aria-label="Search categories" placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} className={`${input} max-w-sm`} />
      <button disabled={locked} className={button} onClick={() => { setEditing(null); setForm(empty); setShowForm(true); }}>+ Add category</button>
    </div>
    {error && <p role="alert" className="mb-4 text-red-700">{error} <button onClick={load} className="underline">Retry</button></p>}
    {showForm && (
    <div role="presentation" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={() => { if (!locked) setShowForm(false); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="category-form-title" onClick={event => event.stopPropagation()} className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl bg-white p-4 shadow-2xl sm:p-6">
    <form onSubmit={save} className="space-y-4">
      <h2 id="category-form-title" className="text-xl font-semibold">{editing ? "Edit category" : "New category"}</h2>
      <fieldset disabled={locked} className="space-y-4 disabled:opacity-60">
        <label className="block text-sm">Category name<input required maxLength={60} pattern="[a-zA-Z][a-zA-Z ]{0,59}" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={input} /></label>
        <label className="block text-sm">Category image<input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={upload} className={`${input} border-dashed bg-green-50`} /></label>
        <p className="text-xs text-stone-500">JPEG, PNG, GIF or WebP, up to 5 MB.</p>
        <label className="block text-sm">Or image URL<input type="url" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className={input} /></label>
        {form.image && <div className="flex items-center gap-4"><img src={form.image} alt="Category preview" className="h-28 w-28 rounded-lg border object-contain p-2" /><button type="button" onClick={() => setForm({ ...form, image: "" })} className="text-sm text-red-700">Remove image</button></div>}
        <label className="block text-sm">Offer text (optional)<input maxLength={120} placeholder="e.g. Summer sale" value={form.offer} onChange={e => setForm({ ...form, offer: e.target.value })} className={input} /></label>
        <p className="text-xs text-stone-500">Shown on the category card and page. Product prices are managed separately.</p>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.visible} onChange={e => setForm({ ...form, visible: e.target.checked })} />Show category on storefront</label>
      </fieldset>
      {uploading && <p role="status" className="text-sm text-green-800">Uploading image...</p>}
      <div className="flex flex-wrap gap-3"><button disabled={locked} className={button}>{busy ? "Saving..." : "Save category"}</button><button type="button" disabled={locked} onClick={() => setShowForm(false)} className="px-4 py-2">Cancel</button></div>
    </form>
    </div>
    </div>
    )}
    {categoryToDelete && (
      <ConfirmDialog
        title="Delete category?"
        description={<>“{categoryToDelete.name}” will be permanently deleted. Its products are kept and simply lose this category link.</>}
        confirmLabel="Delete category"
        busyLabel="Deleting…"
        busy={busy}
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
      />
    )}
    {loading ? <p role="status">Loading categories...</p> : <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="admin-table w-full text-left text-sm"><thead className="bg-stone-100"><tr>{["Category", "Offer", "Visibility", "Actions"].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead>
        <tbody>{categories.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).map(category => <tr key={category._id} className="border-t border-stone-100">
          <td data-label="Category" className="p-4"><div className="flex items-center gap-3">{category.image ? <img src={category.image} alt="" className="h-14 w-14 rounded object-contain" /> : <span className="flex h-14 w-14 items-center justify-center rounded bg-green-50 text-xl text-green-800">{category.name[0]}</span>}<span>{category.name}</span></div></td>
          <td data-label="Offer" className="max-w-xs break-words p-4">{category.offer || "—"}</td><td data-label="Visibility" className="p-4"><span className={`rounded-full px-3 py-1 ${category.visible ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-500"}`}>{category.visible ? "Visible" : "Hidden"}</span></td>
          <td data-label="Actions" className="whitespace-nowrap p-4"><button disabled={locked} onClick={() => { setEditing(category._id); setForm({ name: category.name ?? "", image: category.image ?? "", offer: category.offer ?? "", visible: category.visible ?? true }); setShowForm(true); }} className="mr-4 text-green-800">Edit</button><button disabled={locked} onClick={() => changeCategory(category)} className="mr-4 text-green-800">{category.visible ? "Hide" : "Show"}</button><button disabled={locked} onClick={() => setCategoryToDelete(category)} className="text-red-700">Delete</button></td>
        </tr>)}{!categories.some(item => item.name.toLowerCase().includes(search.toLowerCase())) && <tr><td colSpan={4} className="p-10 text-center text-stone-500">{search ? "No matching categories." : "No categories yet. Add your first category."}</td></tr>}</tbody>
      </table>
    </div>}
  </div>;
}
