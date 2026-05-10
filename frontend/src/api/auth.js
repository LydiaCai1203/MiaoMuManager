import request from '../utils/request';
export function login(payload) {
    return request.post('/auth/login', payload);
}
export function getMe() {
    return request.get('/auth/me');
}
export function getUsers() {
    return request.get('/auth/users');
}
export function createUser(payload) {
    return request.post('/auth/users', payload);
}
export function updateUser(id, payload) {
    return request.put(`/auth/users/${id}`, payload);
}
export function deleteUser(id) {
    return request.delete(`/auth/users/${id}`);
}
