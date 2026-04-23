import type { CSSProperties } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Bekräfta",
  cancelText = "Avbryt",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <div style={styles.content}>
          <h2 style={styles.title}>{title}</h2>
          <p style={styles.message}>{message}</p>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              ...styles.cancelButton,
              ...(loading ? styles.disabledButton : {}),
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              ...(danger ? styles.dangerButton : styles.confirmButton),
              ...(loading ? styles.disabledButton : {}),
            }}
          >
            {loading ? "Vänta..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },
  dialog: {
    width: "100%",
    maxWidth: "460px",
    background: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
    padding: "24px",
    display: "grid",
    gap: "20px",
  },
  content: {
    display: "grid",
    gap: "8px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#0f172a",
  },
  message: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  cancelButton: {
    flex: 1,
    padding: "12px 18px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
  },
  confirmButton: {
    flex: 1,
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
  },
  dangerButton: {
    flex: 1,
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    boxShadow: "0 10px 20px rgba(220, 38, 38, 0.18)",
  },
  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none",
  },
};