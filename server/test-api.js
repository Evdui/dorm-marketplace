const { test, before } = require("node:test");
const assert = require("node:assert/strict");

const API = "http://localhost:5000/api";

async function request(path, method = "GET", body) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  return {
    status: response.status,
    data: await response.json(),
  };
}

async function createListing(overrides = {}) {
  const result = await request("/items", "POST", {
    title: "Automated Test Book",
    description: "Created for API testing",
    category: "Books",
    price: 100,
    sellerId: "test-seller",
    sellerName: "Test Seller",
    ...overrides,
  });

  assert.equal(result.status, 201);
  return result.data.item;
}

before(async () => {
  const health = await request("/health");

  assert.equal(
    health.status,
    200,
    "Backend must be running before tests"
  );
});

test("GET /items returns marketplace listings", async () => {
  const item = await createListing();
  const result = await request("/items");

  assert.equal(result.status, 200);
  assert.ok(Array.isArray(result.data));
  assert.ok(result.data.some((current) => current.id === item.id));
});

test("Invalid listing is rejected", async () => {
  const result = await request("/items", "POST", {
    title: "",
    price: -10,
  });

  assert.equal(result.status, 400);
});

test("A student can claim an available item and confirm pickup", async () => {
  const item = await createListing();

  const claim = await request(`/items/${item.id}/claim`, "POST", {
    buyerId: "test-buyer",
  });

  assert.equal(claim.status, 200);
  assert.equal(claim.data.item.status, "reserved");
  assert.equal(claim.data.item.claim.buyerId, "test-buyer");

  const unauthorized = await request(
    `/items/${item.id}/complete`,
    "POST",
    { buyerId: "another-buyer" }
  );

  assert.equal(unauthorized.status, 409);

  const completed = await request(
    `/items/${item.id}/complete`,
    "POST",
    { buyerId: "test-buyer" }
  );

  assert.equal(completed.status, 200);
  assert.equal(completed.data.item.status, "sold");
  assert.equal(completed.data.item.claim, null);
});

test("A second student cannot claim an already reserved item", async () => {
  const item = await createListing();

  const firstClaim = await request(`/items/${item.id}/claim`, "POST", {
    buyerId: "first-buyer",
  });

  const secondClaim = await request(`/items/${item.id}/claim`, "POST", {
    buyerId: "second-buyer",
  });

  assert.equal(firstClaim.status, 200);
  assert.equal(secondClaim.status, 409);
});

test("Simultaneous claims allow exactly one student to reserve an item", async () => {
  const item = await createListing();

  const [first, second] = await Promise.all([
    request(`/items/${item.id}/claim`, "POST", {
      buyerId: "simultaneous-buyer-A",
    }),
    request(`/items/${item.id}/claim`, "POST", {
      buyerId: "simultaneous-buyer-B",
    }),
  ]);

  const statuses = [first.status, second.status].sort();

  assert.deepEqual(statuses, [200, 409]);

  const finalItems = await request("/items");
  const finalItem = finalItems.data.find(
    (current) => current.id === item.id
  );

  assert.equal(finalItem.status, "reserved");
  assert.ok([
    "simultaneous-buyer-A",
    "simultaneous-buyer-B",
  ].includes(finalItem.claim.buyerId));
});

test("An expired reservation makes the item available again", async () => {
  const item = await createListing();

  const claim = await request(`/items/${item.id}/claim`, "POST", {
    buyerId: "temporary-buyer",
  });

  assert.equal(claim.status, 200);
  assert.equal(claim.data.item.status, "reserved");

  // The test server uses a shortened reservation duration.
  await new Promise((resolve) => setTimeout(resolve, 1300));

  const result = await request("/items");
  const updatedItem = result.data.find(
    (current) => current.id === item.id
  );

  assert.equal(updatedItem.status, "available");
  assert.equal(updatedItem.claim, null);
});

test("Seller can override an active reservation after a hallway sale", async () => {
  const item = await createListing({
    title: "Hallway Sale Override Test",
    sellerId: "hallway-seller",
    sellerName: "Hallway Seller",
  });

  const claim = await request(`/items/${item.id}/claim`, "POST", {
    buyerId: "online-buyer",
  });

  assert.equal(claim.status, 200);
  assert.equal(claim.data.item.status, "reserved");

  const unauthorized = await request(`/items/${item.id}/sold`, "PATCH", {
    sellerId: "someone-else",
  });

  assert.equal(unauthorized.status, 403);

  const override = await request(`/items/${item.id}/sold`, "PATCH", {
    sellerId: "hallway-seller",
  });

  assert.equal(override.status, 200);
  assert.equal(override.data.item.status, "sold");
  assert.equal(override.data.item.claim, null);

  const oldBuyer = await request(
    `/items/${item.id}/complete`,
    "POST",
    { buyerId: "online-buyer" }
  );

  assert.equal(oldBuyer.status, 409);
});

test("Only the seller can mark an available listing as sold", async () => {
  const item = await createListing({
    sellerId: "seller-two",
    sellerName: "Seller Two",
  });

  const unauthorized = await request(`/items/${item.id}/sold`, "PATCH", {
    sellerId: "not-the-seller",
  });

  assert.equal(unauthorized.status, 403);

  const successful = await request(`/items/${item.id}/sold`, "PATCH", {
    sellerId: "seller-two",
  });

  assert.equal(successful.status, 200);
  assert.equal(successful.data.item.status, "sold");
});