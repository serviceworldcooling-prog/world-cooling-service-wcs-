import apiClient from './client';

export interface ServiceCategory {
  id: string;
  title: string;
  icon: string;
  serviceCount: number;
  startingFrom: number;
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  basePrice: number;
  category: string;
  inclusions: string[];
  estimatedTime: string;
  isFeatured: boolean;
}

// GET /api/services?search=&category=&featured=true
export const getServices = async (params?: {
  search?: string;
  category?: string;
  featured?: boolean;
}): Promise<Service[]> => {
  const res: any = await apiClient.get('/services', { params });
  return res?.services ?? res?.data?.services ?? [];
};

// GET /api/services/categories
export const getCategories = async (): Promise<ServiceCategory[]> => {
  const res: any = await apiClient.get('/services/categories');
  return res?.categories ?? res?.data?.categories ?? [];
};

// GET /api/services/:id
export const getServiceById = async (id: string): Promise<Service> => {
  const res: any = await apiClient.get(`/services/${id}`);
  return res?.service ?? res?.data?.service;
};
