import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createService } from "../api/serviceApi";
import { ui } from "../styles/ui";

type SlotFormItem = {
  startTime: string;
  endTime: string;
};

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

function buildDateTime(date: string, time: string) {
  if (!date || !time) return "";

  return `${date}T${time}`;
}

function generateTimeOptions() {
  const times: string[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hh = String(hour).padStart(2, "0");
      const mm = String(minute).padStart(2, "0");
      times.push(`${hh}:${mm}`);
    }
  }

  return times;
}

export default function CreateServicePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");

  const [slotStartDate, setSlotStartDate] = useState("");
  const [slotStartTime, setSlotStartTime] = useState("");
  const [slotEndDate, setSlotEndDate] = useState("");
  const [slotEndTime, setSlotEndTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<SlotFormItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const timeOptions = useMemo(() => generateTimeOptions(), []);

  const handleAddSlot = () => {
    setError("");

    if (!slotStartDate) {
      setError("Startdatum för tillgänglig tid måste fyllas i.");
      return;
    }

    if (!slotStartTime) {
      setError("Starttid för tillgänglig tid måste fyllas i.");
      return;
    }

    if (!slotEndDate) {
      setError("Slutdatum för tillgänglig tid måste fyllas i.");
      return;
    }

    if (!slotEndTime) {
      setError("Sluttid för tillgänglig tid måste fyllas i.");
      return;
    }

    const startDateTime = buildDateTime(slotStartDate, slotStartTime);
    const endDateTime = buildDateTime(slotEndDate, slotEndTime);

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

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
        startTime: startDateTime,
        endTime: endDateTime,
      },
    ]);

    setSlotStartDate("");
    setSlotStartTime("");
    setSlotEndDate("");
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
    const trimmedLocation = location.trim();
    const numericPrice = Number(price);

    if (!trimmedTitle) {
      setError("Titel måste fyllas i.");
      return;
    }

    if (!trimmedDescription) {
      setError("Beskrivning måste fyllas i.");
      return;
    }

    if (!trimmedLocation) {
      setError("Plats måste fyllas i.");
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
        location: trimmedLocation,
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
      <div style={styles.heroCard}>
        <div style={styles.heroText}>
          <h1 style={ui.title}>Skapa tjänst</h1>
          <p style={styles.heroDescription}>
            Lägg upp en ny tjänst med tydlig beskrivning, pris och tillgängliga
            tider så att andra enkelt kan boka dig.
          </p>
        </div>

        <div style={styles.heroStats}>
          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{availableSlots.length}</span>
            <span style={styles.heroStatLabel}>Tillagda tider</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.formWrapper}>
        <section style={styles.formSection}>
          <div style={styles.sectionHeader}>
            <h2 style={ui.sectionTitle}>Grundinformation</h2>
            <p style={styles.sectionHelpText}>
              Beskriv tjänsten så tydligt som möjligt för den som vill boka.
            </p>
          </div>

          <div>
            <label htmlFor="title" style={ui.label}>
              Titel
            </label>
            <input
              id="title"
              placeholder="Till exempel: Hundpromenad"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={ui.input}
              required
            />
          </div>

          <div>
            <label htmlFor="description" style={ui.label}>
              Beskrivning
            </label>
            <textarea
              id="description"
              placeholder="Beskriv vad tjänsten innehåller"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={ui.textarea}
              required
            />
          </div>

          <div style={styles.twoColumnGrid}>
            <div>
              <label htmlFor="location" style={ui.label}>
                Plats
              </label>
              <input
                id="location"
                placeholder="Till exempel: Malmö eller Södermalm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={ui.input}
                required
              />
            </div>

            <div>
              <label htmlFor="price" style={ui.label}>
                Pris
              </label>
              <input
                id="price"
                type="number"
                placeholder="Pris i kronor"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={ui.input}
                min="1"
                required
              />
            </div>
          </div>
        </section>

        <section style={styles.slotSection}>
          <div style={styles.slotSectionHeader}>
            <div>
              <h2 style={ui.sectionTitle}>Tillgängliga tider</h2>
              <p style={styles.sectionHelpText}>
                Välj datum och tid i 30-minuterssteg för att göra bokningen tydlig
                och enkel att förstå.
              </p>
            </div>

            <span style={styles.availableBadge}>
              {availableSlots.length === 0
                ? "Inga tider ännu"
                : `${availableSlots.length} tider`}
            </span>
          </div>

          <div style={styles.timeBox}>
            <div style={styles.timeBoxHeader}>
              <h3 style={styles.timeBoxTitle}>Ny tillgänglig tid</h3>
              <p style={styles.timeBoxText}>
                Börja med startdatum och starttid, och välj sedan när tiden ska sluta.
              </p>
            </div>

            <div style={styles.timeGrid}>
              <div>
                <label htmlFor="slotStartDate" style={ui.label}>
                  Startdatum
                </label>
                <input
                  id="slotStartDate"
                  type="date"
                  value={slotStartDate}
                  onChange={(e) => setSlotStartDate(e.target.value)}
                  style={ui.input}
                />
              </div>

              <div>
                <label htmlFor="slotStartTime" style={ui.label}>
                  Starttid
                </label>
                <select
                  id="slotStartTime"
                  value={slotStartTime}
                  onChange={(e) => setSlotStartTime(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Välj starttid</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="slotEndDate" style={ui.label}>
                  Slutdatum
                </label>
                <input
                  id="slotEndDate"
                  type="date"
                  value={slotEndDate}
                  onChange={(e) => setSlotEndDate(e.target.value)}
                  style={ui.input}
                />
              </div>

              <div>
                <label htmlFor="slotEndTime" style={ui.label}>
                  Sluttid
                </label>
                <select
                  id="slotEndTime"
                  value={slotEndTime}
                  onChange={(e) => setSlotEndTime(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Välj sluttid</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.addSlotRow}>
              <button
                type="button"
                onClick={handleAddSlot}
                style={{
                  ...styles.addSlotButton,
                  ...(loading ? ui.disabledButton : {}),
                }}
                disabled={loading}
              >
                Lägg till tid
              </button>
            </div>
          </div>

          {availableSlots.length > 0 && (
            <div style={styles.slotList}>
              {availableSlots.map((slot, index) => (
                <div key={index} style={styles.slotCard}>
                  <div style={styles.slotCardHeader}>
                    <h3 style={styles.slotCardTitle}>Tid {index + 1}</h3>
                    <span style={styles.slotBadge}>Ledig</span>
                  </div>

                  <div style={styles.metaGrid}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Start</span>
                      <span style={styles.metaValue}>
                        {formatDateTime(slot.startTime)}
                      </span>
                    </div>

                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Slut</span>
                      <span style={styles.metaValue}>
                        {formatDateTime(slot.endTime)}
                      </span>
                    </div>
                  </div>

                  <div style={styles.actionRow}>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(index)}
                      style={{
                        ...styles.dangerActionButton,
                        ...(loading ? ui.disabledButton : {}),
                      }}
                      disabled={loading}
                    >
                      Ta bort tid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {error && <p style={ui.error}>{error}</p>}

        <div style={styles.submitRow}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.primaryActionButton,
              ...(loading ? ui.disabledButton : {}),
            }}
          >
            {loading ? "Sparar..." : "Skapa"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/services")}
            disabled={loading}
            style={{
              ...styles.secondaryActionButton,
              ...(loading ? ui.disabledButton : {}),
            }}
          >
            Avbryt
          </button>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  heroCard: {
    background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
    border: "1px solid #dbeafe",
    borderRadius: "24px",
    padding: "28px",
    display: "grid",
    gap: "24px",
    marginBottom: "16px",
    boxShadow: "0 12px 30px rgba(37, 99, 235, 0.08)",
  },
  heroText: {
    display: "grid",
    gap: "10px",
  },
  heroDescription: {
    margin: 0,
    color: "#475569",
    fontSize: "16px",
    lineHeight: 1.6,
    maxWidth: "680px",
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
  },
  heroStatCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
    display: "grid",
    gap: "6px",
    maxWidth: "220px",
  },
  heroStatValue: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#111827",
    lineHeight: 1,
  },
  heroStatLabel: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 600,
  },
  formWrapper: {
    display: "grid",
    gap: "18px",
  },
  formSection: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
    display: "grid",
    gap: "16px",
  },
  sectionHeader: {
    display: "grid",
    gap: "6px",
  },
  sectionHelpText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.5,
    fontSize: "14px",
    maxWidth: "560px",
  },
  slotSection: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
    display: "grid",
    gap: "16px",
    marginBottom: "6px",
  },
  slotSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  availableBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    background: "#f1f5f9",
    color: "#475569",
  },
  timeBox: {
    border: "1px solid #dbeafe",
    background: "#f8fbff",
    borderRadius: "18px",
    padding: "18px",
    display: "grid",
    gap: "16px",
  },
  timeBoxHeader: {
    display: "grid",
    gap: "4px",
  },
  timeBoxTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },
  timeBoxText: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  timeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  select: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
    color: "#111827",
    background: "#ffffff",
    boxSizing: "border-box",
  },
  addSlotRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  addSlotButton: {
    padding: "10px 16px",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#1d4ed8",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  slotList: {
    display: "grid",
    gap: "12px",
  },
  slotCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "18px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.04)",
    display: "grid",
    gap: "14px",
  },
  slotCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },
  slotCardTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
    fontWeight: 700,
  },
  slotBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: "#dcfce7",
    color: "#166534",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },
  metaItem: {
    display: "grid",
    gap: "4px",
  },
  metaLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  metaValue: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#111827",
    lineHeight: 1.4,
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  submitRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "6px",
  },
  primaryActionButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
    flex: 1,
  },
  secondaryActionButton: {
    padding: "12px 18px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    flex: 1,
  },
  dangerActionButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    boxShadow: "0 10px 20px rgba(220, 38, 38, 0.18)",
  },
};