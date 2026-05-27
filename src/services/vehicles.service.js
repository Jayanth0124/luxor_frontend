import api from '@/lib/api';

/**
 * List vehicles with optional filters.
 * @param {{ search?, state?, city?, category?, page?, limit? }} params
 */
export const getVehicles = async (params = {}) => {
  const { data } = await api.get('/public/vehicles', { params });
  return data.data; // { vehicles, total, page, limit }
};

/**
 * Get a single vehicle by slug.
 * @param {string} slug
 */
export const getVehicleBySlug = async (slug) => {
  const { data } = await api.get(`/public/vehicles/${slug}`);
  return data.data;
};

export const checkVehicleAvailability = async (refId, startDate, endDate) => {
  const { data } = await api.get(`/public/availability/Vehicle/${refId}`, {
    params: { startDate, endDate },
  });
  return data.data; // { available: boolean, reason?: string }
};

export const createBooking = async (data) => {
  const { data: res } = await api.post('/public/bookings', data);
  return res.data;
};

export const verifyPayment = async (data) => {
  const { data: res } = await api.post('/public/payments/verify', data);
  return res.data;
};

export const getBookingById = async (id) => {
  const { data: res } = await api.get(`/public/bookings/${id}`);
  return res.data;
};

export const getUserBookings = async (params = {}) => {
  const { data: res } = await api.get('/public/bookings', { params });
  return res.data; // { bookings, total, page, limit }
};

export const createBalanceOrder = async (bookingId) => {
  const { data: res } = await api.post(`/public/bookings/${bookingId}/balance-order`);
  return res.data;
};

export const verifyBalancePayment = async (data) => {
  const { data: res } = await api.post(`/public/bookings/${data.bookingId}/verify-balance`, data);
  return res.data;
};

export const getVehicleBlockedPeriods = async (vehicleId) => {
  const { data } = await api.get(`/public/blocked-periods/Vehicle/${vehicleId}`);
  return data.data; // [{ startDate, endDate, reason }]
};

// ─── Addon Requests ───────────────────────────────────────────────────────────

export const listAddonRequests = async (bookingId) => {
  const { data: res } = await api.get(`/public/bookings/${bookingId}/addon-requests`);
  return res.data?.requests ?? res.data ?? [];
};

export const createAddonRequest = async (bookingId, addons, note = '') => {
  const { data: res } = await api.post(`/public/bookings/${bookingId}/addon-requests`, { addons, note });
  return res.data;
};

export const getAddonPaymentOrder = async (reqId) => {
  const { data: res } = await api.get(`/public/addon-requests/${reqId}/payment-order`);
  return res.data;
};

export const verifyAddonPayment = async ({ reqId, razorpayPaymentId, razorpaySignature }) => {
  const { data: res } = await api.post(`/public/addon-requests/${reqId}/verify-payment`, {
    razorpayPaymentId, razorpaySignature,
  });
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────

export const cancelBooking = async (bookingId, reason = '') => {
  const { data: res } = await api.post(`/public/bookings/${bookingId}/cancel`, { reason });
  return res.data;
};

export const resumeBookingPayment = async (bookingId, guestEmail = '') => {
  const { data: res } = await api.post(`/public/bookings/${bookingId}/resume-payment`, { guestEmail });
  return res.data;
};

export const getVehicleCategories = async () => {
  try {
    const { data } = await api.get('/public/vehicle-categories');
    return data.data;
  } catch (err) {
    console.warn('Failed to fetch vehicle categories from backend API:', err.message);
    return null;
  }
};
