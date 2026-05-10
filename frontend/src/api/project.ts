import request from '../utils/request'

export interface ProjectParty {
  id: number
  projectId: number
  partyType: string
  partyName: string
  idNo?: string | null
  contactPhone?: string | null
  villageGroup?: string | null
  tenantName?: string | null
  locationText?: string | null
  remark?: string | null
}

export interface ProjectRecord {
  id: number
  projectCode: string
  projectName: string
  projectType: string
  entrustingParty?: string | null
  regionName?: string | null
  benchmarkDate?: string | null
  surveyDate?: string | null
  status: string
  remark?: string | null
  parties: ProjectParty[]
}

export interface ProjectPayload {
  projectCode: string
  projectName: string
  projectType: string
  entrustingParty?: string
  regionName?: string
  benchmarkDate?: string
  surveyDate?: string
  status: string
  remark?: string
}

export interface ProjectPartyPayload {
  partyType: string
  partyName: string
  idNo?: string
  contactPhone?: string
  villageGroup?: string
  tenantName?: string
  locationText?: string
  remark?: string
}

export function getProjects() {
  return request.get('/projects')
}

export function createProject(payload: ProjectPayload) {
  return request.post('/projects', payload)
}

export function updateProject(id: number, payload: ProjectPayload) {
  return request.put(`/projects/${id}`, payload)
}

export function deleteProject(id: number) {
  return request.delete(`/projects/${id}`)
}

export function createProjectParty(projectId: number, payload: ProjectPartyPayload) {
  return request.post(`/projects/${projectId}/parties`, payload)
}

export function getProjectParties(projectId: number) {
  return request.get(`/projects/${projectId}/parties`)
}
