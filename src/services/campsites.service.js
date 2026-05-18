import api from '@/lib/api';

/**
 * List campsites with optional filters.
 * @param {{ search?, state?, city?, stayType?, page?, limit? }} params
 */
export const getCampsites = async (params = {}) => {
  const { data } = await api.get('/public/campsites', { params });
  return data.data; // { campsites, total, page, limit }
};

/**
 * Get a single campsite by slug.
 * @param {string} slug
 */
export const getCampsiteBySlug = async (slug) => {
  const { data } = await api.get(`/public/campsites/${slug}`);
  return data.data;
};

export const getCampsiteBlockedPeriods = async (campsiteId) => {
  const { data } = await api.get(`/public/blocked-periods/Campsite/${campsiteId}`);
  return data.data ?? [];
};

export const checkCampsiteAvailability = async (refId, startDate, endDate, roomId, rooms = 1) => {
  const { data } = await api.get(`/public/availability/Campsite/${refId}`, {
    params: { startDate, endDate, ...(roomId && { roomId }), ...(rooms > 1 && { rooms }) },
  });
  return data.data;
};
