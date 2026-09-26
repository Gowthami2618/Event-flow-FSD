import API from './api';

export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => API.put('/auth/change-password', data),
  getNotifications: () => API.get('/auth/notifications'),
  markNotificationRead: (id) => API.put(`/auth/notifications/${id}/read`),
};

export const eventService = {
  getEvents: (params) => API.get('/events', { params }),
  getEvent: (idOrSlug) => API.get(`/events/${idOrSlug}`),
  createEvent: (data) => API.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateEvent: (id, data) => API.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteEvent: (id) => API.delete(`/events/${id}`),
  submitEvent: (id) => API.put(`/events/${id}/submit`),
  getMyEvents: (params) => API.get('/events/organizer/my-events', { params }),
  getEventAttendees: (id) => API.get(`/events/${id}/attendees`),
  getEventAnalytics: (id) => API.get(`/events/${id}/analytics`),
  addExpense: (id, data) => API.post(`/events/${id}/budget/expenses`, data),
  deleteExpense: (id, expenseId) => API.delete(`/events/${id}/budget/expenses/${expenseId}`),
  getPublicCategories: () => API.get('/events/categories-public'),
};

export const registrationService = {
  register: (eventId, data) => API.post(`/registrations/${eventId}`, data),
  cancel: (id, data) => API.put(`/registrations/${id}/cancel`, data),
  getMyRegistrations: (params) => API.get('/registrations/my', { params }),
  getTicket: (id) => API.get(`/registrations/${id}/ticket`),
  checkIn: (data) => API.put('/registrations/checkin', data),
};

export const reviewService = {
  create: (eventId, data) => API.post(`/reviews/${eventId}`, data),
  getEventReviews: (eventId, params) => API.get(`/reviews/${eventId}`, { params }),
  respond: (id, data) => API.put(`/reviews/${id}/respond`, data),
};

export const adminService = {
  getDashboard: () => API.get('/admin/dashboard'),
  getAnalytics: () => API.get('/admin/analytics'),
  getUsers: (params) => API.get('/admin/users', { params }),
  suspendUser: (id, data) => API.put(`/admin/users/${id}/suspend`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getAllEvents: (params) => API.get('/admin/events', { params }),
  approveEvent: (id) => API.put(`/admin/events/${id}/approve`),
  rejectEvent: (id, data) => API.put(`/admin/events/${id}/reject`, data),
  featureEvent: (id) => API.put(`/admin/events/${id}/feature`),
  getCategories: () => API.get('/admin/categories'),
  createCategory: (data) => API.post('/admin/categories', data),
  updateCategory: (id, data) => API.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/admin/categories/${id}`),
  getAuditLogs: (params) => API.get('/admin/audit-logs', { params }),
};
