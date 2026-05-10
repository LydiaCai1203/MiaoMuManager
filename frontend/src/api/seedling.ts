import request from '../utils/request'

export interface SeedlingItemPayload {
  lineNo: number
  seedlingName: string
  specification?: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
  remark?: string
}

export interface SeedlingEvaluationPayload {
  projectId: number
  partyId: number
  evaluationNo: string
  benchmarkDate?: string
  surveyDate?: string
  status: string
  remark?: string
  items: SeedlingItemPayload[]
}

export function getSeedlingEvaluations() {
  return request.get('/seedling-evaluations')
}

export function createSeedlingEvaluation(payload: SeedlingEvaluationPayload) {
  return request.post('/seedling-evaluations', payload)
}

export function updateSeedlingEvaluation(id: number, payload: SeedlingEvaluationPayload) {
  return request.put(`/seedling-evaluations/${id}`, payload)
}

export function deleteSeedlingEvaluation(id: number) {
  return request.delete(`/seedling-evaluations/${id}`)
}
