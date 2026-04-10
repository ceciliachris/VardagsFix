import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllServices } from "../api/serviceApi";
import { removeToken } from "../utils/storage";

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
};

export default function ServicesPage() {
  const navigate = useNavigate();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getAllServices();
        console.log("Services data:", data);

        if (Array.isArray(data)) {
          setServices(data);
        } else {
          setError("Ogiltigt svar från servern.");
        }
      } catch (err: any) {
        console.error(err);

        let message = "Kunde inte hämta tjänster.";

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

  const handleLogout = () => {
    removeToken();
    navigate("/");
  };

  const handleCreateService = () => {
    navigate("/services/create");
  };

  if (loading) {
    return <p style={styles.message}>Laddar tjänster...</p>;
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <h1>Alla tjänster</h1>

        <div style={styles.buttonGroup}>
          <button onClick={handleCreateService} style={styles.createButton}>
            Skapa tjänst
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logga ut
          </button>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {!error && services.length === 0 && <p>Inga tjänster hittades.</p>}

      {!error && services.length > 0 && (
        <div style={styles.list}>
          {services.map((service) => (
            <div key={service.id} style={styles.card}>
              <h2 style={styles.title}>{service.title}</h2>
              <p style={styles.description}>{service.description}</p>
              <p style={styles.price}>{service.price} kr</p>
              <p style={styles.owner}>
                Erbjuds av: <strong>{service.user?.name ?? "Okänd användare"}</strong>
              </p>
              <p style={styles.email}>{service.user?.email ?? ""}</p>
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
    gap: "16px",
    flexWrap: "wrap",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
  },
  createButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
  },
  logoutButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#e5e7eb",
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
    margin: "0 0 10px 0",
    fontWeight: 700,
  },
  owner: {
    margin: "0 0 4px 0",
    color: "#111827",
  },
  email: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },
  message: {
    padding: "24px",
  },
  error: {
    color: "#c62828",
  },
};