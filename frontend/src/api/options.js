import request from '../utils/request';
export function getOptions(groupCode) {
    return request.get(`/options/${groupCode}`);
}
export function getSystemOptions(groupCode) {
    return request.get('/system/options', {
        params: groupCode ? { groupCode } : undefined,
    });
}
export function createOptionItem(payload) {
    return request.post('/system/options', payload);
}
export function updateOptionItem(id, payload) {
    return request.put(`/system/options/${id}`, payload);
}
export function deleteOptionItem(id) {
    return request.delete(`/system/options/${id}`);
}
