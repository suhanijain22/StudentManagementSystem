import { API_URL } from '../config';

let getToken = () => null;
let onUnauthorized = () => {};

export function configureApi(handlers) {
  if (handlers.getToken) getToken = handlers.getToken;
  if (handlers.onUnauthorized) onUnauthorized = handlers.onUnauthorized;
}

export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = null) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request(path, { method = 'GET', body, auth = true, token } = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const jwt = token || (auth ? getToken() : null);
  if (jwt) headers.Authorization = `Bearer ${jwt}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    throw new ApiError(`Cannot reach server at ${API_URL}. Check that the backend is running and reachable.`, 0);
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }

  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized();
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data?.fieldErrors || null);
  }
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  me: (token) => request('/auth/me', { token }),
  leaderboard: ({ page, size, sortBy, direction }) =>
    request(`/leaderboard?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`),
  myStanding: () => request('/leaderboard/me'),
  awardPoints: (studentId, points) => request(`/leaderboard/${studentId}/points`, { method: 'POST', body: { points } }),
};
