import request from '../utils/request';
export function getProjects() {
    return request.get('/projects');
}
export function createProject(payload) {
    return request.post('/projects', payload);
}
export function updateProject(id, payload) {
    return request.put(`/projects/${id}`, payload);
}
export function deleteProject(id) {
    return request.delete(`/projects/${id}`);
}
export function createProjectParty(projectId, payload) {
    return request.post(`/projects/${projectId}/parties`, payload);
}
export function getProjectParties(projectId) {
    return request.get(`/projects/${projectId}/parties`);
}
export function updateProjectParty(projectId, partyId, payload) {
    return request.put(`/projects/${projectId}/parties/${partyId}`, payload);
}
export function deleteProjectParty(projectId, partyId) {
    return request.delete(`/projects/${projectId}/parties/${partyId}`);
}
