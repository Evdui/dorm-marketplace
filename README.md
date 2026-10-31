## Automated Testing

The backend includes automated API tests using Node.js's built-in test runner.

### Run API Tests

Start the backend in one terminal:

```bash
cd server
npm run dev
```

In another terminal, execute:

```bash
cd server
npm test
```

The automated test suite covers:

- Retrieving marketplace listings.
- Rejecting invalid listing data.
- Successfully claiming an available item.
- Preventing duplicate claims.
- Restricting pickup confirmation to the claiming buyer.
- Restricting seller override to the listing owner.

### Concurrency Testing

Run:

```bash
cd server
node test-concurrency.js
```

This test sends two simultaneous claim requests and verifies that exactly one request succeeds.

The expected responses are:

- HTTP 200 — Successful reservation.
- HTTP 409 — Item is no longer available.