import axios from 'axios'

// Experiment 8: all HTTP calls to the Spring Boot backend go through one Axios instance.
// VITE_API_URL is set at build time (Docker); in `npm run dev` the Vite proxy forwards /api -> :8080.
const API_BASE = import.meta.env.VITE_API_URL || '/api'

const http = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// attach the JWT to every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('opportunex_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// turn every failure into an Error with a readable message (and the HTTP status, if any)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    let message
    if (err.response) {
      const d = err.response.data
      message = d?.error || d?.message || (typeof d === 'string' && d) || `Request failed (${err.response.status})`
    } else {
      message = 'Cannot reach the server. Please check that the backend is running and try again.'
    }
    const e = new Error(message)
    e.status = err.response?.status ?? 0
    return Promise.reject(e)
  }
)

const request = async (method, path, data, params) =>
  (await http.request({ method, url: path, data, params })).data

export const api = {
  login: (email, password) => request('post', '/auth/login', { email, password }),
  signup: (name, email, password, college) => request('post', '/auth/signup', { name, email, password, college }),
  me: () => request('get', '/auth/me'),
  events: () => request('get', '/events'),
  event: (id) => request('get', `/events/${id}`),
  join: (id) => request('post', `/events/${id}/join`),
  createEvent: (data) => request('post', '/events', data),
  updateEvent: (id, data) => request('put', `/events/${id}`, data),
  cancelEvent: (id) => request('delete', `/events/${id}`),
  dashboard: (id) => request('get', `/events/${id}/dashboard`),
  checkin: (id, data) => request('post', `/events/${id}/checkin`, data),
  attendeeToggle: (id, studentName) => request('post', `/events/${id}/attendee-toggle`, { studentName }),
  profile: (data) => request('put', '/profile', data),
  addInterest: (interest) => request('post', '/profile/interests', { interest }),
  removeInterest: (interest) => request('delete', '/profile/interests', undefined, { interest }),
  follows: () => request('get', '/profile/follows'),
  follow: (organizer) => request('post', '/profile/follow', { organizer }),
}
