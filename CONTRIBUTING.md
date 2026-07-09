# Contributing to AccOffice

Thank you for contributing to AccOffice. This document explains how to make improvements, submit changes, and help maintain the project.

## How to contribute

1. Fork the repository or create a feature branch.
2. Follow the existing project structure and coding standards.
3. Add documentation for new features or architecture changes.
4. Run the existing lint and build commands before submitting a pull request.

## Coding guidelines

- Use TypeScript and avoid `any` unless absolutely necessary.
- Use `shadcn/ui` components for UI consistency.
- Prefer server components unless client-side interactivity is required.
- Keep components and services small and focused.
- Write clean, readable code and remove unused imports.

## Testing and validation

- Run `npm install` after pulling updates.
- Run `npm run lint` to catch formatting and type issues.
- Run `npm run build` to validate the app compiles.

## Pull request checklist

- [ ] The change is scoped to a single feature or fix.
- [ ] Code follows the project coding standard.
- [ ] Documentation is updated when appropriate.
- [ ] Lint and build pass locally.

## Documentation

This repository includes documentation in the `docs/` folder. New features or architectural changes should be reflected in the appropriate docs files.
