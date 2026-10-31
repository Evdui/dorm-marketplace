# Dorm Marketplace 🏪

A campus-based marketplace where students can list, discover, and claim second-hand items for free or at a small price, with in-person handoffs.

## Features

- Create and browse marketplace listings.
- Search listings and filter by category.
- Claim available items.
- Prevent multiple students from claiming the same item.
- Automatically expire abandoned reservations after 60 seconds.
- Confirm successful in-person pickups.
- Allow sellers to mark listings as sold, even when a reservation is active.
- Display real-time item status updates through periodic API polling.

## Tech Stack

**Frontend**
- React
- Vite
- CSS
- Fetch API

**Backend**
- Node.js
- Express.js
- CORS
- In-memory state

## Project Structure

```text
dorm-marketplace/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── server.js
│   ├── test-concurrency.js
│   └── package.json
│
├── PRD.md
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd dorm-marketplace
```

### 2. Start the backend

```bash
cd server
npm install
npm run dev
```

Backend URL: `http://localhost:5000`

### 3. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Marketplace Rules

- Each item can have only one active reservation.
- Reservations expire after 60 seconds if pickup is not confirmed.
- Buyers can confirm successful pickups.
- Sellers can immediately mark their listings as sold.
- Sellers cannot claim their own listings.

## Testing

Start the backend, then run:

```bash
cd server
node test-concurrency.js
```

The concurrency test sends two simultaneous claim requests and verifies that only one succeeds.

## Storage

The prototype uses in-memory server storage. Listings and reservations reset when the backend restarts.

## Scope Exclusions

- Online payment processing.
- Live chat.
- Advanced search and recommendations.

## Project Status

Working prototype built as part of Kalvium AKD Milestone 2 — Challenge #10.