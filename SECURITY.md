# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@leadpilot.ai with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

**Do not** create a public GitHub issue for security vulnerabilities.

We will respond within 48 hours and provide a timeline for a fix.

## Security Measures

LeadPilot AI implements:

- CSRF protection via Next.js Server Actions
- Input validation with Zod
- SQL injection protection via Prisma ORM
- XSS protection via React's built-in escaping
- HTTPS-only cookies
- Secure headers in middleware
- Environment variable validation
- Rate limiting (configurable)
- Regular dependency updates

## Best Practices

When deploying:

1. Use strong, unique secrets for all services
2. Enable 2FA on all accounts (Clerk, Stripe, GitHub, Vercel)
3. Regularly rotate API keys
4. Monitor logs for suspicious activity
5. Keep dependencies up to date
6. Use production-grade PostgreSQL with backups
7. Configure rate limiting for API routes
8. Enable Vercel's security headers

## Bug Bounty

We currently do not have a formal bug bounty program, but we appreciate responsible disclosure and will acknowledge security researchers in our release notes.
