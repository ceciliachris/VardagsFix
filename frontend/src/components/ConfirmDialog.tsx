import { useEffect, type CSSProperties, type MouseEvent } from "react";

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
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) {
    return null;
  }

  const handleOverlayClick = () => {
    if (!loading) {
      onCancel();
    }
  };

  const handleDialogClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      style={styles.overlay}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        style={styles.dialog}
        onClick={handleDialogClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div style={styles.topRow}>
          <div
            style={{
              ...styles.iconWrapper,
              ...(danger ? styles.dangerIconWrapper : styles.defaultIconWrapper),
            }}
          >
            <span style={styles.icon}>{danger ? "!" : "?"}</span>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              ...styles.closeButton,
              ...(loading ? styles.disabledCloseButton : {}),
            }}
            aria-label="Stäng dialog"
          >
            ×
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.badgeRow}>
            <span
              style={{
                ...styles.badge,
                ...(danger ? styles.dangerBadge : styles.defaultBadge),
              }}
            >
              {danger ? "Bekräfta borttagning" : "Bekräfta val"}
            </span>
          </div>

          <h2 id="confirm-dialog-title" style={styles.title}>
            {title}
          </h2>

          <p id="confirm-dialog-message" style={styles.message}>
            {message}
          </p>
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
    background: "rgba(15, 23, 42, 0.52)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 1000,
  },
  dialog: {
    width: "100%",
    maxWidth: "520px",
    background: "#ffffff",
    borderRadius: "28px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 30px 80px rgba(15, 23, 42, 0.22)",
    padding: "24px",
    display: "grid",
    gap: "22px",
    boxSizing: "border-box",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  iconWrapper: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid transparent",
  },
  defaultIconWrapper: {
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    borderColor: "#bfdbfe",
  },
  dangerIconWrapper: {
    background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
    borderColor: "#fecaca",
  },
  icon: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1,
  },
  closeButton: {
    border: "none",
    background: "#f8fafc",
    color: "#64748b",
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    fontSize: "24px",
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  disabledCloseButton: {
    cursor: "not-allowed",
    opacity: 0.6,
  },
  content: {
    display: "grid",
    gap: "10px",
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
  defaultBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
  },
  dangerBadge: {
    background: "#fee2e2",
    color: "#b91c1c",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#0f172a",
  },
  message: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
    fontSize: "16px",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  cancelButton: {
    flex: "1 1 180px",
    padding: "13px 18px",
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.03)",
  },
  confirmButton: {
    flex: "1.2 1 220px",
    padding: "13px 18px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.18)",
  },
  dangerButton: {
    flex: "1.2 1 220px",
    padding: "13px 18px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    boxShadow: "0 12px 24px rgba(220, 38, 38, 0.18)",
  },
  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none",
  },
};