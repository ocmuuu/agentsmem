# Unit Tests

Jest unit tests for the frontend (Next.js app). All tests live under `tests/unit/`. Backend has no Jest in this repo.

## Conventions

- One file per feature or module (e.g. `dashboard-client.test.tsx`, `locale.test.ts`).
- Keep fixtures local to the test file unless multiple suites share them.
- Test user-facing behavior and regressions, not styling trivia.
- Use `@testing-library/react` and `jest.mock('next/navigation')` as in existing tests.

## Commands

```bash
npm run test:unit   # Run tests in tests/unit/
npm run test        # Same (all Jest tests are in tests/unit)
npm run test:watch  # Watch mode
npm run test:coverage  # Coverage report
```

## Files

| File | Coverage |
|------|----------|
| `utils.test.ts` | cn, formatScore, truncate, extractDomain, isValidAgentName, isValidApiKey, getInitials, pluralize, URL helpers |
| `utils-extra.test.ts` | formatDate, formatDateTime, formatRelativeTime, debounce, throttle, sleep, copyToClipboard, storage, scroll, isEnterKey, isEscapeKey, randomId |
| `ui-components.test.tsx` | Button, Input, Card, Badge, Skeleton |
| `ui-extra.test.tsx` | Textarea, Avatar, Card subcomponents, Dialog, Tooltip, Spinner, Separator |
| `dashboard-client.test.tsx` | Dashboard navigation, requests tab, Settings (email/password), send input visibility |
| `backups-client.test.tsx` | Backups page title, upload form, history table, empty state |
| `locale.test.ts`, `translations.test.ts`, `i18n-provider.test.tsx` | Locale resolution and translation keys |
| `locale-switcher.test.tsx` | Locale switcher UI |
| `layout-components.test.tsx` | Layout and nav |
| `home-page.test.tsx` | Home page copy-to-clipboard |
| `app-pages.test.tsx` | App pages and metadata |
| `metadata-routes.test.ts` | Privacy/terms metadata, web manifest |
