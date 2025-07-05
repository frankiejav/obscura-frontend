# LeakCheck API Integration

This document describes the LeakCheck API integration implemented in the Obscura Labs platform.

## Overview

The LeakCheck API integration allows administrators to enable data breach searches for users. When enabled, clients can search for email addresses, usernames, and other data in known data breaches through the LeakCheck API.

## Features

### Admin Features
- **Enable/Disable**: Admins can activate or deactivate the LeakCheck API integration
- **Environment Variable Configuration**: API keys are securely stored in environment variables
- **Data Sync**: Sync LeakCheck database information to update data sources
- **Quota Monitoring**: Track remaining API queries
- **Settings Management**: Configure through the admin settings panel

### Client Features
- **Data Breach Search**: Search for email addresses, usernames, phone numbers, and hashes
- **Multiple Search Types**: Auto-detect, email, username, phone, hash
- **Detailed Results**: View breach details including source, date, and exposed fields
- **Quota Display**: See remaining API queries
- **User-Friendly Interface**: Clean, intuitive search interface

## Implementation Details

### GraphQL Schema Extensions

The following types were added to the GraphQL schema:

```graphql
type LeakCheckSettings {
  enabled: Boolean!
  quota: Int!
  lastSync: DateTime
}

type LeakCheckResult {
  email: String!
  source: LeakCheckSource!
  first_name: String
  last_name: String
  username: String
  fields: [String!]!
}

type LeakCheckSource {
  name: String!
  breach_date: String
  unverified: Int!
  passwordless: Int!
  compilation: Int!
}

type LeakCheckSearchResult {
  success: Boolean!
  found: Int!
  quota: Int!
  result: [LeakCheckResult!]!
}
```

### API Endpoints

#### GraphQL Queries
- `leakCheckSearch(query: String!, type: String)`: Search for data in breaches
- `settings.leakCheck`: Get LeakCheck configuration

#### GraphQL Mutations
- `syncLeakCheckData`: Sync LeakCheck database information
- `updateSettings`: Update LeakCheck settings (admin only)

#### REST API
- `POST /api/leakcheck`: Internal API route for LeakCheck API calls

### Security Features

1. **Environment Variable Storage**: API keys are stored in environment variables and never exposed to clients
2. **Admin-Only Configuration**: Only admins can enable/disable and configure the API
3. **Input Validation**: All queries are validated for length and format
4. **Error Handling**: Comprehensive error handling for API failures
5. **Rate Limiting**: Inherits from existing rate limiting infrastructure

### Data Flow

1. **Admin Configuration**:
   - Admin sets `LEAKCHECK_API_KEY` environment variable
   - Admin enables LeakCheck in settings
   - Admin can sync LeakCheck data to update data sources

2. **Client Search**:
   - Client enters search query
   - Query is sent to GraphQL API
   - GraphQL resolver calls internal `/api/leakcheck` route
   - Internal route validates and calls LeakCheck API using environment variable
   - Results are returned to client

3. **Data Updates**:
   - LeakCheck data is synced to Elasticsearch
   - Individual databases appear as separate data sources
   - Dashboard shows LeakCheck as a data source
   - Total record count includes LeakCheck data

## Configuration

### Environment Variables

#### Required Environment Variable

**`LEAKCHECK_API_KEY`**
- **Description**: Your LeakCheck API key for accessing the data breach search API
- **Required**: Yes (if using LeakCheck features)
- **Format**: String
- **Source**: [leakcheck.io](https://leakcheck.io)

### Admin Setup

1. **Get API Key**: Obtain a LeakCheck API key from [leakcheck.io](https://leakcheck.io)
2. **Set Environment Variable**: Add `LEAKCHECK_API_KEY` to your Vercel environment variables
3. **Enable Integration**: Go to Settings → LeakCheck tab
4. **Enable API**: Toggle "Enable LeakCheck API"
5. **Sync Data**: Click "Sync Data" to update data sources

### Environment Variable Setup

#### Vercel Deployment
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add `LEAKCHECK_API_KEY` with your API key
5. Redeploy your application

#### Local Development
Create a `.env.local` file:
```bash
LEAKCHECK_API_KEY=your_leakcheck_api_key_here
```

## Usage

### For Admins

1. **Access Settings**: Navigate to Dashboard → Settings → LeakCheck tab
2. **Enable API**: Toggle "Enable LeakCheck API" (requires environment variable)
3. **Sync Data**: Click "Sync Data" to update data sources
4. **Monitor Quota**: Check remaining queries in the settings

### For Clients

1. **Access Search**: Navigate to Dashboard → Search
2. **Select LeakCheck Tab**: Click on the "LeakCheck" tab
3. **Enter Query**: Type email, username, or other data to search
4. **Select Type**: Choose search type (auto-detect recommended)
5. **Search**: Click "Search Breaches" to find results

## Database Integration

The LeakCheck integration fetches the complete database list from [https://leakcheck.io/databases-list](https://leakcheck.io/databases-list) and creates:

1. **Main LeakCheck Data Source**: Aggregated view with total record count
2. **Individual Database Sources**: Each LeakCheck database as a separate data source
3. **Record Count**: Total records = (10,000,000,000+) + (Sum of all LeakCheck databases)

### Database List Features

- **Real-time Sync**: Fetches latest database information from LeakCheck
- **Individual Tracking**: Each database tracked separately with metadata
- **Breach Details**: Includes breach dates, verification status, and compilation info
- **Record Counts**: Accurate counts from each database

## Error Handling

The integration includes comprehensive error handling:

- **Environment Variable Issues**: Clear error messages for missing API keys
- **Network Errors**: Graceful handling of network failures
- **Rate Limiting**: Respects LeakCheck API rate limits
- **Invalid Queries**: Validation for query length and format
- **Disabled API**: Clear indication when API is not enabled

## Monitoring

### Dashboard Integration

- **Status Indicator**: Green card shows when LeakCheck is active
- **Data Sources**: LeakCheck databases appear as individual data sources
- **Record Counts**: Total records include LeakCheck data
- **Recent Activity**: Shows recent LeakCheck searches

### Quota Management

- **Real-time Updates**: Quota is updated after each search
- **Visual Indicators**: Quota remaining is displayed in search interface
- **Admin Monitoring**: Admins can monitor quota in settings

## Security Considerations

1. **Environment Variable Storage**: Keys are stored securely in environment variables
2. **Access Control**: Only admins can configure the API
3. **Input Sanitization**: All queries are validated and sanitized
4. **Error Information**: Error messages don't expose sensitive information
5. **Rate Limiting**: Inherits existing rate limiting protection

## Troubleshooting

### Common Issues

1. **"LeakCheck API key not configured in environment variables"**
   - Solution: Add `LEAKCHECK_API_KEY` to your environment variables

2. **"LeakCheck API is not enabled"**
   - Solution: Admin must enable LeakCheck in settings after setting environment variable

3. **"Query must be at least 3 characters"**
   - Solution: Enter a longer search query

4. **"Too many requests"**
   - Solution: Wait before making another search request

### Debug Information

- Check browser console for detailed error messages
- Verify API key is valid in LeakCheck dashboard
- Ensure network connectivity to LeakCheck API
- Check admin settings for proper configuration
- Verify environment variable is set correctly

## Future Enhancements

Potential improvements for future versions:

1. **Caching**: Cache common search results
2. **Batch Search**: Allow multiple queries in one request
3. **Export Results**: Allow exporting breach data
4. **Notifications**: Alert users when their data is found
5. **Advanced Filtering**: Filter results by breach date, source, etc.
6. **Historical Tracking**: Track search history and trends 