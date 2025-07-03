# Admin Account Setup Guide

This guide explains how to create admin accounts for the Obscura Labs application.

## Quick Setup

### Option 1: Interactive Script (Recommended)

\`\`\`bash
# Run the interactive admin setup
npm run admin:setup
\`\`\`

This will:
- Check if the database is running
- Start it if needed
- Prompt you for admin details
- Create the admin account securely

### Option 2: Direct Node Script

\`\`\`bash
# Run the admin creation script directly
npm run admin:create
\`\`\`

## Manual Setup Steps

If you prefer to run the setup manually:

### 1. Ensure Database is Running

\`\`\`bash
# Start the database
docker-compose up -d postgres

# Verify it's running
docker-compose ps
\`\`\`

### 2. Load Environment Variables

\`\`\`bash
# Make sure .env.local exists with DATABASE_URL
source .env.local
\`\`\`

### 3. Run Admin Creation

\`\`\`bash
node scripts/create-admin.js
\`\`\`

## What the Script Does

### Security Features
- ✅ **Password validation** (minimum 8 characters)
- ✅ **Email format validation**
- ✅ **Password confirmation** to prevent typos
- ✅ **Secure password hashing** with bcrypt
- ✅ **Hidden password input** (shows asterisks)

### Database Operations
- ✅ **Duplicate checking** - prevents duplicate admin emails
- ✅ **User promotion** - can promote existing clients to admin
- ✅ **Password updates** - can update existing admin passwords
- ✅ **Audit logging** - logs all admin creation activities

### User Experience
- ✅ **Interactive prompts** for all required information
- ✅ **Clear feedback** on success/failure
- ✅ **Confirmation dialogs** for destructive operations
- ✅ **Detailed error messages** for troubleshooting

## Example Usage

\`\`\`bash
$ npm run admin:create

🔐 Obscura Labs Admin Account Setup
=====================================

Enter admin full name: John Smith
Enter admin email: john.smith@obscuralabs.io
Enter admin password (min 8 chars): ********
Confirm admin password: ********

🔄 Creating admin account...
✅ Connected to database
✅ Admin user created successfully
📧 Email: john.smith@obscuralabs.io
👤 Name: John Smith
🔑 Role: admin
📅 Created: 2024-01-15T10:30:00.000Z

🎉 Admin setup completed successfully!
You can now login to the application with these credentials.
\`\`\`

## Troubleshooting

### Database Connection Issues

\`\`\`bash
# Check if database container is running
docker-compose ps

# Start database if not running
docker-compose up -d postgres

# Check database logs
docker-compose logs postgres
\`\`\`

### Environment Variable Issues

\`\`\`bash
# Verify .env.local exists and has DATABASE_URL
cat .env.local | grep DATABASE_URL

# If missing, create it:
echo "DATABASE_URL=postgresql://obscura_user:obscura_password_dev@localhost:5432/obscura_labs" >> .env.local
\`\`\`

### Permission Issues

\`\`\`bash
# Make script executable
chmod +x scripts/create-admin.sh

# Fix file ownership if needed
sudo chown -R $USER:$USER scripts/
\`\`\`

## Security Best Practices

### For Production
- 🔒 **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
- 🔒 **Use unique admin emails** (not shared with other services)
- 🔒 **Limit admin accounts** (create only what you need)
- 🔒 **Regular password rotation** (update admin passwords periodically)
- 🔒 **Monitor audit logs** (check for unauthorized admin creation)

### Password Requirements
- Minimum 8 characters (12+ recommended for production)
- Mix of uppercase and lowercase letters
- Include numbers and special characters
- Avoid common passwords or personal information

## Managing Admin Accounts

### View Existing Admins

\`\`\`bash
# Connect to database
docker exec -it obscura-postgres psql -U obscura_user -d obscura_labs

# List all admin users
SELECT id, email, name, role, created_at, last_login FROM users WHERE role = 'admin';
\`\`\`

### Promote User to Admin

The script can promote existing client users to admin:

1. Run `npm run admin:create`
2. Enter the existing user's email
3. Choose "yes" when prompted to promote
4. Set new admin password

### Update Admin Password

The script can update existing admin passwords:

1. Run `npm run admin:create`
2. Enter the existing admin's email
3. Choose "yes" when prompted to update password
4. Enter new password

## Audit Trail

All admin account operations are logged in the `audit_logs` table:

\`\`\`sql
-- View recent admin operations
SELECT 
  al.action,
  al.details,
  al.created_at,
  u.email as admin_email
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.action LIKE '%ADMIN%'
ORDER BY al.created_at DESC
LIMIT 10;
\`\`\`

## Next Steps

After creating your admin account:

1. **Login to the application** at http://localhost:3000
2. **Test admin functionality** (user management, settings)
3. **Create additional users** through the web interface if needed
4. **Configure application settings** through the admin panel
5. **Set up monitoring** and backup procedures

Remember: Keep your admin credentials secure and never share them!
