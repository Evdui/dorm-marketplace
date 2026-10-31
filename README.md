## Automated Testing

The backend includes automated API tests using Node.js's built-in test runner.

### Run API Tests

Start the backend in one terminal:

```bash
cd server
npm run dev
```

In a second terminal, run:

```bash
cd server
npm test
```

The automated test suite covers:

- Retrieving marketplace listings
- Rejecting invalid listing data
- Claiming an available item and confirming pickup
- Preventing duplicate claims
- Handling simultaneous claim requests
- Releasing expired reservations
- Allowing sellers to override active reservations after an in-person sale
- Enforcing buyer and seller permissions

### Test Reservation Expiration

For a faster expiration test, start the backend with a shortened reservation duration:

```powershell
cd server
$env:CLAIM_DURATION_MS="1000"
npm run dev
```

In another terminal, run:

```powershell
cd server
npm test
```

The test environment uses a one-second reservation duration. The normal application defaults to 60 seconds.

### Standalone Concurrency Test

With the backend running, execute:

```bash
cd server
node test-concurrency.js
```

This test sends two simultaneous claim requests and verifies that exactly one request succeeds.

Expected responses:

- **HTTP 200:** Successful reservation
- **HTTP 409:** Item is no longer available

### Frontend Setup

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` to access the marketplace.