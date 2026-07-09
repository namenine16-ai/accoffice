# Coding Standard

This project follows a clean and consistent TypeScript-first codebase with reusable UI components, strong validation, and minimal duplication.

## TypeScript

- Prefer explicit types for props, service inputs, and API payloads.
- Avoid `any` unless there is a very strong reason.
- Use built-in or project-specific type definitions instead of implicit `unknown`.

## UI and styling

- Use shadcn/ui components for buttons, cards, inputs, tables, dialogs, badges, and forms.
- Keep layout and spacing consistent using Tailwind CSS utilities.
- Use responsive design patterns for mobile and desktop views.
- Prefer clear loading, error, and empty states.

## Components

- Reuse existing components when possible.
- Keep components small and focused.
- Separate presentation from data loading logic where practical.
- Client components should be limited to interactive pieces and forms.

## Data and forms

- Use React Hook Form for form state management.
- Use Zod for schema validation and structured input validation.
- Make API requests through the service layer, not directly in the UI when business logic is required.

## Services and repositories

- Keep business rules in `services/`.
- Keep data access logic in `repositories/`.
- Do not mix database details into UI components.

## Quality

- Run `npm run lint` before committing.
- Keep code readable with descriptive names.
- Remove dead code and unused imports.
- Avoid excessive re-renders by memoizing derived values and using keys consistently.
