# Code Review Rules

## TypeScript
- No `any` types - use proper typing or `unknown`
- Use `const` over `let` when variable is not reassigned
- Prefer interfaces over type aliases for object shapes
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- All functions should have explicit return types
- No unused imports or variables

## React
- Functional components only with hooks
- No `import * as React` - use named imports like `import { useState }`
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive computations
- All images must have alt text for accessibility
- No inline styles - use CSS files or CSS-in-JS

## Electron
- Never enable `nodeIntegration` in renderer
- Always use `contextIsolation: true`
- Preload scripts must use `contextBridge.exposeInMainWorld`
- Validate all IPC messages in main process
- Never expose sensitive APIs directly to renderer

## Code Quality
- No console.log in production code (use proper logging)
- Handle all Promise rejections with try/catch or .catch()
- No magic numbers - use named constants
- Keep functions under 50 lines
- Maximum 3 levels of nesting

## Security
- Never store secrets in code
- Sanitize all user input before rendering (DOMPurify for HTML)
- No `eval()` or `Function()` constructor
- Use parameterized queries for any database operations
