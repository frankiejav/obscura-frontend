import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Create Auth0 client with error handling
let auth0: Auth0Client | null = null;

try {
  // Check for AUTH0_BASE_URL or APP_BASE_URL (for backward compatibility)
  const baseUrl = process.env.AUTH0_BASE_URL || process.env.APP_BASE_URL;
  
  // Only initialize if all required environment variables are present
  if (
    process.env.AUTH0_SECRET &&

    baseUrl &&
    process.env.AUTH0_ISSUER_BASE_URL &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET
  ) {
    // Set AUTH0_BASE_URL if APP_BASE_URL was used
    if (!process.env.AUTH0_BASE_URL && process.env.APP_BASE_URL) {
      process.env.AUTH0_BASE_URL = process.env.APP_BASE_URL;
    }
    auth0 = new Auth0Client();
  } else {
    console.warn('Auth0 not initialized: Missing required environment variables');
    console.warn('Required variables: AUTH0_SECRET, AUTH0_BASE_URL (or APP_BASE_URL), AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET');
  }
} catch (error) {
  console.error('Failed to initialize Auth0 client:', error);
}

export { auth0 };


