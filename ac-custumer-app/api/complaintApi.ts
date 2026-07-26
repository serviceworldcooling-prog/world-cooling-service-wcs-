import apiClient from './client';

export interface ComplaintTimeline {
  title: string;
  description: string;
  done: boolean;
  completedAt?: string | null;
}

export interface Complaint {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  timeline: ComplaintTimeline[];
  createdAt: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

// POST /api/complaints
export const createComplaint = async (payload: {
  subject: string;
  description: string;
  bookingId?: string;
}): Promise<Complaint> => {
  const { data } = await apiClient.post('/complaints', payload);
  return data.complaint;
};

// GET /api/complaints
export const getMyComplaints = async (): Promise<Complaint[]> => {
  const { data } = await apiClient.get('/complaints');
  return data.complaints;
};

// GET /api/complaints/ticket/:ticketNumber
export const getComplaintByTicket = async (ticketNumber: string): Promise<Complaint> => {
  const { data } = await apiClient.get(`/complaints/ticket/${ticketNumber}`);
  return data.complaint;
};

// GET /api/complaints/faqs
export const getFaqs = async (): Promise<FAQ[]> => {
  const { data } = await apiClient.get('/complaints/faqs');
  return data.faqs;
};
