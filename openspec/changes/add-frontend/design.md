## Context

The Rental and Sales Management System (R&SMS) has a complete design in Chapters 1–3: two primary user roles (Property Owner, Property Seeker), a basic admin role, and functional requirements FR1–FR10 covering registration, login, listing CRUD, search/filter, property detail, enquiries, and role-specific dashboards. No code exists yet. This change delivers the entire frontend UI in Next.js using shadcn/ui components for all interface elements, rendered against mock data, and structured so a backend can be wired in later without rework.

## Goals / Non-Goals

**Goals:**
- A Next.js (App Router) + Tailwind CSS application where every UI element (cards, buttons, forms, tables, dialogs, nav, badges, etc.) comes from shadcn/ui.
- All pages from the Chapter 3 design implemented: public pages, owner dashboard, seeker dashboard, basic admin area.
- Role-aware navigation and layout (public header/footer, dashboard sidebar).
- Fully demo-able with mock data.

**Non-Goals:**
- Backend, database, or real authentication logic (deferred to a later change; mock data only).
- Online payment, property-ownership verification (out of scope per Chapter 1).
- Image upload processing (placeholder/mock images only).
- Server-side search indexing.

## Decisions

**D1: Next.js App Router, not Pages Router.** The App Router is the current standard, gives file-based routing (one file per page — clean for the Chapter 4 write-up), server components for static page shells, and scales naturally to API routes/server actions for the future backend.
- *Alternative considered:* Vite + React. Rejected: requires manual routing config and the write-up looks weaker.

**D2: shadcn/ui as the exclusive UI layer.** No other component library (no MUI, no Bootstrap). shadcn components are copied into `components/ui/`, styled with Tailwind, and composed via its `cn()` helper. Theming is driven by CSS variables in `globals.css` so the whole platform can be re-skinned in one place.
- *Alternative considered:* MUI. Rejected: MUI brings its own styling system that fights Tailwind; shadcn is Tailwind-native and produces the cleaner, more modern look.

**D3: Mock data layer behind typed interfaces.** A `lib/data/mock*.ts` module exports typed seed data (users, listings, enquiries) consumed by a thin `lib/data` API (e.g., `getListings()`, `getListingById()`). Pages import from this layer only. When the backend lands, only this layer changes — pages stay untouched.
- *Alternative considered:* inline data in each page. Rejected: duplicated and impossible to swap for a backend later.

**D4: Shared types in `lib/types.ts`.** `User`, `Listing`, `Enquiry`, `PropertyImage`, and role union types mirror the Chapter 3 class diagram (User → PropertyOwner/PropertySeeker; Listing 1:N PropertyImage; Enquiry links Listing + Seeker). Centralizing them keeps components and mock data consistent.

**D5: Route structure mirrors the role separation.**
- Public: `/`, `/login`, `/register`, `/listings`, `/listings/[id]`.
- Owner: `/dashboard/owner` (overview, listings, create, edit, inquiries).
- Seeker: `/dashboard/seeker`.
- Admin: `/admin`.
- Role routing is stubbed client-side via a mock session for now (a `useSession`-style hook reading a mock current user).

**D6: Dashboard layout with a shadcn sidebar.** All dashboard routes share a layout using the shadcn `Sidebar`/`SidebarProvider` (or `Sheet` + nav on smaller screens) with distinct nav groups per role, so role-based access control (RBAC per Chapter 2) is visible in the UI structure itself.

## Risks / Trade-offs

- [Mock data misrepresents final behavior] → Mock layer is typed and isolated (D3); backend swap only touches `lib/data`.
- [shadcn setup versions drift] → Pin exact `shadcn` version and component versions; verify build after `npx shadcn init`.
- [Scope creep toward backend] → Backend is a hard non-goal; any "should this persist?" question is deferred.
- [File-based routes multiply quickly] → Route map is fixed in the proposal; new routes require sign-off before adding.
- [UI-only pages feel static in demo] → Mock interactions (login, filters, enquiry submit) operate in-memory so the demo is interactive, not dead pages.

## Open Questions

- None blocking. Confirm the mock current-user flow (immediate login → role dashboard) when implementation starts.
