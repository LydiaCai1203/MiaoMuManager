import request from '../utils/request'

export function downloadSeedlingTemplate() {
  return fetch('/api/templates/seedling', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('asset-evaluation-token') ?? ''}`,
    },
  }).then((response) => response.blob())
}

export function downloadAppendageTemplate() {
  return fetch('/api/templates/appendage', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('asset-evaluation-token') ?? ''}`,
    },
  }).then((response) => response.blob())
}

export function importSeedling(formData: FormData) {
  return request.post('/import/seedling', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function importAppendage(formData: FormData) {
  return request.post('/import/appendage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
