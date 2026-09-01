## ADDED Requirements

### Requirement: Next.js application with shadcn/ui
The system SHALL be a Next.js (App Router) application styled with Tailwind CSS where every user-facing interface element (buttons, cards, inputs, forms, tables, dialogs, badges, navigation, sidebar) is rendered using shadcn/ui components installed into the project.

#### Scenario: Scaffold is present
- **WHEN** the application is started
- **THEN** it runs as a Next.js app with Tailwind CSS and shadcn/ui configured, and shadcn components are available in `components/ui/`

### Requirement: Global navigation and layout
The system SHALL provide a persistent public header with navigation to Home, Browse Properties, Login, and Register, plus a footer, applied to all public pages. Dashboard routes SHALL use a shared layout with a sidebar showing role-specific navigation.

#### Scenario: Public header on public pages
- **WHEN** a user visits any public page
- **THEN** the page displays the global header and footer with navigation links to Home, Browse Properties, Login, and Register

#### Scenario: Sidebar on dashboard pages
- **WHEN** a user visits any `/dashboard/*` or `/admin` route
- **THEN** the page renders inside the dashboard layout with a sidebar whose navigation items match the user's role

### Requirement: Consistent theming
The system SHALL define its visual theme (colors, radius, typography) through CSS variables in the global stylesheet so the entire platform can be re-skinned from a single location.

#### Scenario: Theme variables are centralized
- **WHEN** a developer inspects the global stylesheet
- **THEN** theme tokens are declared as CSS variables that shadcn components consume

### Requirement: Responsive layout
All pages SHALL remain usable on small screens, with navigation collapsing into a shadcn sheet/drawer and cards/tables adapting their layout.

#### Scenario: Mobile navigation
- **WHEN** the viewport is narrow
- **THEN** the header navigation collapses into a menu control that opens a full navigation sheet
