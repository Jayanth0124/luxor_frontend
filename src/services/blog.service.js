import axios from 'axios';
import api from '@/lib/api';   // authenticated instance (attaches Bearer token)

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1';

export const getPosts         = (params) => axios.get(`${API}/blog/public`, { params }).then((r) => r.data.data);
export const getBlogCategories = ()       => axios.get(`${API}/config/blog-categories`).then((r) => r.data.data);
export const getPost     = (slug)   => axios.get(`${API}/blog/public/${slug}`).then((r) => r.data.data.post);
export const getComments = (blogId) => axios.get(`${API}/blog/public/${blogId}/comments`).then((r) => r.data.data);
// Uses authenticated api so logged-in user's JWT is sent; backend sets req.user via optionalAuthenticate
export const postComment = (blogId, data) => api.post(`/blog/public/${blogId}/comments`, data).then((r) => r.data.data.comment);
export const likeComment = (commentId) => axios.patch(`${API}/blog/public/comments/${commentId}/like`).then((r) => r.data.data);
