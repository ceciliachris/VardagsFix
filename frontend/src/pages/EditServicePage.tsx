import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllServices, updateService } from "../api/serviceApi";
import { ui } from "../styles/ui";

type AvailableSlot = {
  id?: number;
  startTime: string;
  endTime: string;
  booked: boolean;
};

type ServiceItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  availableSlots?: AvailableSlot[];
};

type SlotFormItem = {
  startTime: string;
  endTime: string;
  booked?: boolean;
};

function formatDateTimeForInput(dateTime: string) {
  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateTime(dateTime: string) {
  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return dateTime;
  }

  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function EditServicePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [slotStartTime, setSlotStartTime] = useState("");
  const [slotEndTime, setSlotEndTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<SlotFormItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const services = await getAllServices();
        const service = (services as ServiceItem[]).find((s) => s.id === Number(id));

        if (!service) {
          setError("Tjänsten hittades inte.");
          return;
        }

        setTitle(service.title);
        setDescription(service.description);
        setPrice(service.price.toString());

        const mappedSlots =
          service.availableSlots?.map((slot) => ({
            startTime: formatDateTimeForInput(slot.startTime),
            endTime: formatDateTimeForInput(slot.endTime),
            booked: slot.booked,
          })) ?? [];

        setAvailableSlots(mappedSlots);
      } catch (err: any) {
        console.error(err);

        let message = "Kunde inte hämta tjänsten.";

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

    fetchService();
  }, [id]);

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
        booked: false,
      },
    ]);

    setSlotStartTime("");
    setSlotEndTime("");
  };

  const handleRemoveSlot = (indexToRemove: number) => {
    const slot = availableSlots[indexToRemove];

    if (slot.booked) {
      setError("Du kan inte ta bort en tid som redan är bokad.");
      return;
    }

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
      setError("Du måste ha minst en tillgänglig tid.");
      return;
    }

    const bookedSlots = availableSlots.filter((slot) => slot.booked);
    const unbookedSlots = availableSlots.filter((slot) => !slot.booked);

    for (const slot of unbookedSlots) {
      const startDate = new Date(slot.startTime);
      const endDate = new Date(slot.endTime);

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        setError("En tillgänglig tid har ogiltigt datum eller tid.");
        return;
      }

      if (endDate <= startDate) {
        setError("Alla tillgängliga tider måste ha sluttid efter starttid.");
        return;
      }
    }

    setSaving(true);

    try {
      await updateService(Number(id), {
        title: trimmedTitle,
        description: trimmedDescription,
        price: numericPrice,
        availableSlots: [
          ...bookedSlots.map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
          ...unbookedSlots.map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        ],
      });

      navigate("/services/my");
    } catch (err: any) {
      console.error(err);

      let message = "Kunde inte uppdatera tjänsten.";

      if (typeof err?.response?.data === "string") {
        message = err.response.data;
      } else if (typeof err?.response?.data?.message === "string") {
        message = err.response.data.message;
      } else if (typeof err?.message === "string") {
        message = err.message;
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={ui.message}>Laddar...</p>;
  }

  return (
    <div style={ui.formWrapper}>
      <form onSubmit={handleSubmit} style={ui.formCard}>
        <h1>Redigera tjänst</h1>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={ui.input}
          placeholder="Titel"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={ui.textarea}
          placeholder="Beskrivning"
          required
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={ui.input}
          placeholder="Pris"
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
                    <strong>Start:</strong> {formatDateTime(slot.startTime)}
                  </p>
                  <p style={styles.slotText}>
                    <strong>Slut:</strong> {formatDateTime(slot.endTime)}
                  </p>

                  {slot.booked && (
                    <p style={styles.bookedText}>Denna tid är redan bokad.</p>
                  )}

                  {!slot.booked && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(index)}
                      style={styles.removeSlotButton}
                    >
                      Ta bort tid
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={ui.buttonRow}>
          <button type="submit" disabled={saving} style={ui.primaryBlueButton}>
            {saving ? "Sparar..." : "Spara"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/services/my")}
            disabled={saving}
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
  bookedText: {
    margin: "0 0 8px 0",
    color: "#b45309",
    fontWeight: 600,
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