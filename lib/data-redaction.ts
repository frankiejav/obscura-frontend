/**
 * Data Redaction Utility
 * Redacts sensitive information for free/demo accounts
 */

import { AccountType } from '@/lib/account-types'

/**
 * Check if data should be redacted for the given account type
 */
export function shouldRedactData(accountType: AccountType): boolean {
  return accountType === AccountType.FREE
}

/**
 * Redact a sensitive string value
 * Shows first and last characters with asterisks in between
 */
export function redactString(value: string | null | undefined, showPartial: boolean = true): string {
  if (!value) return ''
  
  const length = value.length
  
  // For very short strings, just show asterisks
  if (length <= 3) {
    return '*'.repeat(length)
  }
  
  if (!showPartial) {
    return '*'.repeat(Math.min(length, 20)) // Cap at 20 asterisks for display
  }
  
  // For emails, show partial domain
  if (value.includes('@')) {
    const [localPart, domain] = value.split('@')
    const redactedLocal = localPart.charAt(0) + '*'.repeat(Math.min(localPart.length - 2, 8)) + localPart.charAt(localPart.length - 1)
    return `${redactedLocal}@${domain}`
  }
  
  // For other strings, show first 2 and last 2 characters
  if (length <= 8) {
    return value.charAt(0) + '*'.repeat(length - 2) + value.charAt(length - 1)
  }
  
  return value.substring(0, 2) + '*'.repeat(Math.min(length - 4, 12)) + value.substring(length - 2)
}

/**
 * Redact password with consistent masking
 */
export function redactPassword(password: string | null | undefined): string {
  if (!password) return ''
  
  // Always show the same pattern for passwords regardless of actual length
  // This prevents length-based analysis
  return '********'
}

/**
 * Redact cookie value while preserving structure visibility
 */
export function redactCookie(cookie: any): any {
  if (!cookie) return cookie
  
  return {
    ...cookie,
    value: redactString(cookie.value, false), // Don't show partial for cookies
    cookie_value: redactString(cookie.cookie_value, false),
    // Keep these fields visible for analysis
    name: cookie.name,
    domain: cookie.domain,
    path: cookie.path,
    expires: cookie.expires,
    httponly: cookie.httponly,
    secure: cookie.secure,
  }
}

/**
 * Redact sensitive fields in a credential record
 */
export function redactCredentialRecord(record: any, accountType: AccountType): any {
  if (!shouldRedactData(accountType)) {
    return record // No redaction for paid accounts
  }
  
  const redacted = { ...record }
  
  // Redact passwords
  if (redacted.password) {
    redacted.password = redactPassword(redacted.password)
    redacted.password_redacted = true
  }
  
  // Redact hashed passwords
  if (redacted.password_hash) {
    redacted.password_hash = redactPassword(redacted.password_hash)
    redacted.password_hash_redacted = true
  }
  
  // Redact API keys and tokens
  if (redacted.api_key) {
    redacted.api_key = redactString(redacted.api_key, false)
    redacted.api_key_redacted = true
  }
  
  if (redacted.token) {
    redacted.token = redactString(redacted.token, false)
    redacted.token_redacted = true
  }
  
  // Redact secret questions/answers
  if (redacted.secret_answer) {
    redacted.secret_answer = redactString(redacted.secret_answer, false)
    redacted.secret_answer_redacted = true
  }
  
  // Redact SSN/financial data
  if (redacted.ssn) {
    redacted.ssn = redactString(redacted.ssn, false)
    redacted.ssn_redacted = true
  }
  
  if (redacted.credit_card) {
    redacted.credit_card = redactString(redacted.credit_card, false)
    redacted.credit_card_redacted = true
  }
  
  // Keep these fields visible for context
  // email, username, name, domain, source, timestamp, etc.
  
  return redacted
}

/**
 * Redact sensitive fields in LeakCheck results
 */
export function redactLeakCheckResult(result: any, accountType: AccountType): any {
  if (!shouldRedactData(accountType)) {
    return result // No redaction for paid accounts
  }
  
  if (!result || !result.result) return result
  
  const redacted = { ...result }
  
  // Redact each breach result
  if (Array.isArray(redacted.result)) {
    redacted.result = redacted.result.map((breach: any) => ({
      ...breach,
      // Redact passwords in breach data
      password: breach.password ? redactPassword(breach.password) : breach.password,
      password_plain: breach.password_plain ? redactPassword(breach.password_plain) : breach.password_plain,
      password_hash: breach.password_hash ? redactPassword(breach.password_hash) : breach.password_hash,
      
      // Mark as redacted
      password_redacted: !!breach.password,
      password_plain_redacted: !!breach.password_plain,
      password_hash_redacted: !!breach.password_hash,
      
      // Keep these visible
      email: breach.email,
      username: breach.username,
      source: breach.source,
      breach_date: breach.breach_date,
      line: breach.line,
    }))
  }
  
  // Add redaction notice
  redacted.data_redacted = true
  redacted.redaction_notice = 'Sensitive data has been redacted. Upgrade to view full results.'
  
  return redacted
}

/**
 * Redact cookie records
 */
export function redactCookieRecords(records: any[], accountType: AccountType): any[] {
  if (!shouldRedactData(accountType)) {
    return records // No redaction for paid accounts
  }
  
  return records.map(record => ({
    ...record,
    // Redact cookie values
    cookies: Array.isArray(record.cookies) 
      ? record.cookies.map((cookie: any) => redactCookie(cookie))
      : record.cookies,
    
    // For flat cookie records
    cookie_value: record.cookie_value ? redactString(record.cookie_value, false) : record.cookie_value,
    value: record.value ? redactString(record.value, false) : record.value,
    
    // Mark as redacted
    cookies_redacted: true,
    
    // Keep metadata visible
    id: record.id,
    domain: record.domain,
    source: record.source,
    timestamp: record.timestamp,
    url: record.url,
    victim_id: record.victim_id,
  }))
}

/**
 * Add redaction notice to response
 */
export function addRedactionNotice(response: any, accountType: AccountType): any {
  if (!shouldRedactData(accountType)) {
    return response
  }
  
  return {
    ...response,
    redaction: {
      applied: true,
      message: 'Sensitive data (passwords, cookies, tokens) has been redacted for demo/free accounts.',
      upgrade_url: '/pricing',
      fields_redacted: ['password', 'password_hash', 'cookies', 'api_key', 'token'],
    }
  }
}
