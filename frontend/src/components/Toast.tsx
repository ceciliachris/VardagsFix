import { useEffect, type CSSProperties } from "react";

type ToastProps = {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
};

export default function Toast({
  message,
  type,
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [message, duration, onClose]);

  if (!message) {
    return null;
  }

  const isError = type === "error";

  return (
    <div
      style={{
        ...styles.toast,
        ...(isError ? styles.errorToast : styles.successToast),
      }}
      role="alert"
      aria-live="polite"
    >
      <div style={styles.header}>
        <span
          style={{
            ...styles.badge,
            ...(isError ? styles.errorBadge : styles.successBadge),
          }}
        >
          {isError ? "Fel" : "Klart"}
        </span>

        <button type="button" onClick={onClose} style={styles.closeButton}>
          ×
        </button>
      </div>

      <p style={styles.message}>{message}</p>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  toast: {
    position: "fixed",
    top: "24px",
    right: "24px",
    width: "min(420px, calc(100vw - 32px))",
    borderRadius: "18px",
    padding: "16px 16px 14px 16px",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
    zIndex: 2000,
    border: "1px solid transparent",
    backdropFilter: "blur(6px)",
  },
  errorToast: {
    background: "#ffffff",
    borderColor: "#fecaca",
  },
  successToast: {
    background: "#ffffff",
    borderColor: "#bbf7d0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  errorBadge: {
    background: "#fee2e2",
    color: "#b91c1c",
  },
  successBadge: {
    background: "#dcfce7",
    color: "#166534",
  },
  closeButton: {
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontSize: "22px",
    lineHeight: 1,
    cursor: "pointer",
    padding: 0,
  },
  message: {
    margin: 0,
    color: "#0f172a",
    lineHeight: 1.6,
    fontWeight: 600,
  },
};