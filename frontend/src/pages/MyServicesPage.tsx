import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyServices, deleteService } from "../api/serviceApi";

type ServiceItem = {
  id: number;
  title: string;
  description: string;
  price: number;
};

export default function MyServicesPage() {
  const navigate = useNavigate();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getMyServices();
        setServices(data);
      } catch (err: any) {
        console.error(err);

        let message = "Kunde inte hämta dina tjänster.";

        if (typeof err?.response?.data === "string") {
          message = err.response.data;
        } else if (typeof err?.response?.data?.message === "string") {
          message = err.response.data.message;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return <p style={styles.message}>Laddar...</p>;
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Är du säker på att du vill ta bort tjänsten?")) {
      return;
    }

    try {
      await deleteService(id);

      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Kunde inte ta bort tjänsten.");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <h1>Mina tjänster</h1>

        <button
          onClick={() => navigate("/services")}
          style={styles.backButton}
        >
          Tillbaka
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {!error && services.length === 0 && (
        <p>Du har inte skapat några tjänster ännu.</p>
      )}

      {!error && services.length > 0 && (
        <div style={styles.list}>
          {services.map((service) => (
            <div key={service.id} style={styles.card}>
              <h2 style={styles.title}>{service.title}</h2>
              <p style={styles.description}>{service.description}</p>
              <p style={styles.price}>{service.price} kr</p>
              <button
                onClick={() => navigate(`/services/edit/${service.id}`)}
                style={styles.editButton}
              >
                Redigera
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                style={styles.deleteButton}
              >
                Ta bort
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  editButton: {
  marginTop: "10px",
  marginRight: "10px",
  padding: "8px 12px",
  border: "none",
  borderRadius: "6px",
  background: "#fcc86e",
  cursor: "pointer",
},
  deleteButton: {
    marginTop: "10px",
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#f84e4e",
    cursor: "pointer",
  },
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
    background: "#b1b6c0",
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
    margin: 0,
    fontWeight: 700,
  },
  message: {
    padding: "24px",
  },
  error: {
    color: "#c62828",
  },
};