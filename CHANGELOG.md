# Changelog

All notable changes to LeadPilot AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-20

### Added
- Initial release
- Authentication with Clerk (email, OAuth, organizations)
- Razorpay billing integration (replaced Stripe)
- AI-powered lead generation using OpenAI GPT-4o-mini
- ICP (Ideal Customer Profile) builder
- Lead scoring (1-5) and personalization
- Tech stack detection from websites
- Sequence builder foundation
- Credit tracking and paywall system
- Landing page with pricing
- Protected dashboard routes
- Database schema with Prisma
- Server actions for mutations
- Export leads to CSV
- Audit logging
- Dark mode support
- Responsive design
- Production-ready configuration
- Comprehensive test suite (Vitest + Playwright)
- Full documentation and deployment guides

### Features
- **Free Plan**: 5 total leads lifetime
- **Pro Plan**: 1,000 leads per month
- **Enterprise Plan**: Unlimited leads with custom solutions

### Tech Stack
- Next.js 14 (App Router, Server Actions, RSC)
- TypeScript
- Tailwind CSS + shadcn/ui
- Clerk Authentication
- Stripe Billing
- Prisma ORM + PostgreSQL
- OpenAI API
- Vercel deployment ready

[1.0.0]: https://github.com/your-username/leadpilot-ai/releases/tag/v1.0.0
