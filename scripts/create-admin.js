const { Client } = require("pg")
const bcrypt = require("bcrypt")
const readline = require("readline")

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Function to prompt user for input
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

// Function to prompt for password (hidden input)
function questionPassword(prompt) {
  return new Promise((resolve) => {
    const stdin = process.stdin
    const stdout = process.stdout

    stdout.write(prompt)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding("utf8")

    let password = ""

    stdin.on("data", (char) => {
      char = char + ""

      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.setRawMode(false)
          stdin.pause()
          stdout.write("\n")
          resolve(password)
          break
        case "\u0003":
          process.exit()
          break
        case "\u007f": // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1)
            stdout.write("\b \b")
          }
          break
        default:
          password += char
          stdout.write("*")
          break
      }
    })
  })
}

async function createAdminUser() {
  console.log("🔐 Obscura Labs Admin Account Setup")
  console.log("=====================================\n")

  try {
    // Get admin details from user
    const name = await question("Enter admin full name: ")
    const email = await question("Enter admin email: ")
    const password = await questionPassword("Enter admin password (min 8 chars): ")
    const confirmPassword = await questionPassword("Confirm admin password: ")

    // Validate input
    if (!name || !email || !password) {
      console.error("❌ All fields are required")
      process.exit(1)
    }

    if (password !== confirmPassword) {
      console.error("❌ Passwords do not match")
      process.exit(1)
    }

    if (password.length < 8) {
      console.error("❌ Password must be at least 8 characters long")
      process.exit(1)
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error("❌ Invalid email format")
      process.exit(1)
    }

    console.log("\n🔄 Creating admin account...")

    // Connect to database
    const client = new Client({
      connectionString:
        process.env.DATABASE_URL || "postgresql://obscura_user:obscura_password_dev@localhost:5432/obscura_labs",
    })

    await client.connect()
    console.log("✅ Connected to database")

    // Check if user already exists
    const existingUser = await client.query("SELECT id, email, role FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0]
      if (user.role === "admin") {
        console.log("⚠️  Admin user already exists with this email")
        const update = await question("Do you want to update the password? (y/N): ")

        if (update.toLowerCase() === "y" || update.toLowerCase() === "yes") {
          // Update existing user password
          const passwordHash = await bcrypt.hash(password, 12)
          await client.query(
            "UPDATE users SET password_hash = $1, name = $2, updated_at = CURRENT_TIMESTAMP WHERE email = $3",
            [passwordHash, name, email],
          )
          console.log("✅ Admin password updated successfully")
        } else {
          console.log("❌ Operation cancelled")
        }
      } else {
        // Promote existing user to admin
        const promote = await question("User exists as client. Promote to admin? (y/N): ")

        if (promote.toLowerCase() === "y" || promote.toLowerCase() === "yes") {
          const passwordHash = await bcrypt.hash(password, 12)
          await client.query(
            "UPDATE users SET role = $1, password_hash = $2, name = $3, updated_at = CURRENT_TIMESTAMP WHERE email = $4",
            ["admin", passwordHash, name, email],
          )
          console.log("✅ User promoted to admin successfully")
        } else {
          console.log("❌ Operation cancelled")
        }
      }
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 12)

      const result = await client.query(
        `INSERT INTO users (email, name, password_hash, role, is_active) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, name, role, created_at`,
        [email, name, passwordHash, "admin", true],
      )

      const newAdmin = result.rows[0]
      console.log("✅ Admin user created successfully")
      console.log(`📧 Email: ${newAdmin.email}`)
      console.log(`👤 Name: ${newAdmin.name}`)
      console.log(`🔑 Role: ${newAdmin.role}`)
      console.log(`📅 Created: ${newAdmin.created_at}`)

      // Log the admin creation in audit logs
      await client.query(
        `INSERT INTO audit_logs (user_id, action, details, ip_address) 
         VALUES ($1, $2, $3, $4)`,
        [
          newAdmin.id,
          "ADMIN_CREATED",
          JSON.stringify({
            created_by: "setup_script",
            email: newAdmin.email,
            name: newAdmin.name,
          }),
          "127.0.0.1",
        ],
      )
    }

    await client.end()
    console.log("\n🎉 Admin setup completed successfully!")
    console.log("You can now login to the application with these credentials.")
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Check if required environment variables are set
if (!process.env.DATABASE_URL && !process.env.POSTGRES_USER) {
  console.error("❌ Database connection not configured")
  console.error("Please set DATABASE_URL environment variable or run from project directory")
  process.exit(1)
}

// Run the script
createAdminUser()
