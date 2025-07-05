import { type NextRequest, NextResponse } from "next/server"
import { graphql } from "graphql"
import { schema } from "@/lib/graphql-schema"
import { resolvers } from "@/lib/graphql-resolvers"
import { verifyJWT } from "@/lib/jwt"
import { rateLimit } from "@/lib/rate-limit"
import { logRequest } from "@/lib/audit-logger"
import { checkConnection } from "@/lib/elasticsearch"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const limiter = await rateLimit(request)
    if (!limiter.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    // Check Elasticsearch connection (optional - only if configured)
    const isConnected = await checkConnection()
    if (isConnected === false) {
      // Only return error if we have Elasticsearch configured but it's not working
      if (process.env.ELASTICSEARCH_HOST || process.env.ELASTICSEARCH_URL) {
        console.log('Elasticsearch connection failed, but continuing for settings queries')
      }
      // If no Elasticsearch is configured, continue without it
      console.log('Elasticsearch not configured - continuing without database features')
    }

    // Authentication check (optional for some queries)
    let user = null
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]
      const payload = await verifyJWT(token)
      if (payload) {
        user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        }
      }
    }

    // Log the request for audit purposes
    if (user) {
      await logRequest({
        userId: user.id,
        action: "graphql_query",
        details: {
          ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      })
    }

    // Parse the GraphQL request
    const body = await request.json()
    const { query, variables, operationName } = body

    // Input validation
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Execute GraphQL query
    const result = await graphql({
      schema,
      source: query,
      rootValue: resolvers,
      variableValues: variables,
      operationName,
      contextValue: { user },
    })

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      console.error("GraphQL errors:", result.errors)
      return NextResponse.json({
        errors: result.errors.map(error => ({
          message: error.message,
          locations: error.locations,
          path: error.path,
        })),
      }, { status: 400 })
    }

    return NextResponse.json({
      data: result.data,
    })
  } catch (error) {
    console.error("GraphQL API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Handle GET requests for GraphQL Playground
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "GraphQL API is running. Use POST to send queries.",
    playground: "/api/graphql/playground",
  })
}
