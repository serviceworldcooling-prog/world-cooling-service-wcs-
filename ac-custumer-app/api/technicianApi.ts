import apiClient from './client';

export interface Technician {
  _id: string;
  id?: string;
  name: string;
  avatar?: string;
  phone?: string;
  specialty?: string;
  rating?: number;
  reviewsCount?: number;
}

// GET /services/technicians
export const getTechnicians = async (): Promise<Technician[]> => {
  const res: any = await apiClient.get('/services/technicians');
  const techs = res?.technicians ?? res?.data?.technicians ?? [];
  return techs.map((t: any) => ({
    ...t,
    id: t._id, // Map database _id to UI component id selector
  }));
};
