# Contributing to Ping-Me

Thank you for considering contributing to Ping-Me! This document provides guidelines and instructions to help you get started.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.x
- [PNPM](https://pnpm.io/) >= 10.x

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/ping-me.git
   cd ping-me
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Build all packages:
   ```bash
   pnpm build
   ```
5. Start the development environment:
   ```bash
   pnpm dev
   ```

## 📦 Monorepo Structure

This project uses Turborepo to manage a monorepo with multiple packages:

- `packages/core`: The main framework-agnostic ping logic
- `packages/express`, `packages/next`, etc.: Framework-specific adapters
- `packages/cli`: CLI tool
- `packages/metrics-server`: Standalone metrics server
- `apps/dashboard`: Next.js dashboard application
- `apps/api`: Backend API services
- `apps/examples`: Example applications showcasing usage

## 🛠️ Development Workflow

### Common Commands

- `pnpm dev`: Run all packages in development mode
- `pnpm build`: Build all packages
- `pnpm test`: Run all tests
- `pnpm lint`: Lint all code
- `pnpm clean`: Clean all build outputs

### Package-Specific Development

To work on a specific package:

```bash
# Navigate to the package
cd packages/core

# Run development mode
pnpm dev

# Run tests
pnpm test
```

## 📝 Code Style and Quality

We use ESLint and Prettier to maintain code quality and consistent style:

- ESLint enforces coding standards
- Prettier formats code consistently
- TypeScript provides type safety

Before submitting a PR, ensure your code:

1. Has no linting errors: `pnpm lint`
2. Passes all tests: `pnpm test`
3. Is formatted properly: `pnpm format`

## 📦 Creating a New Package

To create a new package in the monorepo:

1. Create a new directory in `packages/`:
   ```bash
   mkdir -p packages/my-package/src
   ```

2. Create package files:
   - `packages/my-package/package.json`
   - `packages/my-package/tsconfig.json`
   - `packages/my-package/src/index.ts`

3. Add your package to the workspace in `pnpm-workspace.yaml`

## 🧪 Testing

We value tests! Please include tests for your contributions:

- Unit tests for utility functions and core logic
- Integration tests for adapters and server code
- End-to-end tests for CLI and user flows

Run tests with:

```bash
pnpm test
```

## 📄 Pull Request Process

1. Create a new branch from `main`: `git checkout -b feature/your-feature-name`
2. Make your changes, following the code style guidelines
3. Add or update tests as needed
4. Update documentation to reflect any changes
5. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/) specification:
   ```
   feat: add new feature
   fix: fix bug
   docs: update documentation
   chore: update build scripts
   ```
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request against the `main` branch

## 📌 Versioning

We use [Changesets](https://github.com/changesets/changesets) to manage versions and changelog:

1. After making changes, run: `pnpm changeset`
2. Select the packages you modified
3. Choose the semver bump type (patch, minor, major)
4. Write a description of your changes
5. Commit the generated changeset file

## 📚 Documentation

Documentation is crucial for a great developer experience. When contributing:

- Update README.md if necessary
- Add or update JSDoc comments on exported functions
- Update or add examples if you've changed an API

## 🧩 Dependency Management

- Use `pnpm add <package>` to add dependencies
- Reference workspace packages with `workspace:*` version

## 🙏 Thank You!

Your contributions make Ping-Me better for everyone. We appreciate your help!