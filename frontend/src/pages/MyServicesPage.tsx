import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { getMyServices, deleteService } from "../api/serviceApi";
import { ui } from "../styles/ui";

type AvailableSlot = {
  id: number;
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

export default function MyServicesPage() {
  const navigate = useNavigate();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getMyServices();

        if (Array.isArray(data)) {
          setServices(data);
        } else {
          setError("Ogiltigt svar från servern.");
        }
      } catch (err: any) {
        console.error(err);

        let message = "Kunde inte hämta dina tjänster.";

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

    fetchServices();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Är du säker på att du vill ta bort tjänsten?");
    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error(err);

      let message = "Kunde inte ta bort tjänsten.";

      if (typeof err?.response?.data === "string") {
        message = err.response.data;
      } else if (typeof err?.response?.data?.message === "string") {
        message = err.response.data.message;
      } else if (typeof err?.message === "string") {
        message = err.message;
      }

      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p style={ui.message}>Laddar...</p>;
  }

  return (
    <div style={ui.pageWrapper}>
      <div style={ui.topBar}>
        <h1>Mina tjänster</h1>
      </div>

      {error && <p style={ui.error}>{error}</p>}

      {!error && services.length === 0 && (
        <p style={ui.message}>Du har inte skapat några tjänster ännu.</p>
      )}

      {!error && services.length > 0 && (
        <div style={ui.list}>
          {services.map((service) => {
            const isDeleting = deletingId === service.id;
            const totalSlots = service.availableSlots?.length ?? 0;
            const bookedSlots =
              service.availableSlots?.filter((slot) => slot.booked).length ?? 0;
            const availableSlots = totalSlots - bookedSlots;

            return (
              <div key={service.id} style={ui.card}>
                <h2 style={styles.title}>{service.title}</h2>
                <p style={styles.description}>{service.description}</p>
                <p style={styles.price}>{service.price} kr</p>

                <p style={styles.slotSummary}>
                  Upplagda tider: {totalSlots}
                </p>

                <p style={styles.slotSummary}>
                  Lediga tider: {availableSlots}
                </p>

                <p style={styles.slotSummary}>
                  Bokade tider: {bookedSlots}
                </p>

                <div style={styles.buttonRow}>
                  <button
                    onClick={() => navigate(`/services/edit/${service.id}`)}
                    style={styles.editButton}
                    disabled={isDeleting}
                  >
                    Redigera
                  </button>

                  <button
                    onClick={() => handleDelete(service.id)}
                    style={styles.deleteButton}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Tar bort..." : "Ta bort"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  title: {
    margin: "0 0 8px 0",
  },
  description: {
    margin: "0 0 12px 0",
    color: "#4b5563",
  },
  price: {
    margin: "0 0 12px 0",
    fontWeight: 700,
  },
  slotSummary: {
    margin: "0 0 8px 0",
    color: "#374151",
    fontWeight: 500,
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "12px",
  },
  editButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#fcc86e",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#f84e4e",
    cursor: "pointer",
    color: "#ffffff",
  },
};