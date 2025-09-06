async function refreshToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      return false
    }

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (response.ok) {
      const data = await response.json()
      localStorage.setItem("token", data.token)
      return true
    } else {
      // Refresh token is invalid
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      return false
    }
  } catch (error) {
    console.error("Token refresh failed:", error)
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    return false
  }
}

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

  let response = await fetch(url, {
    ...options,
    headers,
  })

  // If we get a 401 and this is an authenticated request, try to refresh the token
  if (response.status === 401 && requireAuth) {
    const refreshSuccess = await refreshToken()
    if (refreshSuccess) {
      // Retry the request with the new token
      const newToken = localStorage.getItem("token")
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`
        response = await fetch(url, {
          ...options,
          headers,
        })
      }
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    
    if (response.status === 401) {
      // Token is still invalid after refresh attempt, redirect to login
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
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