## Why

The Rental and Sales Management System is fully designed (Chapters 1–3) but has no implementation. This change builds the complete frontend UI of the system in Next.js, using shadcn/ui components exclusively for all interface elements, so the platform has a polished, professional, and demo-ready interface matching the design documented in Chapter 3.

## What Changes

- Scaffold a Next.js (App Router) project with Tailwind CSS and shadcn/ui configured as the sole UI component source.
- Build all public pages: Landing, Login, Register (with role picker), Property Search/Browse with location & budget filters, and Property Detail with enquiry form.
- Build the Property Owner dashboard: overview, listing management (create, view, update, delete), and received enquiries.
- Build the Property Seeker dashboard: saved/inquired properties.
- Build a basic admin area: user oversight.
- Implement role-aware layout and navigation (header, footer, dashboard sidebar) consistent across all pages.
- All pages render against mock data for now; backend integration is out of scope for this change.

## Capabilities

### New Capabilities

- `ui-foundation`: Next.js + Tailwind + shadcn/ui setup, global layout, header/footer navigation, and shared UI primitives used across the platform.
- `landing-page`: The public landing/home page presenting the platform and its value proposition.
- `auth-ui`: Registration (owner/seeker) and login pages with role-based routing.
- `property-browsing`: Property listing search, location & budget filtering, and property detail viewing with enquiry submission.
- `owner-dashboard`: Owner's listing management (create/update/delete) and received enquiries.
- `seeker-dashboard`: Seeker's saved and inquired properties.
- `admin-ui`: Basic administrative overview of registered users.

### Modified Capabilities

None. This change introduces the first capabilities in an empty spec set.

## Impact

- New codebase: a Next.js application in the project root.
- New dependencies: Next.js, React, Tailwind CSS, shadcn/ui components, Radix UI primitives, class-variance-authority, tailwind-merge, clsx, lucide-react.
- Aligns with the Chapter 3 functional requirements (FR1–FR10) and non-functional usability requirement (simple, intuitive interface).
- Backend, database, and authentication logic are intentionally deferred to a later change; this change is UI-only against mock data.
