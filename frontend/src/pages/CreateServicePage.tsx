import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createService } from "../api/serviceApi";

export default function CreateServicePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createService({
        title,
        description,
        price: Number(price),
      });

      navigate("/services");
    } catch (err: any) {
      console.error(err);

      let message = "Kunde inte skapa tjänst.";

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

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1>Skapa tjänst</h1>

        <input
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          required
        />

        <textarea
          placeholder="Beskrivning"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="number"
          placeholder="Pris"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Sparar..." : "Skapa"}
        </button>

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
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
  },
  error: {
    color: "red",
  },
};