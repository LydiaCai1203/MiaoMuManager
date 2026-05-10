import request from '../utils/request';
export function getHouseEvaluations() {
    return request.get('/house-evaluations');
}
export function createHouseEvaluation(payload) {
    return request.post('/house-evaluations', payload);
}
export function updateHouseEvaluation(id, payload) {
    return request.put(`/house-evaluations/${id}`, payload);
}
export function deleteHouseEvaluation(id) {
    return request.delete(`/house-evaluations/${id}`);
}
