import type { CSSProperties } from "react";

export const ui = {
  pageWrapper: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "32px",
  } as CSSProperties,

  formWrapper: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "32px",
  } as CSSProperties,

  card: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  } as CSSProperties,

  formCard: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  } as CSSProperties,

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  } as CSSProperties,

  textarea: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
    minHeight: "120px",
    resize: "vertical",
  } as CSSProperties,

  buttonRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  } as CSSProperties,

  primaryBlueButton: {
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    flex: 1,
  } as CSSProperties,

  primaryGreenButton: {
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    background: "#22c55e",
    color: "#ffffff",
    cursor: "pointer",
    flex: 1,
  } as CSSProperties,

  secondaryButton: {
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    flex: 1,
  } as CSSProperties,

  message: {
    padding: "24px",
  } as CSSProperties,

  error: {
    color: "#c62828",
    margin: 0,
  } as CSSProperties,

  success: {
    color: "#15803d",
    margin: 0,
  } as CSSProperties,

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
  } as CSSProperties,

  list: {
    display: "grid",
    gap: "16px",
  } as CSSProperties,
};