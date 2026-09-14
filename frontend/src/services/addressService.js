import api from "./api";

export const getAddresses = async () => {
  const { data } = await api.get("/api/user/addresses");
  return data;
};

export const addAddress = async address => {
  const { data } = await api.post("/api/user/addresses", address);
  return data;
};

export const updateAddress = async (addressId, address) => {
  const { data } = await api.put(`/api/user/addresses/${addressId}`, address);
  return data;
};

export const deleteAddress = async addressId => {
  const { data } = await api.delete(`/api/user/addresses/${addressId}`);
  return data;
};
