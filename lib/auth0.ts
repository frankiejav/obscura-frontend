import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Map APP_BASE_URL to AUTH0_BASE_URL if needed
if (process.env.APP_BASE_URL && !process.env.AUTH0_BASE_URL) {
  process.env.AUTH0_BASE_URL = process.env.APP_BASE_URL;
}

// Create the Auth0 client - it will use environment variables automatically
export const auth0 = new Auth0Client();


