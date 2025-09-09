import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Create Auth0 client with error handling
let auth0: Auth0Client | null = null;

try {
  // Only initialize if all required environment variables are present
  if (
    process.env.AUTH0_SECRET &&
    process.env.AUTH0_BASE_URL &&
    process.env.AUTH0_ISSUER_BASE_URL &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET
  ) {
    auth0 = new Auth0Client();
  } else {
    console.warn('Auth0 not initialized: Missing required environment variables');
  }
} catch (error) {
  console.error('Failed to initialize Auth0 client:', error);
}

export { auth0 };


