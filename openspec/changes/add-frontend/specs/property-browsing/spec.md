## ADDED Requirements

### Requirement: Browse properties with search and filters
The system SHALL provide a browse page listing all available properties, with filter controls for location and budget (price range) that narrow the displayed listings in-memory.

#### Scenario: Browse shows all listings
- **WHEN** a user visits the browse page with no filters applied
- **THEN** all available mock listings are displayed as property cards

#### Scenario: Filter by location
- **WHEN** a user selects a location filter
- **THEN** only listings matching that location are displayed

#### Scenario: Filter by budget
- **WHEN** a user sets a budget/price range filter
- **THEN** only listings within that price range are displayed

#### Scenario: Combined filters
- **WHEN** a user applies both location and budget filters
- **THEN** only listings matching both criteria are displayed

#### Scenario: No matching results
- **WHEN** no listing matches the applied filters
- **THEN** the system displays an empty-state message and a way to clear the filters

### Requirement: Property detail page
The system SHALL provide a detail page for each property showing all listing information: property type, purpose (rent or sale), location, price, full description, amenities/features, and all property images in a carousel.

#### Scenario: View property details
- **WHEN** a user opens a property detail page
- **THEN** the page displays the complete listing information and an image carousel

### Requirement: Enquiry submission
The system SHALL allow a property seeker to submit an enquiry message about a specific listing through a form on the property detail page, recorded in-memory and reflected in the owner's enquiries.

#### Scenario: Submit an enquiry
- **WHEN** a logged-in seeker submits an enquiry message on a property detail page
- **THEN** the system records the enquiry against the listing and shows a success confirmation

#### Scenario: Empty enquiry message
- **WHEN** a user submits an enquiry with an empty message
- **THEN** the system shows a validation error and does not record the enquiry
