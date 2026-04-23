import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBooking } from "../api/bookingApi";
import { getAllServices } from "../api/serviceApi";
import { ui } from "../styles/ui";

type AvailableSlot = {
  id: number;
  startTime: string;
  endTime: string;
  booked: boolean;
};

type ServiceUser = {
  id: number;
  name: string;
  email: string;
};

type ServiceItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  user?: ServiceUser;
  availableSlots?: AvailableSlot[];
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

export default function CreateBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceItem | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [message, setMessage] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await getAllServices();

        if (!Array.isArray(data)) {
          setError("Ogiltigt svar från servern.");
          return;
        }

        const foundService = data.find(
          (item: ServiceItem) => item.id === Number(id)
        );

        if (!foundService) {
          setError("Tjänsten hittades inte.");
          return;
        }

        setService(foundService);
      } catch (err: any) {
        console.error(err);

        let messageText = "Kunde inte hämta tjänsten.";

        if (typeof err?.response?.data === "string") {
          messageText = err.response.data;
        } else if (typeof err?.response?.data?.message === "string") {
          messageText = err.response.data.message;
        } else if (typeof err?.message === "string") {
          messageText = err.message;
        }

        setError(messageText);
      } finally {
        setPageLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!id) {
      setError("Tjänstens id saknas.");
      return;
    }

    if (!selectedSlotId) {
      setError("Du måste välja en tillgänglig tid.");
      return;
    }

    setBookingLoading(true);

    try {
      await createBooking({
        serviceId: Number(id),
        slotId: Number(selectedSlotId),
        message: message.trim(),
      });

      setSuccess("Bokning skapad!");

      setTimeout(() => {
        navigate("/services");
      }, 1000);
    } catch (err: any) {
      console.error(err);

      let messageText = "Kunde inte skapa bokning.";

      if (typeof err?.response?.data === "string") {
        messageText = err.response.data;
      } else if (typeof err?.response?.data?.message === "string") {
        messageText = err.response.data.message;
      } else if (typeof err?.message === "string") {
        messageText = err.message;
      }

      setError(messageText);
    } finally {
      setBookingLoading(false);
    }
  };

  if (pageLoading) {
    return <p style={ui.message}>Laddar tjänst...</p>;
  }

  const availableSlots =
    service?.availableSlots?.filter((slot) => !slot.booked) ?? [];

  return (
    <div style={ui.formWrapper}>
      <div style={styles.heroCard}>
        <div style={styles.heroText}>
          <h1 style={ui.title}>Boka tjänst</h1>
          <p style={styles.heroDescription}>
            Välj en ledig tid, skriv ett meddelande till utföraren och slutför din
            bokning.
          </p>
        </div>

        <div style={styles.heroStats}>
          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{availableSlots.length}</span>
            <span style={styles.heroStatLabel}>Lediga tider</span>
          </div>

          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{service ? 1 : 0}</span>
            <span style={styles.heroStatLabel}>Vald tjänst</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.formWrapper}>
        {service && (
          <section style={styles.serviceCard}>
            <div style={styles.serviceHeader}>
              <div style={styles.serviceTitleBlock}>
                <h2 style={styles.serviceTitle}>{service.title}</h2>
                <p style={styles.serviceDescription}>{service.description}</p>
              </div>

              <span style={styles.priceTag}>{service.price} kr</span>
            </div>

            <div style={styles.divider} />

            {service.user && (
              <div style={styles.metaGrid}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Utförare</span>
                  <span style={styles.metaValue}>{service.user.name}</span>
                </div>

                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>E-post</span>
                  <span style={styles.metaSubtle}>{service.user.email}</span>
                </div>
              </div>
            )}
          </section>
        )}

        <section style={styles.slotSection}>
          <div style={styles.sectionHeader}>
            <h2 style={ui.sectionTitle}>Välj tillgänglig tid</h2>
            <span style={styles.availableBadge}>{availableSlots.length} lediga</span>
          </div>

          {availableSlots.length === 0 && (
            <div style={styles.emptySectionCard}>
              <p style={styles.emptySectionText}>
                Det finns inga lediga tider för denna tjänst.
              </p>
            </div>
          )}

          {availableSlots.length > 0 && (
            <div style={styles.slotList}>
              {availableSlots.map((slot) => {
                const isSelected = selectedSlotId === String(slot.id);

                return (
                  <label
                    key={slot.id}
                    style={{
                      ...styles.slotCard,
                      ...(isSelected ? styles.selectedSlotCard : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="selectedSlot"
                      value={slot.id}
                      checked={selectedSlotId === String(slot.id)}
                      onChange={(e) => setSelectedSlotId(e.target.value)}
                      style={styles.radioInput}
                    />

                    <div style={styles.slotContent}>
                      <div style={styles.slotRow}>
                        <span style={styles.slotLabel}>Start</span>
                        <span style={styles.slotValue}>
                          {formatDateTime(slot.startTime)}
                        </span>
                      </div>

                      <div style={styles.slotRow}>
                        <span style={styles.slotLabel}>Slut</span>
                        <span style={styles.slotValue}>
                          {formatDateTime(slot.endTime)}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </section>

        <section style={styles.messageSection}>
          <label htmlFor="booking-message" style={ui.label}>
            Meddelande till utföraren
          </label>
          <textarea
            id="booking-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Skriv ett meddelande..."
            style={ui.textarea}
          />
        </section>

        {error && <p style={ui.error}>{error}</p>}
        {success && <p style={ui.success}>{success}</p>}

        <div style={styles.actionRow}>
          <button
            type="submit"
            disabled={bookingLoading || availableSlots.length === 0}
            style={{
              ...styles.primaryActionButton,
              ...(bookingLoading || availableSlots.length === 0
                ? ui.disabledButton
                : {}),
            }}
          >
            {bookingLoading ? "Bokar..." : "Boka"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/services")}
            disabled={bookingLoading}
            style={{
              ...styles.secondaryActionButton,
              ...(bookingLoading ? ui.disabledButton : {}),
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
    background: "linear-gradient(135deg, #ecfdf5 0%, #f8fafc 100%)",
    border: "1px solid #bbf7d0",
    borderRadius: "24px",
    padding: "28px",
    display: "grid",
    gap: "24px",
    marginBottom: "16px",
    boxShadow: "0 12px 30px rgba(22, 163, 74, 0.08)",
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
    gap: "16px",
  },
  serviceCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
    display: "grid",
    gap: "16px",
  },
  serviceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  serviceTitleBlock: {
    display: "grid",
    gap: "8px",
    flex: 1,
    minWidth: "240px",
  },
  serviceTitle: {
    margin: 0,
    fontSize: "24px",
    lineHeight: 1.2,
    color: "#0f172a",
    fontWeight: 800,
  },
  serviceDescription: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },
  priceTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: "14px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "18px",
    fontWeight: 800,
  },
  divider: {
    height: "1px",
    background: "#e5e7eb",
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
  metaSubtle: {
    fontSize: "15px",
    color: "#6b7280",
    lineHeight: 1.4,
  },
  slotSection: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
    display: "grid",
    gap: "16px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },
  availableBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: "#dcfce7",
    color: "#166534",
  },
  slotList: {
    display: "grid",
    gap: "12px",
  },
  slotCard: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  selectedSlotCard: {
    border: "2px solid #16a34a",
    background: "#f0fdf4",
    boxShadow: "0 10px 24px rgba(22, 163, 74, 0.10)",
  },
  radioInput: {
    marginTop: "4px",
    flexShrink: 0,
  },
  slotContent: {
    display: "grid",
    gap: "10px",
    width: "100%",
  },
  slotRow: {
    display: "grid",
    gap: "4px",
  },
  slotLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  slotValue: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#111827",
    lineHeight: 1.4,
  },
  emptySectionCard: {
    background: "#ffffff",
    border: "1px dashed #cbd5e1",
    borderRadius: "18px",
    padding: "24px",
  },
  emptySectionText: {
    margin: 0,
    color: "#6b7280",
    lineHeight: 1.6,
  },
  messageSection: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
    display: "grid",
    gap: "12px",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryActionButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    boxShadow: "0 10px 20px rgba(21, 128, 61, 0.18)",
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
};