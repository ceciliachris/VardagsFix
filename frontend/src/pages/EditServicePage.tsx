import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
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
  location: string;
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

  return `${year}-${month}-${day}`;
}

function formatTimeForInput(dateTime: string) {
  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
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

export default function EditServicePage() {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const timeOptions = useMemo(() => generateTimeOptions(), []);

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
        setLocation(service.location ?? "");

        const mappedSlots =
          service.availableSlots?.map((slot) => ({
            startTime: buildDateTime(
              formatDateTimeForInput(slot.startTime),
              formatTimeForInput(slot.startTime)
            ),
            endTime: buildDateTime(
              formatDateTimeForInput(slot.endTime),
              formatTimeForInput(slot.endTime)
            ),
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
        booked: false,
      },
    ]);

    setSlotStartDate("");
    setSlotStartTime("");
    setSlotEndDate("");
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
        location: trimmedLocation,
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
    return <p style={ui.message}>Laddar tjänsten...</p>;
  }

  return (
    <div style={ui.formWrapper}>
      <div style={styles.heroCard}>
        <div style={styles.heroText}>
          <h1 style={ui.title}>Redigera tjänst</h1>
          <p style={styles.heroDescription}>
            Uppdatera informationen om tjänsten och justera dina tillgängliga tider.
          </p>
        </div>

        <div style={styles.heroStats}>
          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{availableSlots.length}</span>
            <span style={styles.heroStatLabel}>Totala tider</span>
          </div>

          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>
              {availableSlots.filter((slot) => slot.booked).length}
            </span>
            <span style={styles.heroStatLabel}>Bokade tider</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.formWrapper}>
        <section style={styles.formSection}>
          <div style={styles.sectionHeader}>
            <h2 style={ui.sectionTitle}>Grundinformation</h2>
            <p style={styles.sectionHelpText}>
              Redigera titel, beskrivning, plats och pris för tjänsten.
            </p>
          </div>

          <div>
            <label htmlFor="title" style={ui.label}>
              Titel
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={ui.input}
              placeholder="Till exempel: Hundpromenad"
              required
            />
          </div>

          <div>
            <label htmlFor="description" style={ui.label}>
              Beskrivning
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={ui.textarea}
              placeholder="Beskriv vad tjänsten innehåller"
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={ui.input}
                placeholder="Till exempel: Malmö eller Södermalm"
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={ui.input}
                placeholder="Pris i kronor"
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
                Välj datum och tid i 30-minuterssteg. Bokade tider kan visas men
                inte tas bort.
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
                Välj start och slut med separata fält för datum och tid.
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
                  ...(saving ? ui.disabledButton : {}),
                }}
                disabled={saving}
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
                    {slot.booked ? (
                      <span style={styles.bookedBadge}>Bokad</span>
                    ) : (
                      <span style={styles.slotBadge}>Ledig</span>
                    )}
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

                  {slot.booked ? (
                    <p style={styles.bookedText}>
                      Denna tid är redan bokad och kan därför inte tas bort.
                    </p>
                  ) : (
                    <div style={styles.actionRow}>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(index)}
                        style={{
                          ...styles.dangerActionButton,
                          ...(saving ? ui.disabledButton : {}),
                        }}
                        disabled={saving}
                      >
                        Ta bort tid
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {error && <p style={ui.error}>{error}</p>}

        <div style={styles.submitRow}>
          <button
            type="submit"
            disabled={saving}
            style={{
              ...styles.primaryActionButton,
              ...(saving ? ui.disabledButton : {}),
            }}
          >
            {saving ? "Sparar..." : "Spara"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/services/my")}
            disabled={saving}
            style={{
              ...styles.secondaryActionButton,
              ...(saving ? ui.disabledButton : {}),
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
    background: "linear-gradient(135deg, #fff7ed 0%, #f8fafc 100%)",
    border: "1px solid #fed7aa",
    borderRadius: "24px",
    padding: "28px",
    display: "grid",
    gap: "24px",
    marginBottom: "16px",
    boxShadow: "0 12px 30px rgba(234, 88, 12, 0.08)",
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
    border: "1px solid #fed7aa",
    background: "#fffaf5",
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
    border: "1px solid #fed7aa",
    borderRadius: "10px",
    background: "#fff7ed",
    color: "#c2410c",
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
  bookedBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: "#fef3c7",
    color: "#92400e",
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
  bookedText: {
    margin: 0,
    color: "#92400e",
    fontWeight: 600,
    lineHeight: 1.5,
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