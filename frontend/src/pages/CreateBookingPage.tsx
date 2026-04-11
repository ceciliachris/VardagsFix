import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBooking } from "../api/bookingApi";
import { ui } from "../styles/ui";

export default function CreateBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!id) {
      setError("Tjänstens id saknas.");
      return;
    }

    if (!startTime) {
      setError("Starttid måste fyllas i.");
      return;
    }

    if (!endTime) {
      setError("Sluttid måste fyllas i.");
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setError("Ogiltigt datum eller tid.");
      return;
    }

    if (endDate <= startDate) {
      setError("Sluttid måste vara efter starttid.");
      return;
    }

    setLoading(true);

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
      } else if (typeof err?.message === "string") {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={ui.formWrapper}>
      <form onSubmit={handleSubmit} style={ui.formCard}>
        <h1>Boka tjänst</h1>

        <label style={{ fontWeight: 600, color: "#111827" }}>Starttid</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={ui.input}
          required
        />

        <label style={{ fontWeight: 600, color: "#111827" }}>Sluttid</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={ui.input}
          required
        />

        <div style={ui.buttonRow}>
          <button type="submit" disabled={loading} style={ui.primaryGreenButton}>
            {loading ? "Bokar..." : "Boka"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/services")}
            disabled={loading}
            style={ui.secondaryButton}
          >
            Avbryt
          </button>
        </div>

        {error && <p style={ui.error}>{error}</p>}
        {success && <p style={ui.success}>{success}</p>}
      </form>
    </div>
  );
}