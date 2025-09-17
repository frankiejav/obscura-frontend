# Data Redaction System for Free/Demo Accounts

## Overview
The application now implements automatic redaction of sensitive data (passwords, cookies, tokens) for free/demo accounts while still showing that breaches exist. This allows free users to see that data breaches have occurred without exposing the actual sensitive information.

## What Gets Redacted

### For FREE Account Type:
- **Passwords**: Shown as `••••••••` with a "Redacted" badge
- **Password Hashes**: Fully redacted
- **Cookies**: Cookie values are masked while preserving metadata (domain, path, expiry)
- **API Keys & Tokens**: Completely redacted
- **Secret Answers**: Masked
- **Financial Data**: SSN, credit cards are redacted

### What Remains Visible:
- Email addresses (partially visible with domain)
- Usernames
- Names
- Breach sources and dates
- Domain information
- IP addresses
- Metadata (timestamps, sources, breach counts)

## Implementation Components

### 1. Redaction Utility (`/lib/data-redaction.ts`)
Core functions for data redaction:
- `shouldRedactData(accountType)`: Determines if redaction is needed
- `redactString()`: Redacts generic strings while showing hints
- `redactPassword()`: Always shows consistent masking for passwords
- `redactCredentialRecord()`: Redacts sensitive fields in breach records
- `redactLeakCheckResult()`: Redacts LeakCheck API results
- `redactCookieRecords()`: Redacts cookie values

### 2. API Integration (`/app/api/search/route.ts`)
The search API now:
1. Fetches user subscription to determine account type
2. Applies redaction to all result types:
   - ClickHouse database results
   - Profile credentials
   - Cookie records
   - LeakCheck API results
3. Adds redaction notice to API response

### 3. UI Components (`/components/redaction/RedactionNotice.tsx`)
Visual components for redaction:
- **RedactionNotice**: Banner showing data is redacted with upgrade option
- **RedactedField**: Individual field display with redaction indicator
- **RedactedBadge**: Small badge to mark redacted items
- **RedactionStats**: Statistics about what was redacted

### 4. Dashboard Integration (`/app/dashboard/search/page.tsx`)
The search page now:
- Shows redaction notice banner when applicable
- Displays redacted passwords with visual indicators
- Shows "Redacted" badges next to sensitive data
- Provides upgrade prompts to view full data

## How It Works

### Search Flow:
1. User performs a search
2. API checks user's account type via Auth0 metadata
3. If account is FREE:
   - Sensitive data is redacted in results
   - Redaction notice is added to response
4. Dashboard displays redacted data with visual cues
5. Upgrade prompts guide users to paid plans

### Visual Indicators:
- 🔒 Lock icon next to redacted fields
- Yellow "Redacted" badges
- Masked text (••••••••) for passwords
- Yellow warning banner at top of results

## Example Redacted Data

### Original Password:
```
Password: MySecretPass123!
```

### Redacted Display:
```
Password: 🔒 ••••••••  [Redacted]
```

### Original Cookie:
```
session_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Redacted Display:
```
Value: 🔒 •••••••••••• [Redacted]
Domain: example.com (visible)
Path: / (visible)
Secure: Yes (visible)
```

## Account Type Configuration

Redaction is controlled by account type:
- **FREE**: Full redaction applied
- **STARTER**: No redaction
- **PROFESSIONAL**: No redaction
- **ENTERPRISE**: No redaction

## API Response Structure

When redaction is applied, the API response includes:
```json
{
  "results": [...],  // Redacted data
  "redaction": {
    "applied": true,
    "message": "Sensitive data has been redacted for demo/free accounts.",
    "upgrade_url": "/pricing",
    "fields_redacted": ["password", "cookies", "api_key", "token"]
  }
}
```

## Testing Redaction

### To Test as Free User:
1. Set user's Auth0 metadata: `app_metadata.account_type = "free"`
2. Perform any search
3. Observe redacted passwords and cookies
4. Click upgrade prompts to view pricing

### To Test as Paid User:
1. Set user's Auth0 metadata: `app_metadata.account_type = "professional"`
2. Perform same search
3. All data should be visible without redaction

## Security Benefits

1. **Data Protection**: Prevents free users from harvesting passwords
2. **Conversion Driver**: Shows value while encouraging upgrades
3. **Compliance**: Helps meet data protection requirements
4. **Transparency**: Users can see breaches exist without exposing data

## Future Enhancements

1. **Configurable Redaction Levels**: Different levels for different plans
2. **Time-Limited Preview**: Show unredacted data for X minutes
3. **Sample Data**: Show 1-2 unredacted records as examples
4. **Export Restrictions**: Prevent data export for redacted results
5. **Rate Limiting**: Stricter limits for free accounts

## Troubleshooting

### Redaction Not Working:
- Check user's account_type in Auth0 metadata
- Verify API is reading subscription correctly
- Check browser console for API response structure

### All Data Redacted for Paid User:
- Verify account_type is not "free"
- Check Auth0 metadata is synced
- Clear browser cache and retry

### Performance Issues:
- Redaction is done server-side for security
- Consider caching redacted results
- Monitor API response times
