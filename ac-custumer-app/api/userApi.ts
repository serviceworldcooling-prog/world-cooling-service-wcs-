import apiClient from './client';

// GET /api/user/profile
export const getProfile = async () => {
  const { data } = await apiClient.get('/user/profile');
  return data.user;
};

// PUT /api/user/profile
export const updateProfile = async (payload: {
  name?: string;
  phone?: string;
  avatar?: string;
}) => {
  const { data } = await apiClient.put('/user/profile', payload);
  return data.user;
};

// GET /api/user/addresses
export const getAddresses = async () => {
  const { data } = await apiClient.get('/user/addresses');
  return data.addresses;
};

// POST /api/user/addresses
export const addAddress = async (payload: {
  label: string;
  address: string;
  city?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}) => {
  const { data } = await apiClient.post('/user/addresses', payload);
  return data.addresses;
};

// DELETE /api/user/addresses/:addressId
export const deleteAddress = async (addressId: string) => {
  const { data } = await apiClient.delete(`/user/addresses/${addressId}`);
  return data.addresses;
};
