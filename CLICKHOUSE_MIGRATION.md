# ClickHouse Migration Guide

This document outlines the migration from Elasticsearch to ClickHouse for the Obscura Labs frontend application.

## Overview

The application has been successfully migrated from Elasticsearch to ClickHouse to better handle the stealer log data. ClickHouse provides superior performance for analytical queries on large datasets and is better suited for the cybersecurity data use case.

## Changes Made

### 1. Dependencies
- **Removed**: `@elastic/elasticsearch`
- **Added**: `@clickhouse/client`

### 2. New Files
- `lib/clickhouse.ts` - ClickHouse client configuration and helper functions
- `lib/data-ingestion.ts` - Updated data ingestion logic for ClickHouse (renamed from clickhouse version)
- `scripts/test-clickhouse.js` - Connection testing script

### 3. Updated Files
- `app/api/search/route.ts` - Search API using ClickHouse queries
- `app/api/ingest/route.ts` - Data ingestion API for ClickHouse
- `app/api/data-sources/route.ts` - Data sources statistics from ClickHouse
- `app/api/data-records/route.ts` - Data records retrieval from ClickHouse
- `components/dashboard/search-interface.tsx` - Added username field support
- `package.json` - Updated scripts and dependencies

### 4. Archived Files
- `lib/data-ingestion-elasticsearch-old.ts` - Original Elasticsearch implementation
- `lib/elasticsearch.ts` - Original Elasticsearch client (kept for reference)

## Database Schema

The ClickHouse schema is defined in `clickhouse_schema.sql` and includes:

- **Database**: `vault`
- **Table**: `creds`
- **Engine**: `ReplacingMergeTree(ts)` for deduplication
- **Optimized indexes** for email, username, domain, and IP address searches

### Key Fields
- `ts` - Timestamp (DateTime)
- `victim_id` - Unique identifier (String)
- `source_name` - Data source name (String)
- `domain` - Domain (LowCardinality String)
- `email` - Email address (String)
- `username` - Username (String)
- `password` - Password (Nullable String)
- `name` - Full name (Nullable String)
- `ip_address` - IP address (Nullable String)
- Plus additional personal and system information fields

## Environment Configuration

Add these environment variables to your `.env` file:

```env
# ClickHouse Configuration
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_PROTOCOL=http
CLICKHOUSE_USERNAME=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=vault

# Alternative: Complete URL
# CLICKHOUSE_URL=http://localhost:8123
```

## API Endpoints

All existing API endpoints continue to work with the same interface:

### Search API (`/api/search`)
- **Method**: POST
- **Body**: `{ term, type, page, limit, source, fromDate, toDate }`
- **Types**: `ALL`, `NAME`, `EMAIL`, `USERNAME`, `IP`, `DOMAIN`, `SOURCE`

### Ingestion API (`/api/ingest`)
- **Method**: POST
- **Body**: `{ records[], sourceName }`
- **Record format**: Supports all fields from ClickHouse schema

### Data Sources API (`/api/data-sources`)
- **Method**: GET
- **Returns**: List of data sources with statistics

### Data Records API (`/api/data-records`)
- **Method**: GET
- **Query params**: `first`, `after`, `source`
- **Returns**: Paginated records in GraphQL-style format

## Testing

### Test ClickHouse Connection
```bash
npm run test:clickhouse
```

This script will:
1. Test basic ClickHouse connection
2. Check database and table existence
3. Display record counts
4. Provide troubleshooting guidance

### Manual Testing
1. Start the application: `npm run dev`
2. Navigate to the dashboard search interface
3. Try searching with different field types
4. Test data ingestion via the API endpoints

## Performance Benefits

### ClickHouse Advantages
- **Columnar storage**: Faster analytical queries
- **Compression**: Better storage efficiency
- **Indexing**: Optimized bloom filters for exact matches
- **Scalability**: Handles billions of rows efficiently
- **SQL compatibility**: Standard SQL syntax

### Query Performance
- **Email searches**: Bloom filter index for fast exact matches
- **Domain searches**: Set index for efficient filtering
- **IP address searches**: Bloom filter for IP lookups
- **Full-text searches**: ILIKE patterns for partial matches

## Migration Notes

### Data Format Changes
- `ip` field renamed to `ip_address` (backward compatible in API)
- `source` field renamed to `source_name` (backward compatible in API)
- Added support for username field in search interface
- Timestamps handled as ClickHouse DateTime format

### Backward Compatibility
- All existing API endpoints maintain the same interface
- Search results format remains unchanged
- Dashboard components work without modification

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check ClickHouse server is running
   - Verify environment variables
   - Test network connectivity

2. **Schema Errors**
   - Run the application once to auto-create schema
   - Check database permissions
   - Verify ClickHouse version compatibility

3. **Search Issues**
   - Check data has been ingested
   - Verify field mappings
   - Test with simple queries first

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

## Next Steps

1. **Data Migration**: If you have existing Elasticsearch data, create a migration script
2. **Performance Tuning**: Adjust ClickHouse settings based on your data volume
3. **Monitoring**: Set up ClickHouse monitoring and alerting
4. **Backup**: Configure regular backups of your ClickHouse data

## Support

For issues related to the ClickHouse migration:
1. Check the test script output: `npm run test:clickhouse`
2. Review the console logs during application startup
3. Verify your ClickHouse server configuration
4. Check the API endpoint responses for error details
