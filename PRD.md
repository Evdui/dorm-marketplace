# Dorm Marketplace — Product Requirements Document

## 1. Problem Statement

Students often have unused textbooks, electronics, stationery, and other useful items. Other students may need these items but lack a simple way to discover and exchange them within their campus community.

Dorm Marketplace provides a centralized platform for students to list, browse, reserve, and exchange second-hand items through in-person handoffs.

## 2. MVP Scope

### Included Features

- Create listings with a title, description, category, and price.
- Browse and search available listings.
- Filter listings by category.
- Reserve an available item for a limited time.
- Prevent multiple students from reserving the same item.
- Automatically release reservations after 60 seconds.
- Allow buyers to confirm successful pickup.
- Allow sellers to mark an item sold after an in-person sale, even when an online reservation is active.

## 3. Scope Cuts and Decisions

The following features were intentionally excluded from the MVP:

- **Online payments:** The project focuses on item discovery and reservation. Students complete exchanges in person, avoiding payment gateway integration and additional security requirements.
- **Live chat:** Direct messaging is not essential to demonstrate the listing and reservation workflow. It would introduce additional real-time communication complexity.
- **Advanced recommendations:** Basic search and category filters are sufficient for the initial marketplace. Recommendation algorithms would add complexity without being necessary to validate the core experience.

These decisions keep the MVP focused on its primary purpose: reliable campus item exchanges.

## 4. Acceptance Criteria — Given / When / Then

### Scenario 1: Successful Reservation and Pickup

**Given** an item is available and a student is not its seller,

**When** the student claims the item and confirms the in-person pickup,

**Then** the item is reserved for that student and subsequently marked as sold.

### Scenario 2: Simultaneous Claim Prevention

**Given** an item is available,

**When** two students attempt to claim the same item simultaneously,

**Then** exactly one claim succeeds with HTTP 200, while the other receives HTTP 409, and only one active reservation exists.

### Scenario 3: Reservation Expiration and Seller Override

**Given** an item has an active reservation,

**When** the reservation expires without pickup confirmation,

**Then** the reservation is cleared and the item becomes available again.

**And**, if the seller completes an in-person sale while an online reservation is active, the seller can mark the item as sold, clearing the reservation and preventing the previous buyer from confirming pickup.

## 5. Business Rules

- A seller cannot claim their own listing.
- Only available items can be claimed.
- Each item can have only one active reservation.
- Reservations last 60 seconds.
- Only the active buyer can confirm pickup.
- Only the listing owner can mark an item as sold.
- A seller's in-person sale override invalidates any active reservation.

## 6. Technical Constraints

- Frontend: React and Vite.
- Backend: Node.js and Express.
- Storage: In-memory state.
- API communication: HTTP requests using Fetch.
- Testing: Node.js built-in test runner and a simultaneous-claim test.

## 7. Known Limitations

- Listings and reservations reset when the backend restarts.
- Student identity is simulated; production authentication is not implemented.
- The in-memory concurrency protection is designed for a single Node.js server process, not multiple server instances.

## 8. Success Criteria

The MVP is successful when students can create and browse listings, reserve available items, complete pickups, and handle abandoned reservations or in-person sale overrides without allowing duplicate active claims.