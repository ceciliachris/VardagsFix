import { useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { saveToken } from "../utils/storage";
import { ui } from "../styles/ui";

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
    <div style={styles.page}>
      <div style={styles.authCard}>
        <div style={styles.heroSection}>
          <div style={styles.logoBadge}>VF</div>

          <div style={styles.heroText}>
            <h1 style={styles.title}>Välkommen tillbaka</h1>
            <p style={styles.subtitle}>
              Logga in för att hitta tjänster, boka tider och hantera dina egna
              bokningar på ett och samma ställe.
            </p>
          </div>
        </div>

        <div style={styles.divider} />

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label htmlFor="email" style={ui.label}>
              E-post
            </label>
            <input
              id="email"
              type="email"
              placeholder="namn@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div>
            <label htmlFor="password" style={ui.label}>
              Lösenord
            </label>
            <input
              id="password"
              type="password"
              placeholder="Lösenord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && <p style={ui.error}>{error}</p>}
          {success && <p style={ui.success}>{success}</p>}

          <div style={styles.actionRow}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryActionButton,
                ...(loading ? ui.disabledButton : {}),
              }}
            >
              {loading ? "Loggar in..." : "Logga in"}
            </button>
          </div>
        </form>

        <div style={styles.footerBlock}>
          <p style={styles.footerText}>
            Har du inget konto ännu?
          </p>

          <Link to="/register" style={styles.secondaryLink}>
            Registrera dig här
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "radial-gradient(circle at top, #dbeafe 0%, #eff6ff 25%, #f8fafc 60%)",
    padding: "24px",
  },
  authCard: {
    width: "100%",
    maxWidth: "520px",
    background: "rgba(255, 255, 255, 0.94)",
    backdropFilter: "blur(10px)",
    padding: "32px",
    borderRadius: "28px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.10)",
    display: "grid",
    gap: "24px",
  },
  heroSection: {
    display: "grid",
    gap: "16px",
    justifyItems: "start",
  },
  logoBadge: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "18px",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.20)",
  },
  heroText: {
    display: "grid",
    gap: "10px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1.1,
    fontWeight: 800,
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
    fontSize: "15px",
  },
  divider: {
    height: "1px",
    background: "#e5e7eb",
  },
  form: {
    display: "grid",
    gap: "18px",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
    color: "#111827",
    background: "#ffffff",
    boxSizing: "border-box",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryActionButton: {
    padding: "13px 18px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
    flex: 1,
  },
  footerBlock: {
    display: "grid",
    gap: "8px",
    justifyItems: "start",
  },
  footerText: {
    margin: 0,
    color: "#475569",
    fontSize: "14px",
  },
  secondaryLink: {
    color: "#2563eb",
    fontWeight: 700,
    textDecoration: "none",
    fontSize: "14px",
  },
};