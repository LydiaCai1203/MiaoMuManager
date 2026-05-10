import request from '../utils/request';
export function getPrices() {
    return request.get('/prices');
}
export function createPrice(payload) {
    return request.post('/prices', payload);
}
export function updatePrice(id, payload) {
    return request.put(`/prices/${id}`, payload);
}
export function deletePrice(id) {
    return request.delete(`/prices/${id}`);
}
