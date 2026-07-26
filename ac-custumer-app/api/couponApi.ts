import apiClient from './client';

export interface Coupon {
  _id: string;
  code: string;
  title: string;
  subtitle: string;
  discount: number;
  discountType: 'flat' | 'percent';
  minOrderAmount: number;
  validUntil: string;
  image?: string;
}

export interface ApplyCouponResult {
  coupon: { code: string; title: string; discountType: string; discount: number };
  discountAmount: number;
  finalAmount: number;
}

// GET /api/coupons
export const getCoupons = async (): Promise<Coupon[]> => {
  const { data } = await apiClient.get('/coupons');
  return data.coupons;
};

// POST /api/coupons/apply
export const applyCoupon = async (
  code: string,
  orderAmount: number
): Promise<ApplyCouponResult> => {
  const { data } = await apiClient.post('/coupons/apply', { code, orderAmount });
  return data;
};
