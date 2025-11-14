import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "https://grocery-tracker-m29a.onrender.com/api";

function App() {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [note, setNote] = useState("");
  const [autoSaveMessage, setAutoSaveMessage] = useState("");
  let typingTimer = null;

  // Load items
  const fetchItems = async () => {
    const res = await fetch(`${API_BASE}/items`);
    const data = await res.json();
    setItems(data);
    setLoadingItems(false);
  };

  // Toggle item
  const toggleItem = async (id) => {
    await fetch(`${API_BASE}/items/${id}/toggle`, { method: "PATCH" });
    fetchItems();
  };

  // Load note
  const fetchNote = async () => {
    const res = await fetch(`${API_BASE}/note`);
    const data = await res.json();
    setNote(data.text || "");
  };

  // Auto save note
  const saveNoteAuto = async (text) => {
    await fetch(`${API_BASE}/note`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    setAutoSaveMessage("Saved ✓");
    setTimeout(() => setAutoSaveMessage(""), 1500);
  };

  // When user types → update text & trigger autosave
  const handleNoteChange = (text) => {
    setNote(text);
    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
      saveNoteAuto(text);
    }, 500);
  };

  useEffect(() => {
    fetchItems();
    fetchNote();

    // Auto-sync items every 3 seconds across phones
    const interval = setInterval(fetchItems, 3000);
    return () => clearInterval(interval);
  }, []);

  const inStock = items.filter((i) => i.inStock);
  const toBuy = items.filter((i) => !i.inStock);

  return (
    <div className="app">
      <h1 className="app-title">Grocery Tracker</h1>

      {loadingItems && <p className="loading">Loading...</p>}

      {!loadingItems && (
        <>
          <ListSection
            title="To Buy"
            color="#d1fae5"
            items={inStock}
            direction="right"
            onMove={toggleItem}
          />

          <ListSection
            title="In stock"
            color="#fecaca"
            items={toBuy}
            direction="left"
            onMove={toggleItem}
          />

          <OthersSection
            note={note}
            onChange={handleNoteChange}
            autoSaveMessage={autoSaveMessage}
          />
        </>
      )}
    </div>
  );
}

function ListSection({ title, color, items, direction, onMove }) {
  return (
    <div className="section">
      <h2 className="section-title" style={{ background: color }}>
        {title}
      </h2>

      {items.length === 0 && <p className="empty">No items here.</p>}

      {items.map((item, index) => (
        <div key={item.id} className="row">
          <div className="number">{index + 1}</div>
          <div className="item-name">{item.name}</div>

          <button
            className={`move-btn ${direction}`}
            onClick={() => onMove(item.id)}
          >
            {direction === "right" ? "→" : "←"}
          </button>
        </div>
      ))}
    </div>
  );
}

function OthersSection({ note, onChange, autoSaveMessage }) {
  return (
    <div className="others-card">
      <h2 className="others-title">Others</h2>
      <p className="others-subtext">Shared note. Auto-saves everywhere.</p>

      <textarea
        className="others-textarea"
        rows={4}
        value={note}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write something..."
      />

      {autoSaveMessage && <p className="autosave-status">{autoSaveMessage}</p>}
    </div>
  );
}

export default App;
