import request from '../utils/request'

export interface OptionItemRecord {
  id: number
  groupCode: string
  optionValue: string
  optionLabel: string
  sortOrder: number
  enabled: boolean
  remark?: string | null
}

export interface OptionItemPayload {
  groupCode: string
  optionValue: string
  optionLabel: string
  sortOrder: number
  enabled: boolean
  remark?: string
}

export function getOptions(groupCode: string) {
  return request.get(`/options/${groupCode}`)
}

export function getSystemOptions(groupCode?: string) {
  return request.get('/system/options', {
    params: groupCode ? { groupCode } : undefined,
  })
}

export function createOptionItem(payload: OptionItemPayload) {
  return request.post('/system/options', payload)
}

export function updateOptionItem(id: number, payload: OptionItemPayload) {
  return request.put(`/system/options/${id}`, payload)
}

export function deleteOptionItem(id: number) {
  return request.delete(`/system/options/${id}`)
}
