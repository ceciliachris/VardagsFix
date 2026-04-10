import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllServices, updateService } from "../api/serviceApi";

export default function EditServicePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const services = await getAllServices();
        const service = services.find((s: any) => s.id === Number(id));

        if (!service) {
          setError("Tjänsten hittades inte.");
          return;
        }

        setTitle(service.title);
        setDescription(service.description);
        setPrice(service.price.toString());
      } catch (err) {
        console.error(err);
        setError("Kunde inte hämta tjänst.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateService(Number(id), {
        title,
        description,
        price: Number(price),
      });

      navigate("/services/my");
    } catch (err) {
      console.error(err);
      setError("Kunde inte uppdatera tjänsten.");
    }
  };

  if (loading) return <p>Laddar...</p>;

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1>Redigera tjänst</h1>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.input}
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={styles.input}
        />

        <button style={styles.button}>Spara</button>

        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "32px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
  error: {
    color: "red",
  },
};