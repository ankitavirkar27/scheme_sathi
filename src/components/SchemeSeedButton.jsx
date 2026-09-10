import { useState } from "react";
import { seedSchemes } from "../firebase/seedSchemes";

function SchemeSeedButton() {
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);
  const [error, setError] = useState("");

  const handleSeed = async () => {
    setSeeding(true);
    setError("");

    try {
      const result = await seedSchemes();
      setSeedDone(true);
      console.log("✅ Schemes seeded successfully!");
      // Reload the page to show new schemes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to seed schemes");
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  if (seedDone) {
    return (
      <div style={{
        padding: "15px",
        backgroundColor: "#dcfce7",
        borderRadius: "8px",
        margin: "15px 0",
        color: "#166534"
      }}>
        ✅ <strong>Success!</strong> 8 example schemes have been added. The page will reload now...
      </div>
    );
  }

  return (
    <div style={{
      padding: "15px",
      backgroundColor: "#fef3c7",
      borderRadius: "8px",
      margin: "15px 0",
      border: "1px solid #fcd34d"
    }}>
      <p style={{ margin: "0 0 10px 0", color: "#92400e" }}>
        <strong>📚 No example schemes found!</strong> Click the button below to add 8 example government schemes to get started.
      </p>
      <button
        onClick={handleSeed}
        disabled={seeding}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: seeding ? "not-allowed" : "pointer",
          opacity: seeding ? 0.7 : 1,
          fontSize: "14px",
          fontWeight: "500"
        }}
      >
        {seeding ? "🔄 Adding Schemes..." : "📥 Add Example Schemes"}
      </button>
      {error && (
        <p style={{ color: "#991b1b", marginTop: "10px", fontSize: "14px" }}>
          ❌ {error}
        </p>
      )}
    </div>
  );
}

export default SchemeSeedButton;
