# Security Test Cases

## Overview
Security and vulnerability testing for Teddy Bear Shop

---

## Authentication Security

### Password Security
- [ ] Passwords hashed before storage (bcrypt/argon2)
- [ ] Plaintext passwords never logged
- [ ] Password reset tokens expire
- [ ] Reset token one-time use
- [ ] Reset token sent via secure channel
- [ ] Old passwords don't work after change

### Session Security
- [ ] Session tokens are random/unique
- [ ] Session timeout implemented
- [ ] Logout invalidates session
- [ ] Session not stored in localStorage unsecured
- [ ] HTTPOnly cookies used
- [ ] Secure flag set for HTTPS

### Multi-Factor Authentication
- [ ] 2FA can be enabled
- [ ] 2FA codes expire
- [ ] Codes one-time use
- [ ] Backup codes work
- [ ] Disabled 2FA logs out other sessions

---

## Authorization & Access Control

### Role-Based Access Control (RBAC)
- [ ] User role enforced
- [ ] Admin role enforced
- [ ] Staff role enforced
- [ ] Permissions checked on backend
- [ ] Frontend cannot bypass permissions
- [ ] Unauthorized access returns 403

### Data Access Control
- [ ] User can only access own data
- [ ] User cannot access other user's profile
- [ ] User cannot access other user's orders
- [ ] User cannot modify other user's data
- [ ] Admin can access all user data (when needed)
- [ ] Staff role permissions correct

### API Endpoint Protection
- [ ] Protected endpoints require auth
- [ ] GET endpoints protected appropriately
- [ ] POST endpoints protected
- [ ] PUT endpoints protected
- [ ] DELETE endpoints protected
- [ ] Invalid token rejected

---

## Input Validation & Injection Prevention

### SQL Injection
- [ ] Parameterized queries used
- [ ] User input never concatenated in SQL
- [ ] Special characters escaped
- [ ] Test: `' OR '1'='1'` blocked
- [ ] Test: `; DROP TABLE users;` blocked
- [ ] Database error messages not shown

### Cross-Site Scripting (XSS)
- [ ] User input sanitized
- [ ] HTML entities encoded
- [ ] `<script>` tags blocked
- [ ] Test: `<img src=x onerror=alert(1)>` blocked
- [ ] Test: `javascript:` URLs blocked
- [ ] CSP headers implemented

### Cross-Site Request Forgery (CSRF)
- [ ] CSRF tokens implemented
- [ ] Token validated on state-changing requests
- [ ] Token regenerated after login
- [ ] Different origins rejected
- [ ] Same-site cookies set

### Command Injection
- [ ] Shell commands not executed with user input
- [ ] Escaped if necessary
- [ ] Parameterized API calls used

---

## Data Protection

### Sensitive Data Handling
- [ ] Passwords not exposed in API responses
- [ ] Credit card details not logged
- [ ] PII not displayed unnecessarily
- [ ] API responses don't leak information
- [ ] Error messages don't reveal system details

### Encryption
- [ ] HTTPS enforced for all connections
- [ ] SSL/TLS certificates valid
- [ ] Sensitive data encrypted at rest
- [ ] API keys encrypted in config
- [ ] Database connection encrypted

### Data Leakage Prevention
- [ ] Logs don't contain sensitive data
- [ ] API responses properly formatted
- [ ] Stack traces not shown to users
- [ ] Debug info disabled in production
- [ ] Unnecessary endpoints removed

---

## File Upload Security

### File Type Validation
- [ ] Only allowed file types accepted
- [ ] Magic number validation (not just extension)
- [ ] Executable files rejected
- [ ] Script files rejected
- [ ] ZIP files scanned for malware

### File Storage
- [ ] Files stored outside webroot
- [ ] Filenames sanitized
- [ ] Random filenames used
- [ ] File permissions restricted
- [ ] No directory traversal possible

### File Size Limits
- [ ] Maximum file size enforced
- [ ] Quota per user enforced
- [ ] Large uploads don't crash server

---

## API Security

### Rate Limiting
- [ ] API rate limiting implemented
- [ ] Login attempts limited (max 5 per 15 min)
- [ ] Password reset attempts limited
- [ ] API calls limited per user
- [ ] DDoS protection mechanisms

### API Headers
- [ ] X-Frame-Options set (prevent clickjacking)
- [ ] X-Content-Type-Options set
- [ ] X-XSS-Protection set
- [ ] Content-Security-Policy set
- [ ] Strict-Transport-Security set

### Versioning & Deprecation
- [ ] Old API versions phased out
- [ ] Deprecation notices provided
- [ ] Migration guides available

---

## Authentication Flow Security

### Login Security
- [ ] Failed login doesn't reveal user existence
- [ ] Account lockout after failed attempts
- [ ] Lockout duration reasonable
- [ ] IP-based lockout considered
- [ ] Login attempts logged

### Password Reset Security
- [ ] Reset email contains unique token
- [ ] Token expires after 30 minutes
- [ ] Token bound to email
- [ ] User identity verified
- [ ] New password must differ from old

---

## Third-Party Integrations

### VNPay Integration
- [ ] API keys never exposed
- [ ] Payment details sent over HTTPS
- [ ] Signature verification implemented
- [ ] Response validation implemented
- [ ] Test mode in development

### External Libraries
- [ ] Dependencies regularly updated
- [ ] Known vulnerabilities patched
- [ ] Minimal dependencies (reduce attack surface)
- [ ] License compliance checked

---

## Infrastructure Security

### Server Configuration
- [ ] Unnecessary services disabled
- [ ] Firewall properly configured
- [ ] Open ports minimized
- [ ] SSH key-based auth only
- [ ] Default credentials changed

### Database Security
- [ ] Database behind firewall
- [ ] No public internet access
- [ ] Strong database password
- [ ] Least privilege permissions
- [ ] Regular backups encrypted

### Environment Variables
- [ ] Secrets not in version control
- [ ] `.env` file in `.gitignore`
- [ ] Production secrets in secure vault
- [ ] No hardcoded credentials

---

## Security Compliance

### OWASP Top 10 Coverage
- [ ] A01: Broken Access Control - tested
- [ ] A02: Cryptographic Failures - tested
- [ ] A03: Injection - tested
- [ ] A04: Insecure Design - reviewed
- [ ] A05: Security Misconfiguration - tested
- [ ] A06: Vulnerable Components - checked
- [ ] A07: Authentication Failures - tested
- [ ] A08: Data Integrity Failures - tested
- [ ] A09: Logging & Monitoring - implemented
- [ ] A10: SSRF - tested

### Penetration Testing
- [ ] Vulnerability scan completed
- [ ] No critical issues found
- [ ] All high-risk issues addressed
- [ ] Medium-risk items documented
- [ ] Security audit trail maintained

---

## Incident Response

### Error Handling
- [ ] Errors logged securely
- [ ] User-friendly error messages
- [ ] Technical details not exposed
- [ ] Error monitoring implemented
- [ ] Alert system for anomalies

### Security Monitoring
- [ ] Suspicious activities logged
- [ ] Unauthorized access attempts logged
- [ ] Alert system for security events
- [ ] Regular log review
- [ ] Incident response plan in place
