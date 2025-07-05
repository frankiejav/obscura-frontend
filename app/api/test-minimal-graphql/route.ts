import { NextRequest, NextResponse } from 'next/server'
import { graphql, buildSchema } from 'graphql'

// Minimal schema
const schema = buildSchema(`
  type Settings {
    general: GeneralSettings!
    leakCheck: LeakCheckSettings!
  }

  type GeneralSettings {
    apiUrl: String!
  }

  type LeakCheckSettings {
    enabled: Boolean!
    quota: Int!
  }

  type Query {
    settings: Settings!
  }
`)

// Minimal resolver
const resolvers = {
  Query: {
    settings: async () => {
      console.log('Minimal settings resolver called')
      return {
        general: {
          apiUrl: "test"
        },
        leakCheck: {
          enabled: false,
          quota: 0
        }
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    const result = await graphql({
      schema,
      source: query,
      rootValue: resolvers,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Minimal GraphQL error:', error)
    return NextResponse.json({
      errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
    }, { status: 500 })
  }
} 