import { useEffect, useState } from "react";
import { getAllServices } from "../api/serviceApi";

type ServiceItem = {
  id: number;
  title: string;
  description: string;
  price: number;
};

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getAllServices();
        setServices(data);
      } catch (err: any) {
        console.error(err);
        const message =
          err?.response?.data?.message || "Kunde inte hämta tjänster.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return <p style={styles.message}>Laddar tjänster...</p>;
  }

  if (error) {
    return <p style={styles.error}>{error}</p>;
  }

  return (
    <div style={styles.wrapper}>
      <h1>Alla tjänster</h1>

      {services.length === 0 ? (
        <p>Inga tjänster hittades.</p>
      ) : (
        <div style={styles.list}>
          {services.map((service) => (
            <div key={service.id} style={styles.card}>
              <h2 style={styles.title}>{service.title}</h2>
              <p style={styles.description}>{service.description}</p>
              <p style={styles.price}>{service.price} kr</p>
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
    padding: "24px",
    color: "#c62828",
  },
};