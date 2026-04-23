import { useState } from "react";
import type { FormEvent, CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { saveToken } from "../utils/storage";
import Toast from "../components/Toast";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const showError = (message: string) => {
    setToastType("error");
    setToastMessage(message);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setToastMessage("");
    setLoading(true);

    try {
      const token = await login({ email, password });
      saveToken(token);
      setToastType("success");
      setToastMessage("Inloggning lyckades.");
      setTimeout(() => {
        navigate("/services");
      }, 700);
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

      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

      <div style={styles.backgroundGlowLeft} />
      <div style={styles.backgroundGlowRight} />

      <div style={styles.wrapper}>
        <div style={styles.brandPanel}>
          <span style={styles.brandBadge}>VardagsFix</span>
          <h1 style={styles.brandTitle}>Välkommen tillbaka</h1>
          <p style={styles.brandText}>
            Logga in för att hitta tjänster, boka tider och hantera dina egna
            uppdrag på ett smidigt sätt.
          </p>

          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <span style={styles.infoValue}>Boka</span>
              <span style={styles.infoLabel}>Vardagstjänster enkelt</span>
            </div>

            <div style={styles.infoCard}>
              <span style={styles.infoValue}>Hantera</span>
              <span style={styles.infoLabel}>Tider och bokningar tydligt</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.heading}>Logga in</h2>
            <p style={styles.subText}>
              Ange dina uppgifter för att fortsätta.
            </p>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="email">
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

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="password">
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

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>

          <p style={styles.text}>
            Har du inget konto? <Link to="/register">Registrera dig här</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
    padding: "24px",
  },
  backgroundGlowLeft: {
    position: "absolute",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "rgba(37, 99, 235, 0.10)",
    top: "-60px",
    left: "-80px",
    filter: "blur(10px)",
  },
  backgroundGlowRight: {
    position: "absolute",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.10)",
    bottom: "-40px",
    right: "-60px",
    filter: "blur(10px)",
  },
  wrapper: {
    position: "relative",
    zIndex: 1,
    minHeight: "calc(100vh - 48px)",
    maxWidth: "560px",
    margin: "0 auto",
    display: "grid",
    gap: "24px",
    alignContent: "center",
  },
  brandPanel: {
    width: "100%",
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
    border: "1px solid #bfdbfe",
    borderRadius: "28px",
    padding: "40px",
    boxShadow: "0 20px 50px rgba(37, 99, 235, 0.10)",
    display: "grid",
    gap: "18px",
  },
  brandBadge: {
    display: "inline-flex",
    width: "fit-content",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: "13px",
    border: "1px solid #dbeafe",
  },
  brandTitle: {
    margin: 0,
    fontSize: "40px",
    lineHeight: 1.1,
    color: "#0f172a",
  },
  brandText: {
    margin: 0,
    color: "#475569",
    fontSize: "17px",
    lineHeight: 1.7,
    maxWidth: "560px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "8px",
  },
  infoCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "18px",
    border: "1px solid #dbeafe",
    display: "grid",
    gap: "6px",
  },
  infoValue: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#111827",
  },
  infoLabel: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.5,
  },
  formCard: {
    width: "100%",
    maxWidth: "560px",
    boxSizing: "border-box",
    background: "#ffffff",
    padding: "32px",
    borderRadius: "24px",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.10)",
    display: "grid",
    gap: "18px",
    border: "1px solid #e5e7eb",
  },
  formHeader: {
    display: "grid",
    gap: "8px",
  },
  heading: {
    margin: 0,
    fontSize: "32px",
    color: "#0f172a",
  },
  subText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.6,
  },
  fieldGroup: {
    display: "grid",
    gap: "8px",
  },
  label: {
    fontWeight: 700,
    color: "#0f172a",
    fontSize: "14px",
  },
  input: {
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
    outline: "none",
    background: "#ffffff",
    color: "#111827",
  },
  button: {
    marginTop: "4px",
    padding: "13px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.20)",
  },
  buttonDisabled: {
    cursor: "not-allowed",
    opacity: 0.7,
    boxShadow: "none",
  },
  text: {
    margin: 0,
    fontSize: "14px",
    color: "#475569",
    lineHeight: 1.6,
  },
};