
import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

const students = [
  { id: "student-1", name: "Rahul" },
  { id: "student-2", name: "Priya" },
  { id: "student-3", name: "Arjun" },
  { id: "student-4", name: "Chiranthan" },
];

const categories = [
  "All",
  "Books",
  "Electronics",
  "Furniture",
  "Stationery",
  "Other",
];

const emptyForm = {
  title: "",
  description: "",
  category: "Books",
  price: "0",
};

function formatTime(expiresAt) {
  if (!expiresAt) return "";

  const seconds = Math.max(
    0,
    Math.ceil((expiresAt - Date.now()) / 1000)
  );

  return `${seconds}s remaining`;
}

function App() {
  const [items, setItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(students[3]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`${API}/items`);
      if (!response.ok) throw new Error("Could not load listings.");

      const data = await response.json();
      setItems(data);
      setError("");
    } catch {
      setError("Unable to connect to the marketplace server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();

    const refresh = setInterval(fetchItems, 2000);
    const clock = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      clearInterval(refresh);
      clearInterval(clock);
    };
  }, [fetchItems]);

  async function apiRequest(path, method, body) {
    try {
      const response = await fetch(`${API}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setMessage(data.message);
      setError("");
      await fetchItems();
      return true;
    } catch (err) {
      setError(err.message);
      setMessage("");
      await fetchItems();
      return false;
    }
  }

  async function createListing(e) {
    e.preventDefault();

    const success = await apiRequest("/items", "POST", {
      ...form,
      price: Number(form.price),
      sellerId: currentUser.id,
      sellerName: currentUser.name,
    });

    if (success) {
      setForm(emptyForm);
      setShowForm(false);
    }
  }

  function claimItem(id) {
    apiRequest(`/items/${id}/claim`, "POST", {
      buyerId: currentUser.id,
    });
  }

  function completePickup(id) {
    apiRequest(`/items/${id}/complete`, "POST", {
      buyerId: currentUser.id,
    });
  }

  function markSold(id) {
    if (
      window.confirm("Are you sure you want to mark this item as sold?")
    ) {
      apiRequest(`/items/${id}/sold`, "PATCH", {
        sellerId: currentUser.id,
      });
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      category === "All" || item.category === category;

    const query = search.toLowerCase();

    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const availableCount = items.filter(
    (item) => item.status === "available"
  ).length;

  const reservedCount = items.filter(
    (item) => item.status === "reserved"
  ).length;

  const myListings = items.filter(
    (item) => item.sellerId === currentUser.id
  ).length;

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#">
          <span className="brand-icon">D</span>
          <span>Dorm<span className="brand-light">Market</span></span>
        </a>

        <div className="nav-right">
          <span className="campus-label">CAMPUS MARKETPLACE</span>
          <select
            value={currentUser.id}
            onChange={(e) =>
              setCurrentUser(
                students.find((s) => s.id === e.target.value)
              )
            }
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <div className="eyebrow">
              <span className="live-dot" /> YOUR CAMPUS, YOUR MARKETPLACE
            </div>

            <h1>
              Give your stuff
              <br />
              <span>a second life.</span>
            </h1>

            <p>
              Buy, sell, and exchange essentials with students
              around your campus. Simple, local, and hassle-free.
            </p>

            <button
              className="primary-btn"
              onClick={() => setShowForm(!showForm)}
            >
              + List an item
            </button>
          </div>

          <div className="hero-art">
            <div className="art-circle">
              <span className="art-emoji">📦</span>
              <span className="floating one">📚</span>
              <span className="floating two">💡</span>
              <span className="floating three">🎧</span>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span className="stat-icon">🛍️</span>
            <div>
              <strong>{items.length}</strong>
              <span>Total listings</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🟢</span>
            <div>
              <strong>{availableCount}</strong>
              <span>Available</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🔒</span>
            <div>
              <strong>{reservedCount}</strong>
              <span>Reserved</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">👤</span>
            <div>
              <strong>{myListings}</strong>
              <span>My listings</span>
            </div>
          </div>
        </section>

        {message && (
          <div className="notice success-notice">
            ✓ {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {error && (
          <div className="notice error-notice">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {showForm && (
          <section className="form-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">SELL SOMETHING</span>
                <h2>Create a listing</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={createListing} className="listing-form">
              <label>
                Item name
                <input
                  required
                  maxLength={80}
                  placeholder="e.g. Engineering Mathematics textbook"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  required
                  maxLength={500}
                  placeholder="Describe the condition and details..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>

              <div className="form-row">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {categories.filter((c) => c !== "All").map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Price (₹)
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </label>
              </div>

              <button className="primary-btn" type="submit">
                Publish listing
              </button>
            </form>
          </section>
        )}

        <section className="marketplace">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND YOUR NEXT FAVORITE</span>
              <h2>Explore listings</h2>
            </div>
            <span className="listing-count">
              {filteredItems.length} items found
            </span>
          </div>

          <div className="toolbar">
            <input
              className="search-input"
              placeholder="⌕  Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="category-list">
              {categories.map((c) => (
                <button
                  key={c}
                  className={category === c ? "category active" : "category"}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading marketplace...</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <span>📦</span>
              <h3>No items found</h3>
              <p>Try another search or create a new listing.</p>
            </div>
          ) : (
            <div className="item-grid">
              {filteredItems.map((item) => {
                const isSeller = item.sellerId === currentUser.id;
                const isBuyer =
                  item.claim?.buyerId === currentUser.id;

                const icons = {
                  Books: "📚",
                  Electronics: "💻",
                  Furniture: "🪑",
                  Stationery: "✏️",
                  Other: "📦",
                };

                return (
                  <article className="item-card" key={item.id}>
                    <div className="item-image">
                      <span>{icons[item.category] || "📦"}</span>
                      <span className={`status ${item.status}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="item-content">
                      <span className="item-category">
                        {item.category}
                      </span>

                      <h3>{item.title}</h3>
                      <p className="item-description">
                        {item.description}
                      </p>

                      <div className="seller-info">
                        <span className="seller-avatar">
                          {item.sellerName.charAt(0)}
                        </span>
                        <span>Listed by {item.sellerName}</span>
                      </div>

                      <div className="item-footer">
                        <strong className="price">
                          {item.price === 0 ? "FREE" : `₹${item.price}`}
                        </strong>

                        {item.status === "available" && !isSeller && (
                          <button
                            className="action-btn"
                            onClick={() => claimItem(item.id)}
                          >
                            Claim item
                          </button>
                        )}

                        {item.status === "reserved" && isBuyer && (
                          <div className="buyer-actions">
                            <span className="timer">
                              {formatTime(item.claim?.expiresAt)}
                            </span>
                            <button
                              className="action-btn"
                              onClick={() => completePickup(item.id)}
                            >
                              Confirm pickup
                            </button>
                          </div>
                        )}

                        {item.status === "reserved" &&
                          !isBuyer &&
                          !isSeller && (
                            <span className="locked-label">
                              Already reserved
                            </span>
                          )}

                        {isSeller &&
                          item.status !== "sold" && (
                            <button
                              className="sold-btn"
                              onClick={() => markSold(item.id)}
                            >
                              Mark sold
                            </button>
                          )}

                        {item.status === "sold" && (
                          <span className="sold-label">Sold</span>
                        )}

                        {item.status === "reserved" && isSeller && (
                          <span className="seller-reserved">
                            Reserved · {formatTime(item.claim?.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer>
          <strong>DormMarket.</strong>
          <span>Made for campus life. ♡</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
