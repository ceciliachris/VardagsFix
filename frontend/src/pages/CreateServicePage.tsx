import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createService } from "../api/serviceApi";
import { ui } from "../styles/ui";

type SlotFormItem = {
  startTime: string;
  endTime: string;
};

export default function CreateServicePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [slotStartTime, setSlotStartTime] = useState("");
  const [slotEndTime, setSlotEndTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<SlotFormItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddSlot = () => {
    setError("");

    if (!slotStartTime) {
      setError("Starttid för tillgänglig tid måste fyllas i.");
      return;
    }

    if (!slotEndTime) {
      setError("Sluttid för tillgänglig tid måste fyllas i.");
      return;
    }

    const startDate = new Date(slotStartTime);
    const endDate = new Date(slotEndTime);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setError("Ogiltigt datum eller tid för tillgänglig tid.");
      return;
    }

    if (endDate <= startDate) {
      setError("Sluttid för tillgänglig tid måste vara efter starttid.");
      return;
    }

    setAvailableSlots((prev) => [
      ...prev,
      {
        startTime: slotStartTime,
        endTime: slotEndTime,
      },
    ]);

    setSlotStartTime("");
    setSlotEndTime("");
  };

  const handleRemoveSlot = (indexToRemove: number) => {
    setAvailableSlots((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const numericPrice = Number(price);

    if (!trimmedTitle) {
      setError("Titel måste fyllas i.");
      return;
    }

    if (!trimmedDescription) {
      setError("Beskrivning måste fyllas i.");
      return;
    }

    if (Number.isNaN(numericPrice)) {
      setError("Pris måste vara ett giltigt nummer.");
      return;
    }

    if (numericPrice <= 0) {
      setError("Pris måste vara större än 0.");
      return;
    }

    if (availableSlots.length === 0) {
      setError("Du måste lägga till minst en tillgänglig tid.");
      return;
    }

    setLoading(true);

    try {
      await createService({
        title: trimmedTitle,
        description: trimmedDescription,
        price: numericPrice,
        availableSlots,
      });

      navigate("/services");
    } catch (err: any) {
      console.error(err);

      let message = "Kunde inte skapa tjänst.";

      if (typeof err?.response?.data === "string") {
        message = err.response.data;
      } else if (typeof err?.response?.data?.message === "string") {
        message = err.response.data.message;
      } else if (typeof err?.message === "string") {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={ui.formWrapper}>
      <form onSubmit={handleSubmit} style={ui.formCard}>
        <h1>Skapa tjänst</h1>

        <input
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={ui.input}
          required
        />

        <textarea
          placeholder="Beskrivning"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={ui.textarea}
          required
        />

        <input
          type="number"
          placeholder="Pris"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={ui.input}
          min="1"
          required
        />

        <div style={styles.slotSection}>
          <h2 style={styles.sectionTitle}>Tillgängliga tider</h2>

          <label style={styles.label}>Starttid</label>
          <input
            type="datetime-local"
            value={slotStartTime}
            onChange={(e) => setSlotStartTime(e.target.value)}
            style={ui.input}
          />

          <label style={styles.label}>Sluttid</label>
          <input
            type="datetime-local"
            value={slotEndTime}
            onChange={(e) => setSlotEndTime(e.target.value)}
            style={ui.input}
          />

          <button
            type="button"
            onClick={handleAddSlot}
            style={styles.addSlotButton}
          >
            Lägg till tid
          </button>

          {availableSlots.length > 0 && (
            <div style={styles.slotList}>
              {availableSlots.map((slot, index) => (
                <div key={index} style={styles.slotCard}>
                  <p style={styles.slotText}>
                    <strong>Start:</strong> {slot.startTime}
                  </p>
                  <p style={styles.slotText}>
                    <strong>Slut:</strong> {slot.endTime}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(index)}
                    style={styles.removeSlotButton}
                  >
                    Ta bort tid
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={ui.buttonRow}>
          <button type="submit" disabled={loading} style={ui.primaryBlueButton}>
            {loading ? "Sparar..." : "Skapa"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/services")}
            disabled={loading}
            style={ui.secondaryButton}
          >
            Avbryt
          </button>
        </div>

        {error && <p style={ui.error}>{error}</p>}
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  slotSection: {
    marginTop: "8px",
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    background: "#f9fafb",
  },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: "18px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: 600,
    color: "#111827",
  },
  addSlotButton: {
    marginTop: "12px",
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
  },
  slotList: {
    display: "grid",
    gap: "12px",
    marginTop: "16px",
  },
  slotCard: {
    padding: "12px",
    borderRadius: "10px",
    background: "#ffffff",
    border: "1px solid #d1d5db",
  },
  slotText: {
    margin: "0 0 8px 0",
    color: "#374151",
  },
  removeSlotButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    background: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
  },
};