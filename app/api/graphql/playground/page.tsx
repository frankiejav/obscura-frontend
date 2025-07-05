'use client'

import { useState } from 'react'

export default function GraphQLPlayground() {
  const [query, setQuery] = useState(`query {
  me {
    id
    name
    email
    role
  }
}`)
  const [variables, setVariables] = useState('{}')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const executeQuery = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: JSON.parse(variables),
        }),
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">GraphQL Playground</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Query Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="Enter your GraphQL query..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variables (JSON)
              </label>
              <textarea
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                className="w-full h-32 p-4 border border-gray-300 rounded-md font-mono text-sm"
                placeholder='{"key": "value"}'
              />
            </div>
            
            <button
              onClick={executeQuery}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Executing...' : 'Execute Query'}
            </button>
          </div>

          {/* Result Output */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Result
            </label>
            <textarea
              value={result}
              readOnly
              className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm bg-gray-50"
              placeholder="Query results will appear here..."
            />
          </div>
        </div>

        {/* Example Queries */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Example Queries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Get Current User</h3>
              <pre className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
{`query {
  me {
    id
    name
    email
    role
  }
}`}
              </pre>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Search Data Records</h3>
              <pre className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
{`query {
  search(term: "example", type: "ALL", page: 1, limit: 10) {
    results {
      id
      name
      email
      source
      timestamp
    }
    pagination {
      total
      pages
      current
    }
  }
}`}
              </pre>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Get Data Records</h3>
              <pre className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
{`query {
  dataRecords(first: 10) {
    edges {
      node {
        id
        name
        email
        source
        timestamp
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}`}
              </pre>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Login Mutation</h3>
              <pre className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
{`mutation {
  login(email: "admin@obscura.com", password: "password") {
    token
    refreshToken
    user {
      id
      name
      email
      role
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 