import api from "./api";

export const getReportSummary = async (range = {}) => {
  const { data } = await api.get("/api/admin/reports/summary", { params: range });
  return data;
};

// Streams a CSV or Excel (.xlsx) file from the backend and saves it in the browser.
export const downloadReport = async (type, range = {}, format = "csv") => {
  const response = await api.get("/api/admin/reports/export", { params: { type, format, ...range }, responseType: "blob" });
  const disposition = response.headers["content-disposition"] || "";
  const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `${type}-report.${format}`;
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
