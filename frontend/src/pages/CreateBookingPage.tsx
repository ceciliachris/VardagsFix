import { useEffect, useState, type FormEvent } from "react";
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

        const foundService = data.find((item: ServiceItem) => item.id === Number(id));

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

  const availableSlots = service?.availableSlots?.filter((slot) => !slot.booked) ?? [];

  return (
    <div style={ui.formWrapper}>
      <form onSubmit={handleSubmit} style={ui.formCard}>
        <h1>Boka tjänst</h1>

        {service && (
          <div style={styles.serviceInfo}>
            <h2 style={styles.serviceTitle}>{service.title}</h2>
            <p style={styles.serviceDescription}>{service.description}</p>
            <p style={styles.servicePrice}>{service.price} kr</p>
          </div>
        )}

        <label style={styles.label}>Välj tillgänglig tid</label>

        {availableSlots.length === 0 && (
          <p style={styles.noSlotsText}>Det finns inga lediga tider för denna tjänst.</p>
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

                  <div>
                    <p style={styles.slotText}>
                      <strong>Start:</strong> {formatDateTime(slot.startTime)}
                    </p>
                    <p style={styles.slotText}>
                      <strong>Slut:</strong> {formatDateTime(slot.endTime)}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <label style={styles.label}>Meddelande till utföraren</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Skriv ett meddelande..."
          style={ui.textarea}
        />

        <div style={ui.buttonRow}>
          <button
            type="submit"
            disabled={bookingLoading || availableSlots.length === 0}
            style={ui.primaryGreenButton}
          >
            {bookingLoading ? "Bokar..." : "Boka"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/services")}
            disabled={bookingLoading}
            style={ui.secondaryButton}
          >
            Avbryt
          </button>
        </div>

        {error && <p style={ui.error}>{error}</p>}
        {success && <p style={ui.success}>{success}</p>}
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    fontWeight: 600,
    color: "#111827",
  },
  serviceInfo: {
    padding: "12px",
    borderRadius: "10px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  serviceTitle: {
    margin: "0 0 8px 0",
  },
  serviceDescription: {
    margin: "0 0 8px 0",
    color: "#4b5563",
  },
  servicePrice: {
    margin: 0,
    fontWeight: 700,
  },
  slotList: {
    display: "grid",
    gap: "10px",
  },
  slotCard: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
  },
  selectedSlotCard: {
    border: "2px solid #2563eb",
    background: "#eff6ff",
  },
  radioInput: {
    marginTop: "4px",
  },
  slotText: {
    margin: "0 0 4px 0",
    color: "#374151",
  },
  noSlotsText: {
    margin: 0,
    color: "#6b7280",
    fontStyle: "italic",
  },
};