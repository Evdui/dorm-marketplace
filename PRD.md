# Dorm Marketplace — Product Requirements Document

## 1. Problem Statement

Students often have unused textbooks, electronics, stationery, and other useful items. Other students may need these items but lack a simple way to discover and exchange them within their campus community.

Dorm Marketplace provides a centralized platform where students can list, discover, reserve, and exchange second-hand items through in-person handoffs.

## 2. MVP — Three Core Features

### Feature 1: Listing Management and Discovery

Students can create listings with a title, description, category, and price. Other students can browse listings, search by keywords, and filter by category to find useful items.

### Feature 2: Reservation Management

Students can claim available listings. Each item can have only one active reservation. Reservations automatically expire after 60 seconds if the buyer does not complete the handoff, making the item available again.

### Feature 3: Handoff and Sale Completion

Buyers can confirm successful in-person pickup to complete a transaction. Sellers can also mark an item as sold if they complete an in-person sale while an online reservation is active. This seller override clears the reservation and prevents the previous buyer from completing the transaction.

## 3. Scope Cuts and Technical Tradeoffs

The MVP intentionally excludes the following features:

- **Online payments:** Exchanges happen in person. Excluding payment gateways avoids payment-provider integration, transaction security, refunds, and payment-status synchronization. The tradeoff is that the application does not process or verify payments.
- **Live chat:** Communication is outside the core listing and reservation workflow. Excluding real-time messaging avoids WebSocket infrastructure, message storage, and moderation requirements. The tradeoff is that students must coordinate handoffs outside the platform.
- **Advanced recommendations:** Basic search and category filters are sufficient for the initial marketplace. Excluding recommendation algorithms reduces data and computation requirements. The tradeoff is that listings are not personalized or ranked by student preferences.

These decisions keep the MVP focused on reliable campus item exchanges.

## 4. Acceptance Criteria — Given / When / Then

### Scenario 1: Successful Reservation and Pickup

**Given** an item is available and a student is not its seller,

**When** the student claims the item and confirms the in-person pickup,

**Then** the item changes from available to reserved, and subsequently to sold. The reservation is cleared after completion.

### Scenario 2: Simultaneous Claim Prevention

**Given** an item is available,

**When** two students attempt to claim the same item simultaneously,

**Then** exactly one claim succeeds with HTTP 200, while the other receives HTTP 409. Only one active reservation is created.

### Scenario 3: Reservation Expiration

**Given** an item has an active reservation,

**When** the buyer does not confirm pickup within 60 seconds,

**Then** the reservation expires, the claim is cleared, and the item returns to available status.

### Scenario 4: Hallway-Sale Seller Override

**Given** an item has an active online reservation,

**When** the seller completes an in-person sale and marks the listing as sold,

**Then** the item changes to sold, the active reservation is cleared, and the previous online buyer can no longer confirm pickup.

## 5. Business Rules

- Sellers cannot claim their own listings.
- Only available items can be claimed.
- Each item can have only one active reservation.
- Reservations last 60 seconds.
- Only the active buyer can confirm pickup.
- Only the listing owner can mark an item as sold.
- A seller override invalidates an active reservation.

## 6. Technical Implementation

- Frontend: React and Vite
- Backend: Node.js and Express
- API communication: Fetch API and HTTP endpoints
- Storage: In-memory server state
- Testing: Node.js built-in test runner and a simultaneous-claim test

## 7. Known Limitations

- Listings and reservations reset when the backend restarts.
- Student identity is simulated; production authentication is not implemented.
- In-memory concurrency protection is designed for a single Node.js server process, not multiple server instances.

## 8. Success Criteria

The MVP is successful when students can create and discover listings, reserve available items without duplicate claims, and complete or resolve in-person handoffs through pickup confirmation, reservation expiration, or seller override.