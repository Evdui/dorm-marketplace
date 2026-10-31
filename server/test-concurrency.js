
async function testConcurrentClaims() {
  const API = "http://localhost:5000/api";

  // Find an available item
  const itemsResponse = await fetch(`${API}/items`);
  const items = await itemsResponse.json();

  const item = items.find(
    (item) => item.status === "available"
  );

  if (!item) {
    console.log("No available items to test.");
    return;
  }

  console.log("Testing item:", item.title);
  console.log("Item ID:", item.id);
  console.log("\nSending two simultaneous claims...\n");

  // Send both requests at the same time
  const buyers = ["student-test-A", "student-test-B"];

  const results = await Promise.all(
    buyers.map(async (buyerId) => {
      const response = await fetch(
        `${API}/items/${item.id}/claim`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ buyerId }),
        }
      );

      const data = await response.json();

      return {
        buyer: buyerId,
        status: response.status,
        message: data.message,
      };
    })
  );

  console.log("Results:");

  results.forEach((result) => {
    console.log(
      `${result.buyer}: HTTP ${result.status} - ${result.message}`
    );
  });

  // Verify final item state
  const finalItems = await fetch(`${API}/items`).then(
    (response) => response.json()
  );

  const finalItem = finalItems.find(
    (currentItem) => currentItem.id === item.id
  );

  const winner = finalItem.claim?.buyerId;

  console.log("\nFinal reservation owner:", winner);
  console.log("Final item status:", finalItem.status);

  const successCount = results.filter(
    (result) => result.status === 200
  ).length;

  const conflictCount = results.filter(
    (result) => result.status === 409
  ).length;

  if (
    successCount === 1 &&
    conflictCount === 1 &&
    finalItem.status === "reserved" &&
    buyers.includes(winner)
  ) {
    console.log("\nPASS: Only one student successfully claimed the item.");
  } else {
    console.log("\nFAIL: Unexpected concurrency result.");
    process.exitCode = 1;
  }
}

testConcurrentClaims().catch((error) => {
  console.error("Test failed:", error);
  process.exitCode = 1;
});
