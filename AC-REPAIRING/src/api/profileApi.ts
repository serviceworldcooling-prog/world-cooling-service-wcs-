import api from './client';

// GET /api/v1/technicians/profile
export const getProfile = async () => {
  const { data } = await api.get('/technicians/profile');
  return data.technician;
};

// PUT /api/v1/technicians/profile
export const updateProfile = async (payload: {
  name?: string;
  phone?: string;
  avatar?: string;
  city?: string;
  membership?: 'Standard' | 'Gold' | 'Platinum';
}) => {
  const { data } = await api.put('/technicians/profile', payload);
  return data.technician;
};

// PUT /api/v1/technicians/status
export const updateStatus = async (
  technicianStatus: 'Available' | 'On Job' | 'Off Duty'
) => {
  const { data } = await api.put('/technicians/status', { technicianStatus });
  return data;
};

// PUT /api/v1/technicians/change-password
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const { data } = await api.put('/technicians/change-password', {
    currentPassword,
    newPassword,
  });
  return data;
};
