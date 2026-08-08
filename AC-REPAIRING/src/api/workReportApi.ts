import api from './client';

export interface WorkReportPayload {
  bookingId: string;
  workDone: string;
  selectedWorks: string[];
  techNote: string;
  photos: string[];
  video: string;
  warrantyActive?: boolean;
  warrantyPeriod?: string;
  warrantyDetails?: string;
  acNo?: string;
  modelNo?: string;
  warrantyReason?: string;
  extraMaterialCharges?: number;
  extraAmountTaken?: number;
}

export interface WorkReportResponse {
  report: {
    _id: string;
    bookingId: string;
    technicianId: string;
    customerId: string;
    workDone: string;
    selectedWorks: string[];
    techNote: string;
    photos: string[];
    submittedAt: string;
  };
  endOtp: string;
  expiresAt: string;
  message: string;
}

// POST /api/v1/work-reports
// Returns the generated endOtp to show to customer
export const submitWorkReport = async (
  payload: WorkReportPayload
): Promise<WorkReportResponse> => {
  const { data } = await api.post('/work-reports', payload);
  return data.data;
};

// GET /api/v1/work-reports/booking/:bookingId
export const getReportByBooking = async (bookingId: string) => {
  const { data } = await api.get(`/work-reports/booking/${bookingId}`);
  return data.report;
};

// GET /api/v1/work-reports/my
export const getMyReports = async () => {
  const { data } = await api.get('/work-reports/my');
  return data.reports;
};
