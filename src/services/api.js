// ============================================
// API Service — All backend communication
// Matches the exact 39-endpoint contract from backend audit
// ============================================

import { supabase } from './supabase'

const rawBase = import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_SERVER_URL || (
    typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      ? 'https://shawkat-tech.up.railway.app'
      : 'http://localhost:5000'
  )

export const API_BASE = (rawBase || '').trim().replace(/\/+$/, '').replace(/\/api$/, '')

// ---- Core Request Function ----

async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options

  const config = {
    method,
    headers: {
      ...headers
    }
  }

  // Attach auth token for protected routes
  if (!skipAuth) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`
    }
  }

  // Only apply JSON headers and body rules for non-read methods (POST, PATCH, DELETE, PUT)
  if (method !== 'GET' && method !== 'HEAD') {
    if (body instanceof FormData) {
      config.body = body
      delete config.headers['Content-Type']
    } else {
      config.headers['Content-Type'] = 'application/json'
      config.body = JSON.stringify(body || {})
    }
  }

  const url = `${API_BASE}${endpoint}`
  const response = await fetch(url, config)

  let data
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    const text = await response.text()
    throw new Error(`API responded with ${response.status}: ${text.slice(0, 120)}`)
  }

  if (!data.success) {
    const error = new Error(data.error?.message || 'Request failed')
    error.code = data.error?.code || 'UNKNOWN'
    error.details = data.error?.details || null
    error.status = response.status
    throw error
  }

  return data
}

// ============================================
// CLIENT IN-MEMORY SWR CACHE
// Ensures instant (<0.01s) tab switching & page rendering
// ============================================

const clientMemoryCache = new Map()

export function getCachedOrFetch(key, fetcher, ttlMs = 180000) {
  const cached = clientMemoryCache.get(key)
  const now = Date.now()

  // Fresh cache hit — return immediately in < 1 millisecond
  if (cached && (now - cached.timestamp < ttlMs)) {
    return Promise.resolve(cached.data)
  }

  // Fetch from network
  const fetchPromise = fetcher().then((data) => {
    clientMemoryCache.set(key, { data, timestamp: Date.now() })
    return data
  })

  // Stale-while-revalidate: if we have cached data, return it immediately while refreshing in background
  if (cached) {
    return Promise.resolve(cached.data)
  }

  return fetchPromise
}

export function invalidateClientCache(prefix) {
  if (!prefix) {
    clientMemoryCache.clear()
    return
  }
  for (const key of clientMemoryCache.keys()) {
    if (key.startsWith(prefix)) {
      clientMemoryCache.delete(key)
    }
  }
}

// ============================================
// PUBLIC ENDPOINTS (no auth)
// ============================================

export const publicApi = {
  health: () =>
    request('/api/health', { skipAuth: true }),

  getCourses: (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.per_page) query.set('per_page', params.per_page)
    if (params.category) query.set('category', params.category)
    if (params.search) query.set('search', params.search)
    const qs = query.toString()
    const path = `/api/courses${qs ? `?${qs}` : ''}`

    // Instant SWR cache for catalog browsing (without dynamic search queries)
    if (!params.search) {
      return getCachedOrFetch(`courses:${qs}`, () => request(path, { skipAuth: true }))
    }
    return request(path, { skipAuth: true })
  },

  getFeaturedCourses: () =>
    getCachedOrFetch('courses:featured', () => request('/api/courses/featured', { skipAuth: true })),

  getCourseBySlug: (slug) =>
    getCachedOrFetch(`course:${slug}`, () => request(`/api/courses/${slug}`, { skipAuth: true })),

  getPackages: () =>
    getCachedOrFetch('packages:list', () => request('/api/packages', { skipAuth: true }))
}

// ============================================
// STUDENT ENDPOINTS (auth required)
// ============================================

export const studentApi = {
  getProfile: () =>
    request('/api/me'),

  updateProfile: (data) =>
    request('/api/me', { method: 'PATCH', body: data }),

  createEnrollment: (data) =>
    request('/api/enrollments', { method: 'POST', body: data }),

  getMyEnrollments: () =>
    request('/api/me/enrollments'),

  getMyLiveClasses: () =>
    request('/api/me/live-classes'),

  getJoinToken: (classId) =>
    request(`/api/live-classes/${classId}/join-token`, { method: 'POST' }),

  getMyRecordings: (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.per_page) query.set('per_page', params.per_page)
    if (params.course_id) query.set('course_id', params.course_id)
    const qs = query.toString()
    return request(`/api/me/recordings${qs ? `?${qs}` : ''}`)
  },

  getPlaybackAccess: (recordingId) =>
    request(`/api/recordings/${recordingId}/playback-access`, { method: 'POST' })
}

// ============================================
// ADMIN ENDPOINTS (auth + admin role)
// ============================================

export const adminApi = {
  // Profile
  getProfile: () =>
    request('/api/me'),

  updateProfile: (data) =>
    request('/api/me', { method: 'PATCH', body: data }),

  // Courses
  getCourses: (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.per_page) query.set('per_page', params.per_page)
    if (params.status) query.set('status', params.status)
    if (params.category) query.set('category', params.category)
    if (params.search) query.set('search', params.search)
    const qs = query.toString()
    return request(`/api/admin/courses${qs ? `?${qs}` : ''}`)
  },

  createCourse: (data) =>
    request('/api/admin/courses', { method: 'POST', body: data }),

  updateCourse: (id, data) =>
    request(`/api/admin/courses/${id}`, { method: 'PATCH', body: data }),

  deleteCourse: (id) =>
    request(`/api/admin/courses/${id}`, { method: 'DELETE' }),

  // Packages
  getPackages: (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.status) query.set('status', params.status)
    const qs = query.toString()
    return request(`/api/admin/packages${qs ? `?${qs}` : ''}`)
  },

  createPackage: (data) =>
    request('/api/admin/packages', { method: 'POST', body: data }),

  updatePackage: (id, data) =>
    request(`/api/admin/packages/${id}`, { method: 'PATCH', body: data }),

  deletePackage: (id) =>
    request(`/api/admin/packages/${id}`, { method: 'DELETE' }),

  // Enrollments
  getEnrollments: (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.per_page) query.set('per_page', params.per_page)
    if (params.status) query.set('status', params.status)
    if (params.payment_status) query.set('payment_status', params.payment_status)
    if (params.course_id) query.set('course_id', params.course_id)
    if (params.search) query.set('search', params.search)
    const qs = query.toString()
    return request(`/api/admin/enrollments${qs ? `?${qs}` : ''}`)
  },

  getCourseEnrollments: (courseId, params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.status) query.set('status', params.status)
    const qs = query.toString()
    return request(`/api/admin/courses/${courseId}/enrollments${qs ? `?${qs}` : ''}`)
  },

  updateEnrollment: (id, data) =>
    request(`/api/admin/enrollments/${id}`, { method: 'PATCH', body: data }),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.per_page) query.set('per_page', params.per_page)
    if (params.search) query.set('search', params.search)
    const qs = query.toString()
    return request(`/api/admin/students${qs ? `?${qs}` : ''}`)
  },

  getStudent: (id) =>
    request(`/api/admin/students/${id}`),

  updateStudentStatus: (id, data) =>
    request(`/api/admin/students/${id}/status`, { method: 'PATCH', body: data }),

  // Live Classes
  getLiveClasses: (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.status) query.set('status', params.status)
    if (params.course_id) query.set('course_id', params.course_id)
    const qs = query.toString()
    return request(`/api/admin/live-classes${qs ? `?${qs}` : ''}`)
  },

  createLiveClass: (data) =>
    request('/api/admin/live-classes', { method: 'POST', body: data }),

  updateLiveClass: (id, data) =>
    request(`/api/admin/live-classes/${id}`, { method: 'PATCH', body: data }),

  startLiveClass: (id) =>
    request(`/api/admin/live-classes/${id}/start`, { method: 'POST' }),

  endLiveClass: (id) =>
    request(`/api/admin/live-classes/${id}/end`, { method: 'POST' }),

  cancelLiveClass: (id) =>
    request(`/api/admin/live-classes/${id}/cancel`, { method: 'POST' }),

  startRecording: (classId) =>
    request(`/api/admin/live-classes/${classId}/recording/start`, { method: 'POST' }),

  stopRecording: (classId) =>
    request(`/api/admin/live-classes/${classId}/recording/stop`, { method: 'POST' }),

  // Recordings
  getRecordings: (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.course_id) query.set('course_id', params.course_id)
    if (params.publication_status) query.set('publication_status', params.publication_status)
    if (params.processing_status) query.set('processing_status', params.processing_status)
    const qs = query.toString()
    return request(`/api/admin/recordings${qs ? `?${qs}` : ''}`)
  },

  publishRecording: (id, data = {}) =>
    request(`/api/admin/recordings/${id}/publish`, { method: 'PATCH', body: data }),

  unpublishRecording: (id) =>
    request(`/api/admin/recordings/${id}/unpublish`, { method: 'PATCH' }),

  deleteRecording: (id) =>
    request(`/api/admin/recordings/${id}`, { method: 'DELETE' })
}

// ============================================
// UPLOAD ENDPOINTS (auth required)
// ============================================

export const uploadApi = {
  uploadImage: async (file, folder = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return request('/api/upload', {
      method: 'POST',
      body: formData
    })
  }
}