import apiClient from './client';

export interface WalletTransaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  description: string;
  source: string;
  createdAt: string;
}

export interface PaymentPreview {
  bookingId: string;
  serviceType: string;
  technicianName: string;
  date: string;
  time: string;
  address: string;
  baseAmount: number;
  tax: number;
  total: number;
  isPaid: boolean;
}

// GET /api/payments/preview/:bookingId
export const getPaymentPreview = async (bookingId: string): Promise<PaymentPreview> => {
  const { data } = await apiClient.get(`/payments/preview/${bookingId}`);
  return data.preview;
};

// POST /api/payments/pay/:bookingId
export const processPayment = async (
  bookingId: string,
  paymentMethod: 'upi' | 'card' | 'wallet' | 'cash',
  couponCode?: string
) => {
  const { data } = await apiClient.post(`/payments/pay/${bookingId}`, {
    paymentMethod,
    ...(couponCode ? { couponCode } : {}),
  });
  return data;
};

// GET /api/payments/wallet
export const getWalletBalance = async (): Promise<number> => {
  const { data } = await apiClient.get('/payments/wallet');
  return data.walletBalance;
};

// GET /api/payments/wallet/transactions
export const getWalletTransactions = async (page = 1, limit = 20): Promise<{
  transactions: WalletTransaction[];
  total: number;
  totalPages: number;
}> => {
  const { data } = await apiClient.get('/payments/wallet/transactions', {
    params: { page, limit },
  });
  return { transactions: data.transactions, total: data.total, totalPages: data.totalPages };
};

// POST /api/payments/wallet/add
export const addMoneyToWallet = async (amount: number): Promise<number> => {
  const { data } = await apiClient.post('/payments/wallet/add', { amount });
  return data.walletBalance;
};

// GET /api/payments/invoice/:bookingId
export const getInvoice = async (bookingId: string) => {
  const { data } = await apiClient.get(`/payments/invoice/${bookingId}`);
  return data.invoice;
};
