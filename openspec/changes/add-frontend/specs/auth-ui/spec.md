## ADDED Requirements

### Requirement: Registration page with role selection
The system SHALL provide a registration page where a new user enters full name, email, phone number, and password, and selects their role: Property Owner or Property Seeker. The form SHALL validate that required fields are filled and that the email is in a valid format.

#### Scenario: Successful registration
- **WHEN** a user submits a complete registration form with valid email and a chosen role
- **THEN** the system accepts the submission, shows a success indication, and routes the user to the login page

#### Scenario: Invalid email
- **WHEN** a user submits the registration form with a malformed email
- **THEN** the system displays an inline validation error and does not submit

#### Scenario: Missing required field
- **WHEN** a user submits the registration form with a required field left blank
- **THEN** the system displays an inline validation error for the empty field and does not submit

### Requirement: Login page
The system SHALL provide a login page collecting email and password. On successful login against the mock session, the user SHALL be routed to the dashboard matching their role.

#### Scenario: Owner login
- **WHEN** a Property Owner logs in with valid credentials
- **THEN** the user is routed to the owner dashboard

#### Scenario: Seeker login
- **WHEN** a Property Seeker logs in with valid credentials
- **THEN** the user is routed to the seeker dashboard

#### Scenario: Invalid credentials
- **WHEN** a user submits credentials that do not match the mock session data
- **THEN** the system displays an error message and stays on the login page

### Requirement: Role-based routing after authentication
The system SHALL route users to role-appropriate dashboards after login, so an owner never lands in the seeker dashboard and vice versa.

#### Scenario: Role determines dashboard
- **WHEN** any user authenticates
- **THEN** the destination dashboard is determined by the user's role (owner or seeker)
