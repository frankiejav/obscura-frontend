export async function apiCall(
  url: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<Response> {
  const token = localStorage.getItem("token")
  
  if (requireAuth && !token) {
    throw new Error("No authentication token")
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (requireAuth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    
    if (response.status === 401) {
      // Token is invalid, redirect to login
      localStorage.removeItem("token")
      window.location.href = "/login"
      throw new Error("Authentication failed")
    }
    
    throw new Error(error.error || `Request failed with status ${response.status}`)
  }

  return response
}

export async function apiCallWithData<T>(
  url: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<T> {
  const response = await apiCall(url, options, requireAuth)
  return response.json()
} 