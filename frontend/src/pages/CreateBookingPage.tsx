import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBooking } from "../api/bookingApi";

export default function CreateBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createBooking({
        serviceId: Number(id),
        startTime,
        endTime,
      });

      setSuccess("Bokning skapad!");
      setTimeout(() => {
        navigate("/services");
      }, 1000);
    } catch (err: any) {
      console.error(err);

      let message = "Kunde inte skapa bokning.";

      if (typeof err?.response?.data === "string") {
        message = err.response.data;
      } else if (typeof err?.response?.data?.message === "string") {
        message = err.response.data.message;
      }

      setError(message);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1>Boka tjänst</h1>

        <label>Starttid</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={styles.input}
          required
        />

        <label>Sluttid</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={styles.input}
          required
        />

        <button style={styles.button}>Boka</button>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
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
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
  success: {
    color: "green",
  },
};