import { API_BASE_URL } from '../config'

export class AuthRequiredError extends Error {
  constructor() {
    super('Sign-in required or expired')
  }
}

export class ApiError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

// Calls the payments backend with a bearer Google ID token. `getFreshIdToken`
// is AuthContext's helper — it returns the current token or attempts a
// silent re-auth if none is available yet.
export async function apiRequest(path, { method = 'GET', body: requestBody, getFreshIdToken } = {}) {
  const idToken = await getFreshIdToken()
  if (!idToken) {
    throw new AuthRequiredError()
  }

  const headers = { Authorization: `Bearer ${idToken}` }
  if (requestBody !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody !== undefined ? JSON.stringify(requestBody) : undefined,
  })

  if (res.status === 401) {
    throw new AuthRequiredError()
  }

  let responseBody = null
  try {
    responseBody = await res.json()
  } catch {
    // No/invalid JSON body — fall through to the ok/error handling below.
  }

  if (!res.ok) {
    throw new ApiError(responseBody?.error || 'Request failed', responseBody?.error)
  }

  return responseBody
}
