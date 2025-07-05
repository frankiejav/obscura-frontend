# Environment Variables Setup

This document describes how to set up environment variables for the Obscura Labs platform.

## Required Environment Variables

### LeakCheck API Integration

To enable LeakCheck API functionality, you need to set the following environment variable:

#### `LEAKCHECK_API_KEY`
- **Description**: Your LeakCheck API key for accessing the data breach search API
- **Required**: Yes (if using LeakCheck features)
- **Format**: String
- **Source**: [leakcheck.io](https://leakcheck.io)

### Setting up in Vercel

1. **Get your API key**:
   - Visit [leakcheck.io](https://leakcheck.io)
   - Sign up for an account
   - Navigate to your account settings
   - Copy your API key

2. **Add to Vercel**:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add a new variable:
     - **Name**: `LEAKCHECK_API_KEY`
     - **Value**: Your LeakCheck API key
     - **Environment**: Production (and Preview if needed)

3. **Redeploy**:
   - After adding the environment variable, redeploy your application
   - The LeakCheck API will now be available for configuration

### Setting up Locally

For local development, create a `.env.local` file in your project root:

```bash
# LeakCheck API Configuration
LEAKCHECK_API_KEY=your_leakcheck_api_key_here
```

### Verification

To verify the environment variable is set correctly:

1. **Check in Vercel**: Go to your project settings and verify the variable is listed
2. **Test the API**: Try enabling LeakCheck in the admin settings
3. **Test a search**: Use the LeakCheck search functionality

## Security Notes

- **Never commit API keys to version control**
- **Use environment variables for all sensitive configuration**
- **Rotate API keys regularly**
- **Monitor API usage to stay within limits**

## Troubleshooting

### Common Issues

1. **"LeakCheck API key not configured in environment variables"**
   - Solution: Add `LEAKCHECK_API_KEY` to your environment variables

2. **"LeakCheck API is not enabled"**
   - Solution: Enable LeakCheck in the admin settings after setting the environment variable

3. **API calls failing**
   - Check that your API key is valid
   - Verify you have sufficient quota
   - Ensure the environment variable is set correctly

### Testing Environment Variables

You can test if the environment variable is accessible by checking the browser console for any related errors, or by attempting to enable LeakCheck in the admin settings.

## Additional Configuration

Once the environment variable is set, you can:

1. **Enable LeakCheck**: Go to Settings → LeakCheck tab
2. **Sync Data**: Click "Sync Data" to import LeakCheck databases
3. **Test Search**: Use the search functionality to verify everything works

The LeakCheck integration will automatically use the environment variable for all API calls, providing secure access to the data breach search functionality. 