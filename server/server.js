
const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initial marketplace listings
const items = [
  {
    id: randomUUID(),
    title: "Introduction to Algorithms",
    description: "Used textbook in good condition.",
    category: "Books",
    price: 350,
    sellerId: "student-1",
    sellerName: "Rahul",
    status: "available",
    claim: null,
  },
  {
    id: randomUUID(),
    title: "Study Table Lamp",
    description: "LED lamp, barely used.",
    category: "Electronics",
    price: 200,
    sellerId: "student-2",
    sellerName: "Priya",
    status: "available",
    claim: null,
  },
  {
    id: randomUUID(),
    title: "Scientific Calculator",
    description: "Casio calculator in excellent condition.",
    category: "Stationery",
    price: 0,
    sellerId: "student-3",
    sellerName: "Arjun",
    status: "available",
    claim: null,
  },
];

const CLAIM_DURATION = 60 * 1000;

// Release expired reservations
function expireClaims() {
  const now = Date.now();

  for (const item of items) {
    if (
      item.status === "reserved" &&
      item.claim &&
      now >= item.claim.expiresAt
    ) {
      item.status = "available";
      item.claim = null;
    }
  }
}

const expirationInterval = setInterval(expireClaims, 1000);
expirationInterval.unref();

// Get all listings
app.get("/api/items", (req, res) => {
  expireClaims();
  res.json(items);
});

// Create listing
app.post("/api/items", (req, res) => {
  const {
    title,
    description,
    category,
    price,
    sellerId,
    sellerName,
  } = req.body;

  if (
    !title?.trim() ||
    !description?.trim() ||
    !category?.trim() ||
    !sellerId?.trim() ||
    !sellerName?.trim()
  ) {
    return res.status(400).json({
      message: "Please provide all required listing details.",
    });
  }

  if (
    price === undefined ||
    price === null ||
    price === "" ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    return res.status(400).json({
      message: "Please enter a valid price.",
    });
  }

  const item = {
    id: randomUUID(),
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    price: Number(price),
    sellerId: sellerId.trim(),
    sellerName: sellerName.trim(),
    status: "available",
    claim: null,
  };

  items.unshift(item);

  res.status(201).json({
    message: "Listing created successfully.",
    item,
  });
});

// Claim an item
app.post("/api/items/:id/claim", (req, res) => {
  expireClaims();

  const { buyerId } = req.body;

  if (!buyerId?.trim()) {
    return res.status(400).json({
      message: "Buyer ID is required.",
    });
  }

  const item = items.find((i) => i.id === req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Item not found.",
    });
  }

  if (item.sellerId === buyerId.trim()) {
    return res.status(403).json({
      message: "You cannot claim your own listing.",
    });
  }

  if (item.status !== "available") {
    return res.status(409).json({
      message: "This item is no longer available.",
    });
  }

  // Reserve immediately before processing another request.
  const now = Date.now();

  item.status = "reserved";
  item.claim = {
    buyerId: buyerId.trim(),
    claimedAt: now,
    expiresAt: now + CLAIM_DURATION,
  };

  res.json({
    message: "Item reserved successfully.",
    item,
  });
});

// Confirm pickup
app.post("/api/items/:id/complete", (req, res) => {
  expireClaims();

  const { buyerId } = req.body;

  const item = items.find((i) => i.id === req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Item not found.",
    });
  }

  if (
    item.status !== "reserved" ||
    !item.claim ||
    item.claim.buyerId !== buyerId
  ) {
    return res.status(409).json({
      message: "No active claim found for this buyer.",
    });
  }

  item.status = "sold";
  item.claim = null;

  res.json({
    message: "Pickup confirmed. Item sold.",
    item,
  });
});

// Seller marks item as sold
app.patch("/api/items/:id/sold", (req, res) => {
  expireClaims();

  const { sellerId } = req.body;

  const item = items.find((i) => i.id === req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Item not found.",
    });
  }

  if (item.sellerId !== sellerId) {
    return res.status(403).json({
      message: "Only the seller can mark this item as sold.",
    });
  }

  item.status = "sold";
  item.claim = null;

  res.json({
    message: "Listing marked as sold.",
    item,
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Dorm Marketplace API is running.",
  });
});

app.listen(PORT, () => {
  console.log(
    `Dorm Marketplace API running at http://localhost:${PORT}`
  );
});
