import type { ReactNode } from "react";
import Navbar from "./Navbar";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.content}>
        <div style={styles.inner}>{children}</div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    paddingTop: "24px",
    paddingBottom: "40px",
  },
  inner: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 20px",
    width: "100%",
  },
};