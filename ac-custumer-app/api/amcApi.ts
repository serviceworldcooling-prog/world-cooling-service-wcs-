import apiClient from './client';

export interface AMCPlan {
  _id: string;
  name: string;
  duration: string;
  durationMonths: number;
  price: number;
  description: string;
  inclusions: string[];
}

export interface MyPlanResponse {
  hasMembership: boolean;
  plan: AMCPlan | null;
  expiresAt?: string;
}

// GET /api/amc/plans
export const getPlans = async (): Promise<AMCPlan[]> => {
  const { data } = await apiClient.get('/amc/plans');
  return data.plans;
};

// GET /api/amc/plans/:id
export const getPlanById = async (id: string): Promise<AMCPlan> => {
  const { data } = await apiClient.get(`/amc/plans/${id}`);
  return data.plan;
};

// POST /api/amc/subscribe/:planId
export const subscribePlan = async (
  planId: string,
  paymentMethod: 'wallet' | 'upi' | 'card' | 'cash' = 'wallet'
) => {
  const { data } = await apiClient.post(`/amc/subscribe/${planId}`, { paymentMethod });
  return data;
};

// GET /api/amc/my-plan
export const getMyPlan = async (): Promise<MyPlanResponse> => {
  const { data } = await apiClient.get('/amc/my-plan');
  return data;
};
