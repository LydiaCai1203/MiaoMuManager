import request from '../utils/request'

export interface AppendageItemPayload {
  assetType: string
  assetCode?: string
  lineNo: number
  itemName: string
  specification?: string
  unit?: string
  quantity: number
  replacementUnitPrice?: number
  replacementAmount?: number
  noveltyRate?: number
  evaluationUnitPrice?: number
  evaluationAmount: number
  remark?: string
}

export interface AppendageEvaluationPayload {
  projectId: number
  partyId: number
  evaluationNo: string
  tenantName?: string
  locationText?: string
  benchmarkDate?: string
  surveyDate?: string
  status: string
  remark?: string
  items: AppendageItemPayload[]
}

export function getAppendageEvaluations() {
  return request.get('/appendage-evaluations')
}

export function createAppendageEvaluation(payload: AppendageEvaluationPayload) {
  return request.post('/appendage-evaluations', payload)
}

export function updateAppendageEvaluation(id: number, payload: AppendageEvaluationPayload) {
  return request.put(`/appendage-evaluations/${id}`, payload)
}

export function deleteAppendageEvaluation(id: number) {
  return request.delete(`/appendage-evaluations/${id}`)
}
