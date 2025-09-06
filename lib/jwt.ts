import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function signJWT(payload: Record<string, any>, options: { expiresIn?: string } = {}) {
  const { expiresIn = "1h" } = options

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export const verifyToken = verifyJWT
