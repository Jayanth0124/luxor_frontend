import api from '@/lib/api';

const BASE = '/support';

export const listTickets  = (params)    => api.get(BASE, { params });
export const createTicket = (data)      => api.post(BASE, data); // data may be FormData
export const getTicket    = (id)        => api.get(`${BASE}/${id}`);
export const getMessages  = (id)        => api.get(`${BASE}/${id}/messages`);
export const sendMessage  = (id, body)  => api.post(`${BASE}/${id}/messages`, { body });
export const closeTicket  = (id)        => api.patch(`${BASE}/${id}/status`, { status: 'closed' });
