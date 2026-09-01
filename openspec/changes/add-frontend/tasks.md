## 1. Scaffold and Foundation

- [x] 1.1 Scaffold Next.js app (App Router + TypeScript + Tailwind) in the project root
- [x] 1.2 Run `npx shadcn init` and add core shadcn/ui components (button, card, input, label, badge, separator, skeleton, avatar, dropdown-menu, sheet, table, dialog, tabs, select, form, sonner, carousel, pagination, sidebar)
- [x] 1.3 Define global theme tokens (CSS variables) in `globals.css` and set up font/typography
- [x] 1.4 Create shared types in `lib/types.ts` (User, PropertyOwner, PropertySeeker, Listing, PropertyImage, Enquiry, Role)
- [x] 1.5 Create mock data layer `lib/data/mock*.ts` (seed users, listings, enquiries) with a typed data API (`getListings`, `getListingById`, `getEnquiriesByOwner`, `getInquiriesForSeeker`)
- [x] 1.6 Create mock session hook (`lib/session.ts` returning a mock current user) for role routing
- [x] 1.7 Build public layout with header (shadcn nav) + footer, and mobile sheet navigation

## 2. Landing and Auth UI

- [x] 2.1 Build landing page (hero, feature highlights, CTAs, featured property cards)
- [x] 2.2 Build login page with validation and role-based routing on success
- [x] 2.3 Build registration page with role picker (Owner/Seeker) and validation
- [x] 2.4 Wire auth forms to mock session (in-memory login, error states)

## 3. Property Browsing

- [x] 3.1 Build browse page with property cards grid (thumbnail, type, location, price)
- [x] 3.2 Build filter sidebar/controls for location and budget (price range) with in-memory filtering
- [x] 3.3 Build empty state for no results with clear-filters action
- [x] 3.4 Build property detail page with image carousel and full listing info
- [x] 3.5 Build enquiry form on detail page with validation and success confirmation
- [x] 3.6 Record enquiries in-memory so they appear on owner/seeker dashboards

## 4. Owner Dashboard

- [x] 4.1 Create shared dashboard layout with shadcn sidebar and role-specific nav groups
- [x] 4.2 Build owner overview page with summary stats (total/active listings, enquiries)
- [x] 4.3 Build owner listings table (view own listings only) with create/edit/delete actions
- [x] 4.4 Build listing create form (type, purpose, location, price, description, images)
- [x] 4.5 Build listing edit form (pre-filled, updates in-memory)
- [x] 4.6 Build delete confirmation dialog
- [x] 4.7 Build owner enquiries page (enquiries on own listings)

## 5. Seeker and Admin

- [x] 5.1 Build seeker dashboard overview showing saved/inquired properties with empty state
- [x] 5.2 Link seeker dashboard items to property detail pages
- [x] 5.3 Build admin overview page with platform stats and users table (all records)
- [x] 5.4 Verify role routing: owner→owner dashboard, seeker→seeker dashboard, admin→admin area

## 6. Polish and Verify

- [x] 6.1 Audit every page for shadcn-only UI (no hand-rolled buttons/cards/modals)
- [x] 6.2 Verify responsive behavior on narrow screens (header collapse, grid/tables adapt)
- [x] 6.3 Run full build (`npm run build`) and fix any type/lint errors
- [x] 6.4 Manual walkthrough of all routes to confirm they match the Chapter 3 page map
