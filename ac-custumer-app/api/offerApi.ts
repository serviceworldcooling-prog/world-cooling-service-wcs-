import apiClient from './client';

export interface Offer {
  _id: string;
  title: string;
  code: string;
  discount: number;
  discountType: 'percent' | 'flat';
  description: string;
  expiry: string;
  imageUrl?: string;
  isActive: boolean;
  minOrderValue?: number;
}

// GET /api/v1/offers
export const getOffers = async (): Promise<Offer[]> => {
  const { data } = await apiClient.get('/offers');
  return data.data.offers;
};
