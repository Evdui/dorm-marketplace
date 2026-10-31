
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const API = "http://localhost:5000/api";

let itemId;

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

before(async () => {
  const health = await request("/health");

  assert.equal(
    health.status,
    200,
    "Backend must be running before tests"
  );

  const result = await request("/items", "POST", {
    title: "Automated Test Book",
    description: "Created for API testing",
    category: "Books",
    price: 100,
    sellerId: "test-seller",
    sellerName: "Test Seller",
  });

  assert.equal(result.status, 201);
  itemId = result.data.item.id;
});

test("GET /items returns marketplace listings", async () => {
  const result = await request("/items");

  assert.equal(result.status, 200);
  assert.ok(Array.isArray(result.data));
  assert.ok(result.data.some((item) => item.id === itemId));
});

test("Invalid listing is rejected", async () => {
  const result = await request("/items", "POST", {
    title: "",
    price: -10,
  });

  assert.equal(result.status, 400);
});

test("A student can successfully claim an available item", async () => {
  const result = await request(`/items/${itemId}/claim`, "POST", {
    buyerId: "test-buyer",
  });

  assert.equal(result.status, 200);
  assert.equal(result.data.item.status, "reserved");
  assert.equal(result.data.item.claim.buyerId, "test-buyer");
});

test("A second student cannot claim a reserved item", async () => {
  const result = await request(`/items/${itemId}/claim`, "POST", {
    buyerId: "another-buyer",
  });

  assert.equal(result.status, 409);
});

test("Only the claiming buyer can confirm pickup", async () => {
  const unauthorized = await request(
    `/items/${itemId}/complete`,
    "POST",
    { buyerId: "another-buyer" }
  );

  assert.equal(unauthorized.status, 409);

  const successful = await request(
    `/items/${itemId}/complete`,
    "POST",
    { buyerId: "test-buyer" }
  );

  assert.equal(successful.status, 200);
  assert.equal(successful.data.item.status, "sold");
});

test("Only the seller can mark a listing as sold", async () => {
  const listing = await request("/items", "POST", {
    title: "Seller Override Test",
    description: "Testing seller permissions",
    category: "Other",
    price: 50,
    sellerId: "seller-two",
    sellerName: "Seller Two",
  });

  const id = listing.data.item.id;

  const unauthorized = await request(`/items/${id}/sold`, "PATCH", {
    sellerId: "not-the-seller",
  });

  assert.equal(unauthorized.status, 403);

  const successful = await request(`/items/${id}/sold`, "PATCH", {
    sellerId: "seller-two",
  });

  assert.equal(successful.status, 200);
  assert.equal(successful.data.item.status, "sold");
});
