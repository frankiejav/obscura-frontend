const { neon } = require("@neondatabase/serverless")
const fs = require("fs")
const path = require("path")

async function setupNeonDatabase() {
  console.log("🔧 Setting up Neon Database Schema...")
  console.log("=====================================\n")

  try {
    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL environment variable is not set")
      console.error("Please add your Neon database URL to .env.local")
      console.error("Example: DATABASE_URL=postgresql://user:pass@host/db")
      process.exit(1)
    }

    // Connect to Neon
    const sql = neon(process.env.DATABASE_URL)
    console.log("✅ Connected to Neon database")

    // Read and execute schema file
    const schemaPath = path.join(__dirname, "init-schema.sql")
    if (!fs.existsSync(schemaPath)) {
      console.error("❌ Schema file not found:", schemaPath)
      process.exit(1)
    }

    const schemaSQL = fs.readFileSync(schemaPath, "utf8")

    // Split SQL into individual statements (simple approach)
    const statements = schemaSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"))

    console.log(`📝 Executing ${statements.length} SQL statements...\n`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          await sql([statement])

          // Log major operations
          if (statement.includes("CREATE TABLE")) {
            const tableName = statement.match(/CREATE TABLE.*?(\w+)/i)?.[1]
            console.log(`✅ Created table: ${tableName}`)
          } else if (statement.includes("CREATE INDEX")) {
            const indexName = statement.match(/CREATE INDEX.*?(\w+)/i)?.[1]
            console.log(`✅ Created index: ${indexName}`)
          } else if (statement.includes("CREATE TRIGGER")) {
            const triggerName = statement.match(/CREATE TRIGGER.*?(\w+)/i)?.[1]
            console.log(`✅ Created trigger: ${triggerName}`)
          } else if (statement.includes("CREATE EXTENSION")) {
            console.log("✅ Enabled UUID extension")
          } else if (statement.includes("CREATE OR REPLACE FUNCTION")) {
            const funcName = statement.match(/CREATE OR REPLACE FUNCTION.*?(\w+)/i)?.[1]
            console.log(`✅ Created function: ${funcName}`)
          }
        } catch (error) {
          // Skip errors for things that already exist
          if (error.message.includes("already exists")) {
            continue
          }
          console.error(`❌ Error executing statement ${i + 1}:`, error.message)
          console.error("Statement:", statement.substring(0, 100) + "...")
        }
      }
    }

    console.log("\n🔍 Verifying database setup...")

    // Verify tables were created
    const tables = await sql(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    console.log("📋 Created tables:")
    tables.forEach((table) => {
      console.log(`   • ${table.table_name}`)
    })

    // Check if we have any users (should be empty for new setup)
    const userCount = await sql(`SELECT COUNT(*) as count FROM users`)
    console.log(`\n👤 Current user count: ${userCount[0].count}`)

    if (userCount[0].count === 0) {
      console.log("\n⚠️  No admin users found.")
      console.log("Run 'npm run db:admin' to create your first admin account.")
    }

    console.log("\n🎉 Neon database setup completed successfully!")
    console.log("\nNext steps:")
    console.log("1. Run 'npm run db:admin' to create an admin account")
    console.log("2. Start your application with 'npm run dev'")
    console.log("3. Login with your admin credentials")
  } catch (error) {
    console.error("❌ Error setting up database:", error.message)
    console.error("\nTroubleshooting:")
    console.error("1. Check your DATABASE_URL is correct")
    console.error("2. Ensure your Neon database is accessible")
    console.error("3. Verify your connection string includes ?sslmode=require")
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  setupNeonDatabase()
}

module.exports = { setupNeonDatabase }
