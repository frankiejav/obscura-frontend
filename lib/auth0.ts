import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Map APP_BASE_URL to AUTH0_BASE_URL if needed
if (process.env.APP_BASE_URL && !process.env.AUTH0_BASE_URL) {
  process.env.AUTH0_BASE_URL = process.env.APP_BASE_URL;
}

// Create and export the auth0 instance for server-side usage
export const auth0 = new Auth0Client();


