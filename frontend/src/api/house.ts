import request from '../utils/request'

export interface HouseEvaluationRecord {
  id: number
  projectId: number
  partyId: number
  evaluationNo: string
  locationText?: string | null
  usageType?: string | null
  buildingArea: number
  unitPrice: number
  regionFactor: number
  floorFactor: number
  orientationFactor: number
  decorationFactor: number
  totalAmount: number
  suggestedUnitPrice?: number | null
  priceAdjusted?: number | null
  benchmarkDate?: string | null
  surveyDate?: string | null
  status: string
  remark?: string | null
}

export interface HouseEvaluationPayload {
  projectId: number
  partyId: number
  evaluationNo: string
  locationText?: string
  usageType?: string
  buildingArea: number
  unitPrice: number
  regionFactor: number
  floorFactor: number
  orientationFactor: number
  decorationFactor: number
  benchmarkDate?: string
  surveyDate?: string
  status: string
  remark?: string
}

export function getHouseEvaluations() {
  return request.get('/house-evaluations')
}

export function createHouseEvaluation(payload: HouseEvaluationPayload) {
  return request.post('/house-evaluations', payload)
}

export function updateHouseEvaluation(id: number, payload: HouseEvaluationPayload) {
  return request.put(`/house-evaluations/${id}`, payload)
}

export function deleteHouseEvaluation(id: number) {
  return request.delete(`/house-evaluations/${id}`)
}
