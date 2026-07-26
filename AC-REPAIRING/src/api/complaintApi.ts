import api from './client';

export interface TechComplaint {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  timeline: { title: string; description: string; done: boolean }[];
  createdAt: string;
}

// POST /api/v1/complaints
export const createComplaint = async (payload: {
  subject: string;
  description: string;
  bookingId?: string;
}): Promise<TechComplaint> => {
  const { data } = await api.post('/complaints', payload);
  return data.complaint;
};

// GET /api/v1/complaints
export const getMyComplaints = async (): Promise<TechComplaint[]> => {
  const { data } = await api.get('/complaints');
  return data.complaints;
};
