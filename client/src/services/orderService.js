import { apiGet, apiPost, apiPatch } from './apiClient';
export const placeOrder        = (orderData)       => apiPost('/api/orders', orderData);
export const getMyOrders       = ()                => apiGet('/api/orders/mine');
export const getAllOrders       = ()                => apiGet('/api/orders');
export const updateOrderStatus = (orderId, status) => apiPatch(`/api/orders/${orderId}/status`, { status });