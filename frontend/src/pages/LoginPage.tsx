import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { saveToken } from "../utils/storage";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = await login({ email, password });
      saveToken(token);
      setSuccess("Inloggning lyckades.");
      navigate("/services");
    } catch (err: any) {
      console.error(err);

      let message = "Kunde inte logga in.";

      if (typeof err?.response?.data === "string") {
        message = err.response.data;
      } else if (typeof err?.response?.data?.message === "string") {
        message = err.response.data.message;
      } else if (typeof err?.message === "string") {
        message = err.message;
      } else if (err?.response?.status) {
        message = `Fel från servern (${err.response.status}).`;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.heading}>Logga in</h1>

        <label style={styles.label}>E-post</label>
        <input
          type="email"
          placeholder="namn@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <label style={styles.label}>Lösenord</label>
        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Loggar in..." : "Logga in"}
        </button>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fb",
    padding: "24px",
  },
  form: {
    width: "100%",
    maxWidth: "400px",
    background: "#ffffff",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  heading: {
    margin: "0 0 16px 0",
    fontSize: "2rem",
    color: "#0f172a",
  },
  label: {
    fontWeight: 600,
    color: "#0f172a",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    marginTop: "8px",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "#c62828",
    margin: 0,
  },
  success: {
    color: "#2e7d32",
    margin: 0,
  },
};