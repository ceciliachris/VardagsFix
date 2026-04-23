import { useEffect, useState, type CSSProperties } from "react";
import { cancelBooking, getMyBookings } from "../api/bookingApi";
import { ui } from "../styles/ui";

type BookingServiceUser = {
  id: number;
  name: string;
  email: string;
};

type BookingService = {
  id: number;
  title: string;
  description: string;
  price: number;
  user: BookingServiceUser;
};

type BookingUser = {
  id: number;
  name: string;
  email: string;
};

type BookingItem = {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  message?: string;
  service: BookingService;
  user: BookingUser;
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

function getStatusLabel(status: string) {
  switch (status) {
    case "BOOKED":
      return "Bokad";
    case "CANCELLED":
      return "Avbokad";
    default:
      return status;
  }
}

function isArchivedBooking(booking: BookingItem) {
  const isCancelled = booking.status === "CANCELLED";
  const endDate = new Date(booking.endTime);
  const hasPassed =
    !Number.isNaN(endDate.getTime()) && endDate.getTime() < Date.now();

  return isCancelled || hasPassed;
}

function sortBookingsByStartTimeDesc(bookings: BookingItem[]) {
  return [...bookings].sort((a, b) => {
    const dateA = new Date(a.startTime).getTime();
    const dateB = new Date(b.startTime).getTime();

    return dateB - dateA;
  });
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getMyBookings();

        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          setError("Ogiltigt svar från servern.");
        }
      } catch (err: any) {
        console.error(err);

        let message = "Kunde inte hämta dina bokningar.";

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

    fetchBookings();
  }, []);

  const handleCancel = async (id: number) => {
    const confirmed = window.confirm("Är du säker på att du vill avboka?");
    if (!confirmed) {
      return;
    }

    setCancellingId(id);

    try {
      await cancelBooking(id);

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: "CANCELLED" } : booking
        )
      );
    } catch (err: any) {
      console.error(err);
      alert("Kunde inte avboka bokningen.");
    } finally {
      setCancellingId(null);
    }
  };

  const activeBookings = sortBookingsByStartTimeDesc(
    bookings.filter((booking) => !isArchivedBooking(booking))
  );

  const archivedBookings = sortBookingsByStartTimeDesc(
    bookings.filter((booking) => isArchivedBooking(booking))
  );

  if (loading) {
    return <p style={ui.message}>Laddar bokningar...</p>;
  }

  return (
    <div style={ui.pageWrapper}>
      <div style={styles.heroCard}>
        <div style={styles.heroText}>
          <h1 style={ui.title}>Mina bokningar</h1>
          <p style={styles.heroDescription}>
            Håll koll på dina kommande bokningar och öppna arkivet när du vill se
            avslutade eller avbokade bokningar.
          </p>
        </div>

        <div style={styles.heroStats}>
          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{activeBookings.length}</span>
            <span style={styles.heroStatLabel}>Aktiva bokningar</span>
          </div>

          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{archivedBookings.length}</span>
            <span style={styles.heroStatLabel}>Arkiverade</span>
          </div>
        </div>
      </div>

      {error && <p style={ui.error}>{error}</p>}

      {!error && bookings.length === 0 && (
        <div style={styles.emptyState}>
          <h2 style={styles.emptyStateTitle}>Du har inga bokningar ännu</h2>
          <p style={styles.emptyStateText}>
            När du bokar en tjänst kommer den att visas här tillsammans med status,
            tider och kontaktuppgifter.
          </p>
        </div>
      )}

      {!error && bookings.length > 0 && (
        <>
          <section style={ui.section}>
            <h2 style={ui.sectionTitle}>
              Aktiva bokningar ({activeBookings.length})
            </h2>

            {activeBookings.length === 0 ? (
              <div style={styles.emptySectionCard}>
                <p style={styles.emptySectionText}>Du har inga aktiva bokningar.</p>
              </div>
            ) : (
              <div style={ui.list}>
                {activeBookings.map((booking) => {
                  const isCancelling = cancellingId === booking.id;

                  return (
                    <div key={booking.id} style={styles.bookingCard}>
                      <div style={styles.cardHeader}>
                        <div style={styles.titleBlock}>
                          <h3 style={styles.title}>{booking.service.title}</h3>
                          <p style={styles.description}>
                            {booking.service.description}
                          </p>
                        </div>

                        <div style={styles.headerMeta}>
                          <span style={styles.activeBadge}>
                            {getStatusLabel(booking.status)}
                          </span>
                          <span style={styles.priceTag}>
                            {booking.service.price} kr
                          </span>
                        </div>
                      </div>

                      <div style={styles.divider} />

                      <div style={styles.metaGrid}>
                        <div style={styles.metaItem}>
                          <span style={styles.metaLabel}>Utförare</span>
                          <span style={styles.metaValue}>
                            {booking.service.user.name}
                          </span>
                        </div>

                        <div style={styles.metaItem}>
                          <span style={styles.metaLabel}>E-post</span>
                          <span style={styles.metaSubtle}>
                            {booking.service.user.email}
                          </span>
                        </div>

                        <div style={styles.metaItem}>
                          <span style={styles.metaLabel}>Start</span>
                          <span style={styles.metaValue}>
                            {formatDateTime(booking.startTime)}
                          </span>
                        </div>

                        <div style={styles.metaItem}>
                          <span style={styles.metaLabel}>Slut</span>
                          <span style={styles.metaValue}>
                            {formatDateTime(booking.endTime)}
                          </span>
                        </div>
                      </div>

                      {booking.message && (
                        <>
                          <div style={styles.divider} />
                          <div style={styles.messageBox}>
                            <span style={styles.messageLabel}>Ditt meddelande</span>
                            <p style={styles.messageText}>{booking.message}</p>
                          </div>
                        </>
                      )}

                      <div style={styles.divider} />

                      <div style={styles.cardFooter}>
                        <p style={styles.footerText}>
                          Du kan avboka bokningen om tiden inte längre passar.
                        </p>

                        <div style={styles.actionRow}>
                          <button
                            onClick={() => handleCancel(booking.id)}
                            style={{
                              ...styles.dangerActionButton,
                              ...(isCancelling ? ui.disabledButton : {}),
                            }}
                            disabled={isCancelling}
                          >
                            {isCancelling ? "Avbokar..." : "Avboka"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section style={ui.section}>
            <div style={styles.archiveHeader}>
              <div>
                <h2 style={ui.sectionTitle}>
                  Arkiverade bokningar ({archivedBookings.length})
                </h2>
                <p style={styles.archiveHelpText}>
                  Här visas bokningar som är avslutade eller avbokade.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowArchived((prev) => !prev)}
                style={styles.secondaryActionButton}
              >
                {showArchived ? "Dölj arkiverade" : "Visa arkiverade"}
              </button>
            </div>

            {showArchived &&
              (archivedBookings.length === 0 ? (
                <div style={styles.emptySectionCard}>
                  <p style={styles.emptySectionText}>
                    Det finns inga arkiverade bokningar.
                  </p>
                </div>
              ) : (
                <div style={ui.list}>
                  {archivedBookings.map((booking) => {
                    const isCancelled = booking.status === "CANCELLED";

                    return (
                      <div key={booking.id} style={styles.bookingCard}>
                        <div style={styles.cardHeader}>
                          <div style={styles.titleBlock}>
                            <h3 style={styles.title}>{booking.service.title}</h3>
                            <p style={styles.description}>
                              {booking.service.description}
                            </p>
                          </div>

                          <div style={styles.headerMeta}>
                            <span
                              style={
                                isCancelled
                                  ? styles.cancelledBadge
                                  : styles.endedBadge
                              }
                            >
                              {getStatusLabel(booking.status)}
                            </span>
                            <span style={styles.priceTag}>
                              {booking.service.price} kr
                            </span>
                          </div>
                        </div>

                        <div style={styles.divider} />

                        <div style={styles.metaGrid}>
                          <div style={styles.metaItem}>
                            <span style={styles.metaLabel}>Utförare</span>
                            <span style={styles.metaValue}>
                              {booking.service.user.name}
                            </span>
                          </div>

                          <div style={styles.metaItem}>
                            <span style={styles.metaLabel}>E-post</span>
                            <span style={styles.metaSubtle}>
                              {booking.service.user.email}
                            </span>
                          </div>

                          <div style={styles.metaItem}>
                            <span style={styles.metaLabel}>Start</span>
                            <span style={styles.metaValue}>
                              {formatDateTime(booking.startTime)}
                            </span>
                          </div>

                          <div style={styles.metaItem}>
                            <span style={styles.metaLabel}>Slut</span>
                            <span style={styles.metaValue}>
                              {formatDateTime(booking.endTime)}
                            </span>
                          </div>
                        </div>

                        {booking.message && (
                          <>
                            <div style={styles.divider} />
                            <div style={styles.messageBox}>
                              <span style={styles.messageLabel}>Ditt meddelande</span>
                              <p style={styles.messageText}>{booking.message}</p>
                            </div>
                          </>
                        )}

                        {!isCancelled && (
                          <>
                            <div style={styles.divider} />
                            <p style={styles.archivedInfo}>
                              Den här bokningen är avslutad och ligger därför i
                              arkivet.
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
          </section>
        </>
      )}
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
    marginBottom: "8px",
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
  archiveHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  archiveHelpText: {
    margin: "4px 0 0 0",
    color: "#6b7280",
    lineHeight: 1.5,
  },
  bookingCard: {
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
  activeBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: "#dcfce7",
    color: "#166534",
  },
  cancelledBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: "#fee2e2",
    color: "#b91c1c",
  },
  endedBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: "#f3f4f6",
    color: "#4b5563",
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
  messageBox: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "16px",
    display: "grid",
    gap: "8px",
  },
  messageLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  messageText: {
    margin: 0,
    color: "#334155",
    lineHeight: 1.6,
  },
  archivedInfo: {
    margin: 0,
    color: "#6b7280",
    lineHeight: 1.6,
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