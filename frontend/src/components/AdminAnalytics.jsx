import { useCallback, useEffect, useState } from "react";
import { getAnalyticsSummary } from "../services/analyticsService";
import CountUp from "./CountUp";

const inputStyle = "min-w-0 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-700";
const buttonStyle = "rounded-lg bg-green-800 px-5 py-2.5 text-white disabled:opacity-50 hover:bg-green-900";
const errorMessage = error => error?.response?.data?.message || "Unable to connect. Check that the backend is running.";
const visitsPalette = ["#166534", "#0d9488", "#65a30d", "#0f766e", "#4d7c0f", "#059669", "#15803d", "#0e7490"];
const loginsPalette = ["#7e22ce", "#a21caf", "#be185d", "#9333ea", "#c026d3", "#db2777", "#86198f", "#a855f7"];

const toDateInput = date => date.toISOString().slice(0, 10);
const rangeFromDays = days => {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: toDateInput(from), to: toDateInput(to) };
};
const eventLabel = { page_view: "Page view", product_view: "Product view", login: "Login" };

export default function AdminAnalytics() {
  const [range, setRange] = useState(rangeFromDays(29));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(r => {
    setLoading(true);
    setError("");
    getAnalyticsSummary(r)
      .then(result => setData(result))
      .catch(err => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(range); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = r => { setRange(r); load(r); };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <label className="text-sm">From<input type="date" value={range.from} max={range.to} onChange={e => setRange(current => ({ ...current, from: e.target.value }))} className={`${inputStyle} mt-1`} /></label>
        <label className="text-sm">To<input type="date" value={range.to} min={range.from} max={toDateInput(new Date())} onChange={e => setRange(current => ({ ...current, to: e.target.value }))} className={`${inputStyle} mt-1`} /></label>
        <button disabled={loading} onClick={() => apply(range)} className={buttonStyle}>{loading ? "Loading…" : "Apply"}</button>
        <div className="ml-auto flex flex-wrap gap-2">
          {[["7d", 6], ["30d", 29], ["90d", 89]].map(([label, days]) => (
            <button key={label} disabled={loading} onClick={() => apply(rangeFromDays(days))} className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-50">Last {label}</button>
          ))}
        </div>
      </div>

      {error && <div role="alert" className="mb-5 p-4 rounded-lg bg-red-50 text-red-700">{error} <button onClick={() => load(range)} className="underline" disabled={loading}>Retry</button></div>}

      {loading && !data ? <p role="status">Loading analytics…</p> : data && <>
        <p className="text-sm text-stone-500">Showing {new Date(data.range.from).toLocaleDateString()} – {new Date(data.range.to).toLocaleDateString()}</p>

        <div className="mt-3 grid sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            ["Logins", data.totals.logins],
            ["Unique visitors", data.totals.uniqueVisitors],
            ["Logged-in visits", data.totals.loggedInVisits],
            ["Guest visits", data.totals.anonymousVisits],
            ["Page views", data.totals.pageViews],
            ["Product views", data.totals.productViews],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-stone-200 rounded-xl p-4">
              <p className="text-stone-500 text-xs">{label}</p>
              <p className="text-2xl font-semibold mt-2"><CountUp value={value} /></p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Visits per day</h2>
            <p className="text-xs text-stone-500">Guests + signed-in shoppers combined</p>
            {data.daily.length ? (
              <div className="mt-6 flex h-32 items-end gap-1">
                {data.daily.map((day, index) => {
                  const max = Math.max(1, ...data.daily.map(d => d.visits));
                  return <div key={day.date} className="group relative flex h-full flex-1 items-end"><div title={`${day.date}: ${day.visits} visit${day.visits === 1 ? "" : "s"}`} className="w-full rounded-t transition hover:brightness-110" style={{ height: `${Math.max(4, (day.visits / max) * 100)}%`, backgroundColor: visitsPalette[index % visitsPalette.length] }} /></div>;
                })}
              </div>
            ) : <p className="mt-4 text-sm text-stone-500">No visits recorded in this range.</p>}
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Logins per day</h2>
            <p className="text-xs text-stone-500">Includes new sign-ups (they sign in immediately)</p>
            {data.daily.length ? (
              <div className="mt-6 flex h-32 items-end gap-1">
                {data.daily.map((day, index) => {
                  const max = Math.max(1, ...data.daily.map(d => d.logins));
                  return <div key={day.date} className="group relative flex h-full flex-1 items-end"><div title={`${day.date}: ${day.logins} login${day.logins === 1 ? "" : "s"}`} className="w-full rounded-t transition hover:brightness-110" style={{ height: `${Math.max(4, (day.logins / max) * 100)}%`, backgroundColor: loginsPalette[index % loginsPalette.length] }} /></div>;
                })}
              </div>
            ) : <p className="mt-4 text-sm text-stone-500">No logins recorded in this range.</p>}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Most-viewed products</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="admin-table w-full text-left text-sm"><thead className="bg-stone-100"><tr>{["Product", "Views"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>
                {data.topProducts.map(item => <tr key={item.productId} className="border-t border-stone-100"><td className="p-3">{item.name}</td><td className="p-3">{item.views}</td></tr>)}
                {!data.topProducts.length && <tr><td colSpan={2} className="p-8 text-center text-stone-500">No product views yet.</td></tr>}
              </tbody></table>
            </div>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Most-visited pages</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="admin-table w-full text-left text-sm"><thead className="bg-stone-100"><tr>{["Page", "Views"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>
                {data.topPages.map(item => <tr key={item.path} className="border-t border-stone-100"><td className="p-3 break-all">{item.path || "/"}</td><td className="p-3">{item.views}</td></tr>)}
                {!data.topPages.length && <tr><td colSpan={2} className="p-8 text-center text-stone-500">No page views yet.</td></tr>}
              </tbody></table>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <p className="mt-1 text-sm text-stone-500">Latest 50 events in this range.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="admin-table w-full text-left text-sm"><thead className="bg-stone-100"><tr>{["Date & time", "Event", "Page / product", "Visitor"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>
              {data.recent.map(event => (
                <tr key={event.id} className="border-t border-stone-100">
                  <td className="p-3 whitespace-nowrap">{new Date(event.createdAt).toLocaleString()}</td>
                  <td className="p-3">{eventLabel[event.type] || event.type}</td>
                  <td className="p-3 break-all">{event.type === "product_view" ? event.productName : event.type === "login" ? "—" : (event.path || "/")}</td>
                  <td className="p-3">{event.userName || "Guest"}</td>
                </tr>
              ))}
              {!data.recent.length && <tr><td colSpan={4} className="p-8 text-center text-stone-500">No activity in this range.</td></tr>}
            </tbody></table>
          </div>
        </div>
      </>}
    </div>
  );
}
