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
  location: string;
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
    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort tjänsten?"
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      await deleteService(id);
      setServices((prev) => prev.filter((service) => service.id !== id));
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
    return <p style={ui.message}>Laddar dina tjänster...</p>;
  }

  const totalServices = services.length;
  const totalSlots = services.reduce(
    (sum, service) => sum + (service.availableSlots?.length ?? 0),
    0
  );
  const totalBookedSlots = services.reduce(
    (sum, service) =>
      sum + (service.availableSlots?.filter((slot) => slot.booked).length ?? 0),
    0
  );
  const totalAvailableSlots = totalSlots - totalBookedSlots;

  return (
    <div style={ui.pageWrapper}>
      <div style={styles.heroCard}>
        <div style={styles.heroText}>
          <h1 style={ui.title}>Mina tjänster</h1>
          <p style={styles.heroDescription}>
            Hantera dina upplagda tjänster, håll koll på tillgängliga tider och
            redigera innehållet när det behövs.
          </p>
        </div>

        <div style={styles.heroStats}>
          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{totalServices}</span>
            <span style={styles.heroStatLabel}>Tjänster</span>
          </div>

          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{totalAvailableSlots}</span>
            <span style={styles.heroStatLabel}>Lediga tider</span>
          </div>

          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{totalBookedSlots}</span>
            <span style={styles.heroStatLabel}>Bokade tider</span>
          </div>
        </div>
      </div>

      {error && <p style={ui.error}>{error}</p>}

      {!error && services.length === 0 && (
        <div style={styles.emptyState}>
          <h2 style={styles.emptyStateTitle}>Du har inte skapat några tjänster ännu</h2>
          <p style={styles.emptyStateText}>
            När du skapar din första tjänst kommer den att visas här tillsammans
            med statistik över tider och bokningar.
          </p>

          <div style={styles.emptyStateActions}>
            <button
              onClick={() => navigate("/services/create")}
              style={styles.primaryActionButton}
            >
              Skapa första tjänsten
            </button>
          </div>
        </div>
      )}

      {!error && services.length > 0 && (
        <section style={ui.section}>
          <div style={ui.list}>
            {services.map((service) => {
              const isDeleting = deletingId === service.id;
              const totalSlots = service.availableSlots?.length ?? 0;
              const bookedSlots =
                service.availableSlots?.filter((slot) => slot.booked).length ?? 0;
              const availableSlots = totalSlots - bookedSlots;

              return (
                <div key={service.id} style={styles.serviceCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.titleBlock}>
                      <h2 style={styles.title}>{service.title}</h2>
                      <p style={styles.description}>{service.description}</p>
                    </div>

                    <div style={styles.headerMeta}>
                      <span style={styles.ownBadge}>Din tjänst</span>
                      <span style={styles.priceTag}>{service.price} kr</span>
                    </div>
                  </div>

                  <div style={styles.divider} />

                  <div style={styles.metaGrid}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Plats</span>
                      <span style={styles.metaValue}>{service.location}</span>
                    </div>

                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Upplagda tider</span>
                      <span style={styles.metaValue}>{totalSlots}</span>
                    </div>

                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Lediga tider</span>
                      <span style={styles.availableValue}>{availableSlots}</span>
                    </div>

                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Bokade tider</span>
                      <span style={styles.bookedValue}>{bookedSlots}</span>
                    </div>
                  </div>

                  <div style={styles.divider} />

                  <div style={styles.cardFooter}>
                    <p style={styles.footerText}>
                      Du kan redigera informationen för tjänsten eller ta bort den
                      om den inte längre ska vara tillgänglig.
                    </p>

                    <div style={styles.actionRow}>
                      <button
                        onClick={() => navigate(`/services/edit/${service.id}`)}
                        style={{
                          ...styles.secondaryActionButton,
                          ...(isDeleting ? ui.disabledButton : {}),
                        }}
                        disabled={isDeleting}
                      >
                        Redigera
                      </button>

                      <button
                        onClick={() => handleDelete(service.id)}
                        style={{
                          ...styles.dangerActionButton,
                          ...(isDeleting ? ui.disabledButton : {}),
                        }}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Tar bort..." : "Ta bort"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
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
    marginBottom: "8px",
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
    maxWidth: "700px",
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
  emptyState: {
    background: "#ffffff",
    border: "1px dashed #cbd5e1",
    borderRadius: "20px",
    padding: "40px 24px",
    textAlign: "center",
  },
  emptyStateTitle: {
    margin: "0 0 8px 0",
    fontSize: "22px",
    color: "#111827",
  },
  emptyStateText: {
    margin: 0,
    color: "#6b7280",
    lineHeight: 1.6,
    maxWidth: "620px",
    marginInline: "auto",
  },
  emptyStateActions: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
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
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  titleBlock: {
    display: "grid",
    gap: "8px",
    flex: 1,
    minWidth: "240px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    lineHeight: 1.2,
    color: "#0f172a",
    fontWeight: 800,
  },
  description: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
    maxWidth: "700px",
  },
  headerMeta: {
    display: "grid",
    gap: "10px",
    justifyItems: "end",
  },
  ownBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: "#fef3c7",
    color: "#92400e",
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
  availableValue: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#166534",
    lineHeight: 1.4,
  },
  bookedValue: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#92400e",
    lineHeight: 1.4,
  },
  cardFooter: {
    display: "grid",
    gap: "14px",
  },
  footerText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.5,
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
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
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