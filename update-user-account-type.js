#!/usr/bin/env node

/**
 * Script to update a user's account type in Auth0
 * This is useful for existing users created before the account type system was implemented
 */

require('dotenv').config();
const { ManagementClient } = require('auth0');

async function updateUserAccountType() {
  // Check for required environment variables
  const required = ['AUTH0_DOMAIN', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  // Get user email from command line argument
  const userEmail = process.argv[2];
  const accountType = process.argv[3] || 'professional';
  
  if (!userEmail) {
    console.log('Usage: node update-user-account-type.js <user_email> [account_type]');
    console.log('Account types: free, starter, professional, enterprise');
    console.log('Example: node update-user-account-type.js user@example.com professional');
    process.exit(1);
  }

  const validTypes = ['free', 'starter', 'professional', 'enterprise'];
  if (!validTypes.includes(accountType)) {
    console.error('Invalid account type. Must be one of:', validTypes.join(', '));
    process.exit(1);
  }

  try {
    // Initialize Management API client
    const management = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      scope: 'read:users update:users update:users_app_metadata'
    });

    // Search for user by email
    console.log(`Searching for user with email: ${userEmail}`);
    const users = await management.getUsers({
      q: `email:"${userEmail}"`,
      search_engine: 'v3'
    });

    if (users.length === 0) {
      console.error(`No user found with email: ${userEmail}`);
      process.exit(1);
    }

    const user = users[0];
    console.log(`Found user: ${user.user_id}`);
    console.log(`Current app_metadata:`, user.app_metadata || 'None');

    // Update user metadata with account type and subscription info
    const updatedMetadata = {
      ...user.app_metadata,
      account_type: accountType,
      subscription: {
        status: 'active',
        startDate: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // For professional/enterprise, mark as manually provisioned
        ...(accountType !== 'free' && {
          paymentMethod: 'manual',
          notes: 'Account provisioned by admin'
        })
      }
    };

    console.log(`\nUpdating user account type to: ${accountType}`);
    
    await management.updateAppMetadata(
      { id: user.user_id },
      updatedMetadata
    );

    console.log('✅ Successfully updated user account type!');
    console.log('\nUpdated app_metadata:', updatedMetadata);
    
    // Provide additional instructions
    console.log('\n📝 Next steps:');
    console.log('1. Ask the user to log out and log back in to refresh their session');
    console.log('2. They should now have access to features based on their account type');
    console.log(`\nAccount type "${accountType}" includes:`);
    
    const features = {
      free: ['Basic search', 'Dashboard access', 'Limited lookups'],
      starter: ['Everything in Free', 'Data export', '1000 lookups/month', 'Email support'],
      professional: ['Everything in Starter', 'API access', 'Credential monitoring', 'Unlimited lookups', 'Priority support'],
      enterprise: ['Everything in Professional', 'Real-time feeds', 'Custom analytics', 'Dedicated support']
    };
    
    features[accountType].forEach(feature => {
      console.log(`  - ${feature}`);
    });

  } catch (error) {
    console.error('Error updating user:', error.message);
    if (error.statusCode === 401) {
      console.error('\n❌ Authentication failed. Please check your Auth0 credentials.');
      console.error('Make sure you have a Machine-to-Machine application with the Management API authorized.');
    } else if (error.statusCode === 403) {
      console.error('\n❌ Insufficient permissions. Make sure your Auth0 application has the required scopes.');
    }
    process.exit(1);
  }
}

updateUserAccountType();
