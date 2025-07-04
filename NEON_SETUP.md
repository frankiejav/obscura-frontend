# Neon Database Setup Guide

This guide explains how to set up your Obscura Labs application with Neon Database (serverless PostgreSQL).

## Prerequisites

1. **Neon Account**: Sign up at [neon.tech](https://neon.tech)
2. **Node.js**: Version 18 or higher
3. **Project Dependencies**: Run `npm install` in your project

## Step 1: Create Neon Database

### 1.1 Create New Project
1. Go to [Neon Console](https://console.neon.tech)
2. Click "Create Project"
3. Choose your settings:
   - **Project Name**: `obscura-labs`
   - **Database Name**: `obscura_db`
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 15 (recommended)

### 1.2 Get Connection String
1. In your Neon project dashboard
2. Go to "Connection Details"
3. Copy the connection string (it looks like):
   \`\`\`
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/obscura_db?sslmode=require
   \`\`\`

## Step 2: Configure Environment

### 2.1 Create Environment File
Create `.env.local` in your project root:

\`\`\`bash
# Neon Database
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/obscura_db?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Elasticsearch (if using)
ELASTICSEARCH_URL=your-elasticsearch-url
ELASTICSEARCH_API_KEY=your-api-key
\`\`\`

### 2.2 Update Package.json Scripts
Add these scripts to your `package.json`:

\`\`\`json
{
  "scripts": {
    "db:setup": "node scripts/setup-neon.js",
    "db:admin": "node scripts/create-admin-neon.js",
    "db:reset": "node scripts/setup-neon.js && node scripts/create-admin-neon.js"
  }
}
\`\`\`

## Step 3: Initialize Database Schema

### 3.1 Install Neon Dependencies
\`\`\`bash
npm install @neondatabase/serverless
\`\`\`

### 3.2 Run Schema Setup
\`\`\`bash
# Load environment variables and setup schema
npm run db:setup
\`\`\`

This will:
- ✅ Create all required tables
- ✅ Set up indexes for performance
- ✅ Create triggers for automatic timestamps
- ✅ Enable Row Level Security (RLS)
- ✅ Set up audit logging

### 3.3 Expected Output
\`\`\`bash
🔧 Setting up Neon Database Schema...
=====================================

✅ Connected to Neon database
📝 Executing 45 SQL statements...

✅ Enabled UUID extension
✅ Created table: users
✅ Created table: audit_logs
✅ Created table: user_sessions
✅ Created table: data_sources
✅ Created table: search_queries
✅ Created index: idx_users_email
✅ Created index: idx_users_role
✅ Created function: update_updated_at_column
✅ Created trigger: update_users_updated_at

🔍 Verifying database setup...
📋 Created tables:
   • audit_logs
   • data_sources
   • search_queries
   • user_sessions
   • users

👤 Current user count: 0

⚠️  No admin users found.
Run 'npm run db:admin' to create your first admin account.

🎉 Neon database setup completed successfully!

Next steps:
1. Run 'npm run db:admin' to create an admin account
2. Start your application with 'npm run dev'
3. Login with your admin credentials
\`\`\`

## Step 4: Create Your Admin Account

### 4.1 Create Custom Admin
\`\`\`bash
npm run db:admin
\`\`\`

### 4.2 Interactive Setup
\`\`\`bash
🔐 Obscura Labs Admin Account Setup (Neon)
==========================================

Enter admin full name: John Smith
Enter admin email: john@obscuralabs.io
Enter admin password (min 8 chars): ********
Confirm admin password: ********

🔄 Creating admin account...
✅ Connected to Neon database
✅ Admin user created successfully
📧 Email: john@obscuralabs.io
👤 Name: John Smith
🔑 Role: admin
📅 Created: 2024-01-15T10:35:00.000Z

🎉 Admin setup completed successfully!
\`\`\`

## Step 5: Update Application Code

### 5.1 Update Database Connection
Your `lib/user-service.ts` should use the Neon connection:

\`\`\`typescript
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const userService = {
  async findByEmail(email: string) {
    const result = await sql`
      SELECT * FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `;
    return result[0] || null;
  },
  // ... other methods
};
\`\`\`

### 5.2 Environment Variables in Vercel
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add your environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `JWT_SECRET`: Your JWT secret key
   - `BCRYPT_ROUNDS`: `12`

## Step 6: Deploy and Test

### 6.1 Deploy to Vercel
\`\`\`bash
git add .
git commit -m "Add Neon database setup"
git push
\`\`\`

### 6.2 Test Your Application
1. Visit your deployed application
2. Try logging in with your admin credentials
3. Check that user registration works
4. Verify admin functions are accessible

## Database Schema Overview

### Tables Created:
- **`users`**: User accounts, authentication, roles
- **`audit_logs`**: Security and activity logging
- **`user_sessions`**: JWT token management
- **`data_sources`**: External data source configurations
- **`search_queries`**: Search analytics and history

### Key Features:
- 🔐 **UUID primary keys** for security
- 🔍 **Optimized indexes** for performance
- 📝 **Automatic timestamps** with triggers
- 🛡️ **Role-based access control**
- 📊 **Comprehensive audit logging**
- 🔒 **Row Level Security (RLS)** policies

## Troubleshooting

### Connection Issues
\`\`\`bash
# Test connection manually
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT NOW()\`.then(console.log).catch(console.error);
"
\`\`\`

### Schema Issues
\`\`\`bash
# Reset database (⚠️ This will delete all data!)
npm run db:reset
\`\`\`

### Permission Issues
- Ensure your Neon database user has CREATE privileges
- Check that your connection string includes `?sslmode=require`
- Verify your IP is not blocked by Neon's firewall

### Environment Variable Issues
\`\`\`bash
# Check if variables are loaded
node -e "console.log(process.env.DATABASE_URL ? 'DATABASE_URL is set' : 'DATABASE_URL missing')"
\`\`\`

## Production Considerations

### Security
- 🔒 Use strong, unique passwords for admin accounts
- 🔒 Rotate JWT secrets regularly
- 🔒 Enable Neon's IP allowlist in production
- 🔒 Use environment-specific database branches

### Performance
- 📈 Monitor query performance in Neon console
- 📈 Use connection pooling for high-traffic applications
- 📈 Consider read replicas for analytics queries

### Backup
- 💾 Neon provides automatic backups
- 💾 Set up point-in-time recovery
- 💾 Export critical data regularly

## Next Steps

1. **Customize Schema**: Add application-specific tables
2. **Set Up Monitoring**: Configure alerts and dashboards
3. **Add Data Sources**: Connect your intelligence data sources
4. **Configure Search**: Set up Elasticsearch integration
5. **Security Hardening**: Implement additional security measures

## Support

- 📚 [Neon Documentation](https://neon.tech/docs)
- 💬 [Neon Discord](https://discord.gg/92vNTzKDGp)
- 🐛 [Report Issues](https://github.com/neondatabase/neon/issues)

Remember to keep your connection strings secure and never commit them to version control!
