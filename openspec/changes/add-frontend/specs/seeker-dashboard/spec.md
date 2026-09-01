## ADDED Requirements

### Requirement: Seeker dashboard overview
The system SHALL provide a dashboard for Property Seekers showing the properties they have shown interest in (saved and/or inquired about).

#### Scenario: Seeker dashboard loads
- **WHEN** a Property Seeker opens their dashboard
- **THEN** they see the list of properties they have saved or inquired about

#### Scenario: Empty dashboard state
- **WHEN** a seeker has no saved or inquired properties
- **THEN** the dashboard shows an empty-state message with a link to browse properties

### Requirement: Properties shown interest in
The system SHALL track, in-memory, which properties a seeker has inquired about, and display these in the seeker dashboard with the ability to open the property detail page.

#### Scenario: Inquired property appears
- **WHEN** a seeker has submitted an enquiry on a property
- **THEN** that property appears in the seeker's dashboard

#### Scenario: Open from dashboard
- **WHEN** a seeker clicks a property in their dashboard
- **THEN** the user is routed to that property's detail page
