import api from "./api";

export const getOrders = async () => {
  const { data } = await api.get("/api/user/orders");
  return data;
};

export const placeOrder = async ({ items, addressId, paymentMethod }) => {
  const { data } = await api.post("/api/user/orders", { items, addressId, paymentMethod });
  return data;
};
