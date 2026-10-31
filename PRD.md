# Dorm Marketplace — Product Requirements Document

## 1. Scope Cut

The following features are intentionally excluded from the Day 1 MVP:

1. **Online Payments:** Payment gateway integration is excluded because transactions will happen independently between students during in-person handoffs.
2. **Live Chat:** Real-time messaging is excluded to keep the initial application focused on listing and claiming items.
3. **Advanced Search and Recommendations:** Complex filtering and recommendation algorithms are excluded because basic item browsing is sufficient for the initial prototype.

## 2. MVP Features

1. **Create and Browse Listings:** Students can create item listings with a title, description, price, category, and seller information. Other students can browse available listings.
2. **Claim and Complete Handoff:** Students can claim available items and confirm successful in-person pickup. Each item can have only one active claim.
3. **Listing and Claim State Management:** The system automatically expires abandoned claims and allows sellers to mark items as sold, ensuring listings remain accurate.

## 3. Acceptance Criteria

### Acceptance Criterion 1 — Successful Claim

- **Given:** An item is listed and currently available.
- **When:** A student clicks the Claim Item button.
- **Then:** The system creates a claim, reserves the item for that student, and updates its status to Reserved.

### Acceptance Criterion 2 — Concurrent Claim Prevention

- **Given:** An item is available and two students attempt to claim it simultaneously.
- **When:** Both students submit their claim requests.
- **Then:** Only one claim succeeds, while the other student receives an item no longer available message.

### Acceptance Criterion 3 — Expired Claim and Seller Override

- **Given:** An item has an active claim.
- **When:** The claim expires without pickup confirmation, or the seller marks the item as sold.
- **Then:** An expired claim makes the item available again, while a seller override immediately marks it as sold and invalidates the active claim.