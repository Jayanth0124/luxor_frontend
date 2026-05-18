import api from '@/lib/api';

export const getPublicReviews = async (refType, refId, { page = 1, limit = 10 } = {}) => {
  const { data } = await api.get(`/public/reviews/${refType}/${refId}`, { params: { page, limit } });
  return data.data; // { reviews, total, breakdown, page, limit }
};

export const checkReviewEligibility = async (refType, refId) => {
  const { data } = await api.get(`/reviews/eligible/${refType}/${refId}`);
  return data.data; // { eligible, reason?, bookingId? }
};

export const submitReview = async ({ refType, refId, rating, title, body }) => {
  const { data } = await api.post('/reviews', { refType, refId, rating, title, body });
  return data.data;
};

export const getMyReviews = async () => {
  const { data } = await api.get('/reviews/my');
  return data.data;
};
