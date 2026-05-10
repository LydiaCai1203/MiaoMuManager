import request from '../utils/request';
export function getSeedlingEvaluations() {
    return request.get('/seedling-evaluations');
}
export function createSeedlingEvaluation(payload) {
    return request.post('/seedling-evaluations', payload);
}
export function updateSeedlingEvaluation(id, payload) {
    return request.put(`/seedling-evaluations/${id}`, payload);
}
export function deleteSeedlingEvaluation(id) {
    return request.delete(`/seedling-evaluations/${id}`);
}
