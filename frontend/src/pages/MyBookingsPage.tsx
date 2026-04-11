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

  const activeBookings = bookings.filter((booking) => !isArchivedBooking(booking));
  const archivedBookings = bookings.filter((booking) => isArchivedBooking(booking));

  if (loading) {
    return <p style={ui.message}>Laddar bokningar...</p>;
  }

  return (
    <div style={ui.pageWrapper}>
      <div style={ui.topBar}>
        <h1>Mina bokningar</h1>
      </div>

      {error && <p style={ui.error}>{error}</p>}

      {!error && bookings.length === 0 && (
        <p style={ui.message}>Du har inga bokningar ännu.</p>
      )}

      {!error && bookings.length > 0 && (
        <>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Aktiva bokningar ({activeBookings.length})
            </h2>
          </div>

          {activeBookings.length === 0 ? (
            <p style={ui.message}>Du har inga aktiva bokningar.</p>
          ) : (
            <div style={ui.list}>
              {activeBookings.map((booking) => {
                const isCancelling = cancellingId === booking.id;

                return (
                  <div key={booking.id} style={ui.card}>
                    <h2 style={styles.title}>{booking.service.title}</h2>
                    <p style={styles.description}>{booking.service.description}</p>
                    <p style={styles.price}>{booking.service.price} kr</p>

                    <p style={styles.owner}>
                      Erbjuds av: <strong>{booking.service.user.name}</strong>
                    </p>

                    <p style={styles.email}>{booking.service.user.email}</p>

                    <p style={styles.bookingTime}>
                      <strong>Start:</strong> {formatDateTime(booking.startTime)}
                    </p>

                    <p style={styles.bookingTime}>
                      <strong>Slut:</strong> {formatDateTime(booking.endTime)}
                    </p>

                    {booking.message && (
                      <p style={styles.messageText}>
                        <strong>Meddelande:</strong> {booking.message}
                      </p>
                    )}

                    <p
                      style={{
                        ...styles.status,
                        color: "#15803d",
                      }}
                    >
                      Status: {getStatusLabel(booking.status)}
                    </p>

                    <button
                      onClick={() => handleCancel(booking.id)}
                      style={styles.cancelButton}
                      disabled={isCancelling}
                    >
                      {isCancelling ? "Avbokar..." : "Avboka"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div style={styles.archiveToggleWrapper}>
            <button
              type="button"
              onClick={() => setShowArchived((prev) => !prev)}
              style={styles.archiveToggleButton}
            >
              {showArchived ? "Dölj arkiverade" : "Visa arkiverade"} (
              {archivedBookings.length})
            </button>
          </div>

          {showArchived && (
            <>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                  Arkiverade bokningar ({archivedBookings.length})
                </h2>
              </div>

              {archivedBookings.length === 0 ? (
                <p style={ui.message}>Det finns inga arkiverade bokningar.</p>
              ) : (
                <div style={ui.list}>
                  {archivedBookings.map((booking) => {
                    const isCancelled = booking.status === "CANCELLED";

                    return (
                      <div key={booking.id} style={ui.card}>
                        <h2 style={styles.title}>{booking.service.title}</h2>
                        <p style={styles.description}>
                          {booking.service.description}
                        </p>
                        <p style={styles.price}>{booking.service.price} kr</p>

                        <p style={styles.owner}>
                          Erbjuds av: <strong>{booking.service.user.name}</strong>
                        </p>

                        <p style={styles.email}>{booking.service.user.email}</p>

                        <p style={styles.bookingTime}>
                          <strong>Start:</strong> {formatDateTime(booking.startTime)}
                        </p>

                        <p style={styles.bookingTime}>
                          <strong>Slut:</strong> {formatDateTime(booking.endTime)}
                        </p>

                        {booking.message && (
                          <p style={styles.messageText}>
                            <strong>Meddelande:</strong> {booking.message}
                          </p>
                        )}

                        <p
                          style={{
                            ...styles.status,
                            color: isCancelled ? "#dc2626" : "#6b7280",
                          }}
                        >
                          Status: {getStatusLabel(booking.status)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  sectionHeader: {
    marginBottom: "12px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "20px",
  },
  archiveToggleWrapper: {
    marginTop: "24px",
    marginBottom: "16px",
  },
  archiveToggleButton: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    fontWeight: 600,
  },
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
  owner: {
    margin: "0 0 4px 0",
    color: "#111827",
  },
  email: {
    margin: "0 0 12px 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  bookingTime: {
    margin: "0 0 8px 0",
    color: "#374151",
  },
  messageText: {
    margin: "0 0 12px 0",
    color: "#374151",
  },
  status: {
    margin: "12px 0",
    fontWeight: 700,
  },
  cancelButton: {
    marginTop: "8px",
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
  },
};