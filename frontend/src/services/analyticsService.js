import api from "./api";

const VISITOR_KEY = "visitorId";

// A persistent anonymous id for this browser, used to tell unique visitors
// apart without requiring sign-in. Never sent anywhere except our own /api/track.
export const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "") : `${Date.now()}${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return `anon${Date.now()}${Math.random().toString(36).slice(2)}`;
  }
};

export const trackPageView = path => {
  api.post("/api/track", { type: "page_view", path, visitorId: getVisitorId() }).catch(() => {});
};

export const trackProductView = (productId, path) => {
  api.post("/api/track", { type: "product_view", path, productId, visitorId: getVisitorId() }).catch(() => {});
};

export const getAnalyticsSummary = async (range = {}) => {
  const { data } = await api.get("/api/admin/analytics/summary", { params: range });
  return data;
};
