import request from '../utils/request';
export function getAppendageEvaluations() {
    return request.get('/appendage-evaluations');
}
export function createAppendageEvaluation(payload) {
    return request.post('/appendage-evaluations', payload);
}
export function updateAppendageEvaluation(id, payload) {
    return request.put(`/appendage-evaluations/${id}`, payload);
}
export function deleteAppendageEvaluation(id) {
    return request.delete(`/appendage-evaluations/${id}`);
}
