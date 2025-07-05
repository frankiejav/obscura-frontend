# GraphQL Implementation for Obscura Labs

This document explains how to set up and use the GraphQL API with Elasticsearch for your Obscura Labs project.

## Overview

The implementation provides:
- GraphQL API endpoint at `/api/graphql` for querying Elasticsearch data
- Data ingestion endpoint at `/api/ingest` for uploading parsed data
- GraphQL playground at `/api/graphql/playground` for testing queries
- Dashboard at `/dashboard` for viewing statistics and recent data
- Search interface at `/dashboard/search` for searching and viewing data
- Python uploader script for your parser (separate from GraphQL API)

## Environment Variables

Add these environment variables to your Vercel deployment:

```bash
# Elasticsearch Configuration
ELASTICSEARCH_URL=https://your-elasticsearch-host:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-password

# JWT Configuration (if using authentication)
JWT_SECRET=your-jwt-secret-key
```

## Setup Instructions

### 1. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the environment variables in Vercel dashboard
4. Deploy

### 2. Configure Elasticsearch

Make sure your Elasticsearch instance is accessible from Vercel. Update the environment variables with your actual Elasticsearch credentials.

### 3. Test the Connection

Visit your deployed app and go to `/api/graphql/playground` to test the GraphQL API.

## API Endpoints

### GraphQL API
- **URL**: `https://your-app.vercel.app/api/graphql`
- **Method**: POST
- **Content-Type**: application/json

Example query:
```graphql
query {
  me {
    id
    name
    email
    role
  }
}
```

### Data Ingestion API
- **URL**: `https://your-app.vercel.app/api/ingest`
- **Method**: POST
- **Content-Type**: application/json

Example payload:
```json
{
  "records": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "ip": "192.168.1.1",
      "domain": "example.com",
      "source": "breach_2024",
      "additionalData": {
        "breach_type": "email"
      }
    }
  ],
  "sourceName": "Breach Data 2024"
}
```

## Using the Python Uploader

### 1. Install Dependencies

```bash
pip install requests
```

### 2. Configure the Uploader

Edit the `elasticsearch_uploader.py` file:

```python
# Configuration
API_URL = "https://your-vercel-app.vercel.app"  # Replace with your Vercel URL
API_KEY = None  # Optional: Add your API key if needed
```

### 3. Integrate with Your Parser

Add this to your parser script:

```python
from elasticsearch_uploader import ElasticsearchUploader, format_records_for_upload

# Initialize uploader
uploader = ElasticsearchUploader("https://your-app.vercel.app")

# After parsing your data
parsed_records = your_parser_function()
formatted_records = format_records_for_upload(parsed_records)

# Upload to GraphQL API
success = uploader.upload_with_retry(
    formatted_records, 
    source_name="Your Data Source Name"
)
```

## GraphQL Schema

The API supports these main types:

### Queries
- `me` - Get current user
- `dataRecords` - Get paginated data records
- `search` - Search data records
- `dataSources` - Get data sources
- `auditLogs` - Get audit logs

### Mutations
- `login` - User authentication
- `createDataRecord` - Create new data record
- `updateDataRecord` - Update existing record
- `deleteDataRecord` - Delete record

## Example Queries

### Search Data Records
```graphql
query {
  search(term: "example", type: "ALL", page: 1, limit: 10, source: "breach_2024", fromDate: "2024-01-01", toDate: "2024-12-31") {
    results {
      id
      name
      email
      ip
      domain
      source
      timestamp
      additionalData
    }
    pagination {
      total
      pages
      current
    }
  }
}
```

### Get Data Records with Pagination
```graphql
query {
  dataRecords(first: 10) {
    edges {
      node {
        id
        name
        email
        source
        timestamp
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}
```

### Login
```graphql
mutation {
  login(email: "admin@obscura.com", password: "password") {
    token
    refreshToken
    user {
      id
      name
      email
      role
    }
  }
}
```

## Data Flow

1. **Parser Script** → Parses data files
2. **Python Uploader** → Sends data to `/api/ingest` (separate from GraphQL)
3. **Ingestion API** → Stores data in Elasticsearch
4. **GraphQL API** → Queries data from Elasticsearch
5. **Frontend** → Queries data via GraphQL API
6. **Users** → Search and view data through dashboard and search interface

## Security Considerations

1. **Authentication**: Implement proper JWT authentication
2. **Rate Limiting**: Already implemented in the API
3. **Input Validation**: All inputs are validated
4. **HTTPS**: Use HTTPS in production
5. **Environment Variables**: Keep secrets in environment variables

## Troubleshooting

### Connection Issues
- Check Elasticsearch URL and credentials
- Verify network connectivity from Vercel to Elasticsearch
- Check SSL certificate settings

### Data Ingestion Issues
- Verify record format matches expected schema
- Check Elasticsearch index permissions
- Review API response for error messages

### GraphQL Errors
- Use the playground to test queries
- Check query syntax
- Verify field names match schema

## Development

### Local Development
1. Start your Elasticsearch instance
2. Set environment variables
3. Run `npm run dev`
4. Visit `http://localhost:3000/api/graphql/playground`

### Testing
- Use the GraphQL playground for testing queries
- Test data ingestion with the Python script
- Monitor Elasticsearch logs for errors

## Monitoring

- Check Vercel function logs for API errors
- Monitor Elasticsearch cluster health
- Track data ingestion success rates
- Monitor API response times

## Next Steps

1. Implement proper authentication
2. Add more complex search filters
3. Implement data visualization
4. Add real-time updates
5. Implement data export functionality 