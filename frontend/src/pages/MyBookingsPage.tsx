import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cancelBooking, getMyBookings } from "../api/bookingApi";

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
    service: BookingService;
    user: BookingUser;
};

export default function MyBookingsPage() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await getMyBookings();
                console.log("My bookings:", data);

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

        try {
            await cancelBooking(id);

            setBookings((prev) =>
                prev.map((booking) =>
                    booking.id === id
                        ? { ...booking, status: "CANCELLED" }
                        : booking
                )
            );
        } catch (err: any) {
            console.error(err);
            alert("Kunde inte avboka bokningen.");
        }
    };

    if (loading) {
        return <p style={styles.message}>Laddar bokningar...</p>;
    }

    return (
        <div style={styles.wrapper}>
            <div style={styles.topBar}>
                <h1>Mina bokningar</h1>

                <button
                    onClick={() => navigate("/services")}
                    style={styles.backButton}
                >
                    Tillbaka
                </button>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            {!error && bookings.length === 0 && (
                <p>Du har inga bokningar ännu.</p>
            )}

            {!error && bookings.length > 0 && (
                <div style={styles.list}>
                    {bookings.map((booking) => (
                        <div key={booking.id} style={styles.card}>
                            <h2 style={styles.title}>{booking.service.title}</h2>

                            <p style={styles.description}>
                                {booking.service.description}
                            </p>

                            <p style={styles.price}>
                                {booking.service.price} kr
                            </p>

                            <p style={styles.owner}>
                                Erbjuds av: <strong>{booking.service.user.name}</strong>
                            </p>

                            <p style={styles.email}>
                                {booking.service.user.email}
                            </p>
                            <p
                                style={{
                                    ...styles.status,
                                    color:
                                        booking.status === "CANCELLED" ? "#dc2626" : "#15803d",
                                }}
                            >
                                Status: {booking.status}
                            </p>

                            {booking.status !== "CANCELLED" && (
                                <button
                                    onClick={() => handleCancel(booking.id)}
                                    style={styles.cancelButton}
                                >
                                    Avboka
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    wrapper: {
        maxWidth: "900px",
        margin: "0 auto",
        padding: "32px",
    },
    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
    },
    backButton: {
        padding: "10px 16px",
        border: "none",
        borderRadius: "8px",
        background: "#2563eb",
        color: "#ffffff",
        cursor: "pointer",
    },
    list: {
        display: "grid",
        gap: "16px",
    },
    card: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
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
    time: {
        margin: "0 0 8px 0",
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
    message: {
        padding: "24px",
    },
    error: {
        color: "#c62828",
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
};