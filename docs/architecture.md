# Architecture

## Guest Journey

The site starts from an unidentified state. Unknown visitors are redirected to `/access` and do not see private or personalized content. The access page currently supports fictional demo invitations only. Future personal links, QR-code links, or invitation codes should be validated by a secure backend before any sensitive guest data is delivered.

After identification, the route guard derives the next destination from the guest state:

- Unanswered guests go to `/rsvp`.
- Declined guests go to `/declined` and stay there on later visits.
- Accepted guests with incomplete details go to `/details`.
- Accepted guests with completed details go to `/` and may open protected guest pages.

## Guest-State Machine

The app uses the `GuestState` discriminated union in `src/models/guest.ts`:

| State | Meaning | Default route |
| --- | --- | --- |
| `unidentified` | No recognized invitation group | `/access` |
| `identified` | Invitation group recognized, RSVP unanswered | `/rsvp` |
| `declined` | RSVP declined | `/declined` |
| `accepted-incomplete` | RSVP accepted, details missing | `/details` |
| `accepted-complete` | RSVP accepted and details completed | `/` |

The invitation group stores progress as a union, so impossible combinations such as declined plus completed questionnaire are not representable in normal app code.

## Route-Access Matrix

| Route group | Unidentified | Identified unanswered | Declined | Accepted incomplete | Accepted complete |
| --- | --- | --- | --- | --- | --- |
| `/access` | Allow | Redirect `/rsvp` | Redirect `/declined` | Redirect `/details` | Redirect `/` |
| `/rsvp` | Redirect `/access` | Allow | Redirect `/declined` | Redirect `/details` | Redirect `/` |
| `/details` | Redirect `/access` | Redirect `/rsvp` | Redirect `/declined` | Allow | Redirect `/` |
| `/declined` | Redirect `/access` | Redirect `/rsvp` | Allow | Redirect `/details` | Redirect `/` |
| `/` and accepted pages | Redirect `/access` | Redirect `/rsvp` | Redirect `/declined` | Redirect `/details` | Allow |
| Not found | Allow | Allow | Allow | Allow | Allow |

The matrix is implemented in `src/app/router/accessRules.ts` and consumed by a single route gate in `src/app/router/routes.tsx`.

## Data Boundaries

Public frontend responsibilities:

- Render guest flows after a session state is known.
- Avoid flashing protected pages before redirects.
- Validate form input for usability.
- Submit RSVP and questionnaire data through repository interfaces.
- Render only controlled personalization fields as text.

Private backend responsibilities for production:

- Secure guest identification.
- Private RSVP and questionnaire persistence.
- Controlled personalization delivery.
- Administrative access controls.
- Secure photo upload, storage, moderation, and deletion.

## Personalization Strategy

`PersonalizationProfile` supports greetings, welcome messages, selected homepage content, theme variants, approved visual effect identifiers, language, travel tags, and group notes.

Personalization data must not include arbitrary JavaScript, executable HTML, arbitrary CSS, or untrusted URLs. Production profiles should be returned only after secure identification and should not be bundled into public frontend files.

## RSVP Storage Requirements

The demo adapter writes fictional RSVP and questionnaire data to a versioned browser localStorage key. This is useful only for development flow simulation. It is not authentication, not private, and not durable production storage.

A production implementation should provide:

- Server-side validation of invitation identity.
- Idempotent RSVP and questionnaire writes.
- Audit-friendly timestamps and schema versions.
- Export for the couple.
- Deletion and correction paths.

## Future Photo Upload Requirements

The app defines photo-upload metadata and media repository contracts but does not render an upload button. A production media implementation must use private upload tickets, file-size limits, MIME validation, malware scanning where appropriate, moderation, public-display approval, storage lifecycle rules, and deletion handling.

Uploaded files must not be stored as Base64 in localStorage and must not be committed to the repository.

## GitHub Pages Constraints

GitHub Pages can host the static app and assets. It cannot provide a secure backend, private database, authentication, server-side session, protected file upload, or private admin interface.

The app uses `HashRouter` so protected routes and refreshes work without server-side rewrites. Vite uses relative asset paths by default, which is compatible with repository subpaths.

## Replacing the Demo Adapter

The UI consumes `GuestServices` from `src/services/contracts`. To add a production adapter:

1. Implement `GuestAccessService`, `GuestSessionService`, `RsvpRepository`, `QuestionnaireRepository`, `PersonalizationRepository`, `WeddingContentRepository`, and `MediaRepository`.
2. Validate all data returned from network boundaries before deriving guest state.
3. Keep private guest lists, RSVP responses, questionnaire responses, seating data, and media references on the backend.
4. Replace `createDemoServices()` in `GuestSessionProvider` composition with a production service factory.
5. Keep route-access rules driven by `GuestState`, not page-specific conditions.
