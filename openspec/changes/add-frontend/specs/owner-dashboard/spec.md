## ADDED Requirements

### Requirement: Owner dashboard overview
The system SHALL provide a dashboard for Property Owners with an overview showing summary stats (total listings, active listings, total enquiries) and quick links into their management areas.

#### Scenario: Owner overview loads
- **WHEN** a Property Owner opens their dashboard
- **THEN** they see summary statistics and navigation to their listings and enquiries

### Requirement: Manage listings (create, view, update, delete)
The system SHALL allow a Property Owner to create new property listings, view their existing listings in a table, edit a listing's details, and delete a listing. The create/edit form SHALL collect property type, purpose (rent/sale), location, price, description, and images.

#### Scenario: Create a listing
- **WHEN** an owner submits a valid listing form
- **THEN** the listing is added to the owner's listing table in-memory

#### Scenario: Listing form validation
- **WHEN** an owner submits the listing form with a required field (price or location) blank
- **THEN** the system shows an inline validation error and does not create the listing

#### Scenario: Edit a listing
- **WHEN** an owner opens a listing in edit mode and saves changes
- **THEN** the updated details replace the previous listing data in-memory

#### Scenario: Delete a listing
- **WHEN** an owner confirms deletion of a listing
- **THEN** the listing is removed from the owner's table in-memory

#### Scenario: Owner only sees own listings
- **WHEN** an owner views their listings
- **THEN** they see only the listings they created, never another owner's listings

### Requirement: View received enquiries
The system SHALL show the Property Owner the enquiries received on their listings, each displaying the related property and the seeker's message.

#### Scenario: Owner views enquiries
- **WHEN** an owner opens their enquiries area
- **THEN** they see all enquiries received on their listings with the related property and message
