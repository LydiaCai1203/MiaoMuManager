import request from '../utils/request'

export interface PriceRecord {
  id: number
  assetCategory: string
  assetName: string
  specification?: string | null
  unit?: string | null
  basePrice: number
  effectiveDate?: string | null
  expiryDate?: string | null
  remark?: string | null
}

export interface PricePayload {
  assetCategory: string
  assetName: string
  specification?: string
  unit?: string
  basePrice: number
  effectiveDate?: string
  expiryDate?: string
  remark?: string
}

export function getPrices() {
  return request.get('/prices')
}

export function createPrice(payload: PricePayload) {
  return request.post('/prices', payload)
}

export function updatePrice(id: number, payload: PricePayload) {
  return request.put(`/prices/${id}`, payload)
}

export function deletePrice(id: number) {
  return request.delete(`/prices/${id}`)
}

export function lookupPrices(category: string, name?: string) {
  return request.get('/prices/lookup', { params: { category, name: name || undefined } })
}
