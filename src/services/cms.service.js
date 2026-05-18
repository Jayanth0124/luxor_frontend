import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export const getActiveBanners = async (type = 'hero') => {
  const res = await axios.get(`${API_BASE}/public/banners`, { params: { type } });
  return res.data.data ?? [];
};
