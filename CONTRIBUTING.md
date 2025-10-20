# Contributing to LeadPilot AI

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/leadpilot-ai.git`
3. Install dependencies: `pnpm install`
4. Set up environment variables (see README.md)
5. Run migrations: `pnpm db:migrate`
6. Start dev server: `pnpm dev`

## Code Style

- We use ESLint and Prettier for code formatting
- Run `pnpm lint` to check for issues
- Run `pnpm format` to auto-format code
- Pre-commit hooks will automatically format staged files

## Commit Messages

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add lead export to CSV`

## Pull Requests

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Add tests if applicable
4. Run tests: `pnpm test`
5. Commit your changes
6. Push to your fork: `git push origin feat/my-feature`
7. Open a pull request

## Testing

- Write unit tests for utility functions
- Write E2E tests for critical user flows
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage

## Questions?

Open an issue or start a discussion!
