# DDWeding

A long-term foundation for a custom wedding RSVP website. The app is designed as a static React site that can be hosted on GitHub Pages while keeping the RSVP, questionnaire, personalization, and media-storage boundaries replaceable for a future secure backend.

## Current Scope

This first version establishes:

- React, Vite, TypeScript, React Router, Vitest, React Testing Library, ESLint, and CSS Modules.
- A centralized guest-state model and route-access rules.
- Demo-only guest identification, RSVP, declined, questionnaire, and homepage flows.
- Service contracts for future secure data storage, personalization, wedding content, photo uploads, and gallery retrieval.
- A mobile-first, accessible homepage journey foundation with reduced-motion support.
- GitHub Pages static deployment configuration.

It does not implement a production backend, real invitation codes, real guest data, admin tools, permanent photo uploads, seating data, or final wedding content.

## Local Development

This workspace currently exposes pnpm, not npm, through the bundled Codex runtime. Use:

```bash
pnpm install
pnpm run dev
```

Then open the local URL printed by Vite.

## Build, Typecheck, Lint, and Test

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

## Demo Access

Open the access page and use one of the visible demo invitations:

- Demo Guest
- Demo Couple
- Demo Family

These are intentionally fictional and safe for public repositories. Do not replace them with real names, real contact details, real addresses, real dietary information, real invitation codes, or private personalization data in frontend files.

## Folder Overview

```text
src/
  app/                 Application shell, providers, router, route guards
  components/          Shared layout and common UI primitives
  features/            Feature-specific UI and validation
  hooks/               Focused reusable hooks
  models/              TypeScript domain contracts
  pages/               Route pages
  services/            Service interfaces and demo adapters
  styles/              Global styles, tokens, and shared CSS modules
  test/                Test setup and utilities
```

## Guest-State Flow

The app derives route behavior from explicit guest states:

- `unidentified`
- `identified` with unanswered RSVP
- `declined`
- `accepted-incomplete`
- `accepted-complete`

Unidentified visitors are sent to access. Unanswered guests are sent to RSVP. Declined guests stay in the declined experience. Accepted guests must complete attendance details before entering the homepage or protected guest pages.

## Privacy Warning

GitHub Pages is static hosting. It cannot securely provide authentication, private guest lookup, secure RSVP storage, private questionnaire storage, access-controlled admin data, secure uploads, or server-side sessions.

The current localStorage adapter is demo-only:

- It is controlled by the visitor's browser.
- It can be edited or deleted by the visitor.
- It is not authentication.
- It is not a secure RSVP database.
- It must not be treated as production truth.

Route guards improve user flow, but they are not a security boundary when private data is bundled into public frontend assets.

## Service Adapter Architecture

Pages and feature components depend on service contracts such as `GuestAccessService`, `GuestSessionService`, `RsvpRepository`, `QuestionnaireRepository`, `PersonalizationRepository`, `WeddingContentRepository`, and `MediaRepository`.

The current demo adapter uses fictional fixtures plus a versioned storage wrapper. A production adapter should replace these services with secure server-side persistence and controlled data delivery without rewriting the page components.

## GitHub Pages Deployment

The workflow at `.github/workflows/deploy-pages.yml` builds the Vite app and publishes `dist` to GitHub Pages.

One-time GitHub setting required:

1. Open the repository on GitHub.
2. Go to Settings > Pages.
3. Set Build and deployment > Source to GitHub Actions.
4. Rerun the `Build and Deploy GitHub Pages` workflow, or push a new commit to `main`.

If Pages is not enabled or is still set to a branch source, the workflow will still run lint, tests, and build, then skip deployment with a warning instead of failing at the Pages configuration step.

The app uses `HashRouter`, so direct route visits work on GitHub Pages without server-side rewrites. Vite uses relative asset paths by default, which keeps the app compatible with repository subpaths.

## Major Future Decisions

- Select a secure guest-identification and RSVP persistence backend.
- Decide how the couple will export and manage RSVP/questionnaire data.
- Define production invitation-code generation and rotation.
- Choose a privacy-aware photo-upload and moderation workflow.
- Decide multilingual content ownership and translation workflow.
- Add the future "update my answers" guest flow.
- Add final wedding content, venue/travel details, seating guidance, and galleries.
