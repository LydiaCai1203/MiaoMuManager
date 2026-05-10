import request from '../utils/request'

export interface LoginPayload {
  username: string
  password: string
}

export interface AuthUser {
  username: string
  realName: string
  roleCode: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export function login(payload: LoginPayload) {
  return request.post('/auth/login', payload)
}

export function getMe() {
  return request.get('/auth/me')
}

export interface UserRecord {
  id: number
  username: string
  realName: string
  phone?: string | null
  status: string
}

export interface UserPayload {
  username: string
  realName: string
  phone?: string
  status: string
}

export function getUsers() {
  return request.get('/auth/users')
}

export function createUser(payload: UserPayload) {
  return request.post('/auth/users', payload)
}

export function updateUser(id: number, payload: UserPayload) {
  return request.put(`/auth/users/${id}`, payload)
}

export function deleteUser(id: number) {
  return request.delete(`/auth/users/${id}`)
}
