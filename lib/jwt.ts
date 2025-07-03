import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_for_development_only")

export async function signJWT(payload: any, expiresIn = "15m"): Promise<string> {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + Number.parseInt(expiresIn) * 60

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setNotBefore(iat)
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}
