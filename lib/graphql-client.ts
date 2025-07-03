"use client"

// This is a simple GraphQL client for making requests to our API
export async function executeGraphQLQuery(query: string, variables: Record<string, any> = {}) {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || "GraphQL request failed")
  }

  return response.json()
}
