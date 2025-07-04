const { Client } = require("pg")
const bcrypt = require("bcryptjs")
const readline = require("readline")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((r) => rl.question(q, r))

async function promptPwd(label) {
  process.stdout.write(label)
  process.stdin.setRawMode(true)
  return new Promise((resolve) => {
    let pwd = ""
    process.stdin.on("data", (c) => {
      c = c.toString()
      if (c === "\n" || c === "\r" || c === "\u0004") {
        process.stdin.setRawMode(false)
        process.stdin.pause()
        process.stdout.write("\n")
        resolve(pwd)
      } else if (c === "\u0003") {
        process.exit()
      } else if (c === "\u007f") {
        pwd = pwd.slice(0, -1)
        process.stdout.write("\b \b")
      } else {
        pwd += c
        process.stdout.write("*")
      }
    })
  })
}
;(async () => {
  console.log("\n🔐  Obscura Labs Admin Setup\n")

  const name = await ask("Full name: ")
  const email = await ask("Email: ")
  const pwd1 = await promptPwd("Password (min 8 chars): ")
  const pwd2 = await promptPwd("Confirm password: ")

  if (!name || !email || !pwd1) throw new Error("All fields required")
  if (pwd1 !== pwd2) throw new Error("Passwords do not match")
  if (pwd1.length < 8) throw new Error("Password too short")

  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ?? "postgresql://obscura_user:obscura_password_dev@localhost:5432/obscura_labs",
  })

  await client.connect()
  const { rows } = await client.query("SELECT id, role FROM users WHERE email = $1", [email])

  const hash = await bcrypt.hash(pwd1, 12)

  if (rows.length) {
    console.log("User exists – promoting to admin & updating password")
    await client.query(
      "UPDATE users SET role='admin', password_hash=$1, name=$2, updated_at=CURRENT_TIMESTAMP WHERE email=$3",
      [hash, name, email],
    )
  } else {
    await client.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, 'admin', true)`,
      [name, email, hash],
    )
  }

  await client.end()
  console.log("✅  Admin account ready")
  rl.close()
})().catch((e) => {
  console.error("❌", e.message)
  process.exit(1)
})
