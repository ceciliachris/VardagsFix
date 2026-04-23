import type { CSSProperties } from "react";

const colors = {
  background: "#f8fafc",
  surface: "#ffffff",
  border: "#e5e7eb",
  borderStrong: "#d1d5db",
  text: "#0f172a",
  textSoft: "#334155",
  mutedText: "#64748b",
  primary: "#2563eb",
  primaryStrong: "#1d4ed8",
  primarySoft: "#eff6ff",
  success: "#16a34a",
  successStrong: "#15803d",
  successSoft: "#dcfce7",
  warning: "#d97706",
  warningSoft: "#fef3c7",
  danger: "#dc2626",
  dangerStrong: "#b91c1c",
  dangerSoft: "#fee2e2",
};

export const ui = {
  pageWrapper: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "32px 20px 48px",
  } as CSSProperties,

  formWrapper: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "32px 20px 48px",
  } as CSSProperties,

  section: {
    marginTop: "24px",
  } as CSSProperties,

  card: {
    background: colors.surface,
    borderRadius: "20px",
    padding: "24px",
    border: `1px solid ${colors.border}`,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
  } as CSSProperties,

  formCard: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    background: colors.surface,
    padding: "28px",
    borderRadius: "24px",
    border: `1px solid ${colors.border}`,
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
  } as CSSProperties,

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
  } as CSSProperties,

  title: {
    margin: 0,
    fontSize: "36px",
    lineHeight: 1.1,
    fontWeight: 800,
    color: colors.text,
    letterSpacing: "-0.02em",
  } as CSSProperties,

  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: "24px",
    lineHeight: 1.2,
    fontWeight: 800,
    color: colors.text,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: 700,
    color: colors.textSoft,
    marginBottom: "6px",
  } as CSSProperties,

  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "12px",
    border: `1px solid ${colors.borderStrong}`,
    fontSize: "16px",
    color: colors.text,
    background: "#ffffff",
    boxSizing: "border-box",
    outline: "none",
  } as CSSProperties,

  textarea: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "12px",
    border: `1px solid ${colors.borderStrong}`,
    fontSize: "16px",
    minHeight: "120px",
    resize: "vertical",
    color: colors.text,
    background: "#ffffff",
    boxSizing: "border-box",
    outline: "none",
  } as CSSProperties,

  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  } as CSSProperties,

  primaryBlueButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    minHeight: "46px",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
    flex: 1,
  } as CSSProperties,

  primaryGreenButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    minHeight: "46px",
    boxShadow: "0 10px 20px rgba(21, 128, 61, 0.18)",
    flex: 1,
  } as CSSProperties,

  secondaryButton: {
    padding: "12px 18px",
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: "12px",
    background: "#ffffff",
    color: colors.text,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    minHeight: "46px",
    flex: 1,
  } as CSSProperties,

  dangerButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    minHeight: "46px",
    boxShadow: "0 10px 20px rgba(220, 38, 38, 0.18)",
    flex: 1,
  } as CSSProperties,

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none",
  } as CSSProperties,

  list: {
    display: "grid",
    gap: "16px",
  } as CSSProperties,

  infoRow: {
    margin: "0 0 8px 0",
    color: colors.textSoft,
    lineHeight: 1.5,
  } as CSSProperties,

  mutedText: {
    color: colors.mutedText,
  } as CSSProperties,

  message: {
    padding: "20px 0",
    color: colors.mutedText,
    lineHeight: 1.6,
  } as CSSProperties,

  error: {
    color: colors.danger,
    margin: "0 0 16px 0",
    fontWeight: 600,
    lineHeight: 1.5,
  } as CSSProperties,

  success: {
    color: colors.success,
    margin: "0 0 16px 0",
    fontWeight: 600,
    lineHeight: 1.5,
  } as CSSProperties,

  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: colors.primarySoft,
    color: colors.primaryStrong,
  } as CSSProperties,

  successBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: colors.successSoft,
    color: colors.successStrong,
  } as CSSProperties,

  warningBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: colors.warningSoft,
    color: colors.warning,
  } as CSSProperties,

  dangerBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: colors.dangerSoft,
    color: colors.dangerStrong,
  } as CSSProperties,

  emptyStateCard: {
    background: "#ffffff",
    border: "1px dashed #cbd5e1",
    borderRadius: "20px",
    padding: "32px 24px",
    textAlign: "center",
  } as CSSProperties,

  helperText: {
    margin: 0,
    color: colors.mutedText,
    lineHeight: 1.5,
    fontSize: "14px",
  } as CSSProperties,
};