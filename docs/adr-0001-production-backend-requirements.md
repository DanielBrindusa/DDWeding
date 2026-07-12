# ADR 0001: Production Backend Requirements

## Status

Proposed for a future phase.

## Context

The current app is static and suitable for GitHub Pages. Static hosting is not enough for real guest identification, RSVP persistence, private questionnaire data, personalized content, image upload, or administrative access.

## Decision

Do not select or implement a production backend in this foundation task. The future backend decision must be based on privacy, durability, operational effort, export needs, and access-control requirements, not on what is easiest to demo.

## Required Capabilities

- Secure guest identification.
- RSVP persistence.
- Questionnaire persistence.
- Retrieval of accepted and rejected responses for the couple.
- Invitation-group, couple, family, child, and plus-one support.
- Controlled personalization delivery.
- Duplicate-submission handling.
- Data export.
- Access control for administrative data.
- Image upload.
- Image moderation or approval.
- Image storage.
- Privacy and deletion handling.
- Backup and recovery.

## Explicit Non-Goals

- Store sensitive RSVP responses directly in a public GitHub repository.
- Treat GitHub Pages route guards as a security boundary.
- Use frontend-only invitation-code validation as production authentication.
- Store uploaded files in localStorage.
- Ship real guest lists or seating assignments in frontend bundles.

## Candidate Directions To Evaluate Later

- A small serverless API with a managed database.
- A managed form service with strong export and privacy controls.
- A backend-as-a-service with carefully configured authentication and row-level access controls.
- Object storage with short-lived signed upload URLs and moderation workflow.

Each option must be reviewed for privacy, backup, deletion, export, cost, operational access, and failure recovery.
