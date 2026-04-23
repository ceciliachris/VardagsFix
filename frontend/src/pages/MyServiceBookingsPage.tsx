import { useEffect, useState, type CSSProperties } from "react";
import { getBookingsForMyServices, cancelBooking } from "../api/bookingApi";
import { ui } from "../styles/ui";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";

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

export default function MyServiceBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const showError = (message: string) => {
    setToastType("error");
    setToastMessage(message);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getBookingsForMyServices();

        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          setError("Ogiltigt svar från servern.");
        }
      } catch (err: any) {
        console.error(err);

        let message = "Kunde inte hämta bokningar på dina tjänster.";

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

  const openCancelDialog = (id: number) => {
    setSelectedBookingId(id);
    setConfirmCancelOpen(true);
    setToastMessage("");
  };

  const handleCancelConfirmed = async () => {
    if (selectedBookingId === null) {
      return;
    }

    setCancellingId(selectedBookingId);

    try {
      await cancelBooking(selectedBookingId);

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBookingId
            ? { ...booking, status: "CANCELLED" }
            : booking
        )
      );

      setToastType("success");
      setToastMessage("Bokningen avbokades.");
      setConfirmCancelOpen(false);
      setSelectedBookingId(null);
    } catch (err: any) {
      console.error(err);

      let message = "Kunde inte avboka bokningen.";

      if (typeof err?.response?.data === "string") {
        message = err.response.data;
      } else if (typeof err?.response?.data?.message === "string") {
        message = err.response.data.message;
      } else if (typeof err?.message === "string") {
        message = err.message;
      }

      showError(message);
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
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

      <ConfirmDialog
        open={confirmCancelOpen}
        title="Avboka bokning"
        message="Är du säker på att du vill avboka bokningen?"
        confirmText="Avboka"
        cancelText="Stäng"
        danger
        loading={cancellingId !== null}
        onConfirm={handleCancelConfirmed}
        onCancel={() => {
          if (cancellingId !== null) return;
          setConfirmCancelOpen(false);
          setSelectedBookingId(null);
        }}
      />

      <div style={ui.topBar}>
        <h1 style={ui.title}>Bokningar på mina tjänster</h1>
      </div>

      {error && <p style={ui.error}>{error}</p>}

      {!error && bookings.length === 0 && (
        <p style={ui.message}>Ingen har bokat dina tjänster ännu.</p>
      )}

      {!error && bookings.length > 0 && (
        <>
          <section style={ui.section}>
            <h2 style={ui.sectionTitle}>
              Aktiva bokningar ({activeBookings.length})
            </h2>

            {activeBookings.length === 0 ? (
              <p style={ui.message}>Det finns inga aktiva bokningar.</p>
            ) : (
              <div style={ui.list}>
                {activeBookings.map((booking) => {
                  const isCancelling = cancellingId === booking.id;

                  return (
                    <div key={booking.id} style={ui.card}>
                      <div style={styles.cardHeader}>
                        <h3 style={styles.title}>{booking.service.title}</h3>
                        <span style={ui.badge}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>

                      <p style={styles.description}>{booking.service.description}</p>
                      <p style={styles.price}>{booking.service.price} kr</p>

                      <p style={ui.infoRow}>
                        <strong>Bokad av:</strong> {booking.user.name}
                      </p>

                      <p style={styles.email}>{booking.user.email}</p>

                      <p style={ui.infoRow}>
                        <strong>Start:</strong> {formatDateTime(booking.startTime)}
                      </p>

                      <p style={ui.infoRow}>
                        <strong>Slut:</strong> {formatDateTime(booking.endTime)}
                      </p>

                      {booking.message && (
                        <p style={styles.messageText}>
                          <strong>Meddelande:</strong> {booking.message}
                        </p>
                      )}

                      <div style={ui.buttonRow}>
                        <button
                          onClick={() => openCancelDialog(booking.id)}
                          style={{
                            ...ui.dangerButton,
                            ...(isCancelling ? ui.disabledButton : {}),
                          }}
                          disabled={isCancelling}
                        >
                          {isCancelling ? "Avbokar..." : "Avboka"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section style={ui.section}>
            <div style={styles.archiveHeader}>
              <h2 style={ui.sectionTitle}>
                Arkiverade bokningar ({archivedBookings.length})
              </h2>

              <button
                type="button"
                onClick={() => setShowArchived((prev) => !prev)}
                style={ui.secondaryButton}
              >
                {showArchived ? "Dölj arkiverade" : "Visa arkiverade"}
              </button>
            </div>

            {showArchived &&
              (archivedBookings.length === 0 ? (
                <p style={ui.message}>Det finns inga arkiverade bokningar.</p>
              ) : (
                <div style={ui.list}>
                  {archivedBookings.map((booking) => {
                    const isCancelled = booking.status === "CANCELLED";

                    return (
                      <div key={booking.id} style={ui.card}>
                        <div style={styles.cardHeader}>
                          <h3 style={styles.title}>{booking.service.title}</h3>
                          <span
                            style={
                              isCancelled ? styles.cancelledBadge : styles.endedBadge
                            }
                          >
                            {getStatusLabel(booking.status)}
                          </span>
                        </div>

                        <p style={styles.description}>{booking.service.description}</p>
                        <p style={styles.price}>{booking.service.price} kr</p>

                        <p style={ui.infoRow}>
                          <strong>Bokad av:</strong> {booking.user.name}
                        </p>

                        <p style={styles.email}>{booking.user.email}</p>

                        <p style={ui.infoRow}>
                          <strong>Start:</strong> {formatDateTime(booking.startTime)}
                        </p>

                        <p style={ui.infoRow}>
                          <strong>Slut:</strong> {formatDateTime(booking.endTime)}
                        </p>

                        {booking.message && (
                          <p style={styles.messageText}>
                            <strong>Meddelande:</strong> {booking.message}
                          </p>
                        )}

                        {!isCancelled && (
                          <p style={styles.archivedInfo}>
                            Den här bokningen är avslutad och ligger därför i arkivet.
                          </p>
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
  archiveHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  title: {
    margin: 0,
    fontSize: "22px",
    lineHeight: 1.3,
    color: "#111827",
  },
  description: {
    margin: "0 0 12px 0",
    color: "#4b5563",
    lineHeight: 1.5,
  },
  price: {
    margin: "0 0 16px 0",
    fontWeight: 700,
    color: "#111827",
    fontSize: "18px",
  },
  email: {
    margin: "0 0 12px 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  messageText: {
    margin: "12px 0 16px 0",
    color: "#374151",
    lineHeight: 1.5,
  },
  archivedInfo: {
    margin: "8px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  cancelledBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: "#fee2e2",
    color: "#b91c1c",
  },
  endedBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: "#f3f4f6",
    color: "#4b5563",
  },
};