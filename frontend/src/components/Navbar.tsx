import { NavLink, useNavigate } from "react-router-dom";
import { removeToken } from "../utils/storage";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate("/");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.inner}>
        <div style={styles.brandSection}>
          <div style={styles.logoBadge}>VF</div>

          <div style={styles.brandTextBlock}>
            <span style={styles.brand}>VardagsFix</span>
            <span style={styles.brandTag}>Bokning av vardagstjänster</span>
          </div>
        </div>

        <div style={styles.links}>
          <NavLink
            to="/services"
            end
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            Alla tjänster
          </NavLink>

          <NavLink
            to="/services/my"
            end
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            Mina tjänster
          </NavLink>

          <NavLink
            to="/bookings/my"
            end
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            Mina bokningar
          </NavLink>

          <NavLink
            to="/bookings/my-services"
            end
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            Bokningar på mina tjänster
          </NavLink>

          <NavLink
            to="/services/create"
            end
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            Skapa tjänst
          </NavLink>
        </div>

        <div style={styles.actions}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logga ut
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  },
  inner: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    flexWrap: "wrap",
  },
  brandSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: "fit-content",
  },
  logoBadge: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "15px",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
  },
  brandTextBlock: {
    display: "grid",
    gap: "2px",
  },
  brand: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "0.2px",
    lineHeight: 1.2,
  },
  brandTag: {
    fontSize: "12px",
    color: "#6b7280",
    lineHeight: 1.3,
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    flex: 1,
  },
  link: {
    textDecoration: "none",
    color: "#334155",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
  },
  activeLink: {
    background: "#eff6ff",
    color: "#2563eb",
    boxShadow: "inset 0 0 0 1px #dbeafe",
  },
  actions: {
    display: "flex",
    alignItems: "center",
  },
  logoutButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
    minHeight: "42px",
    boxShadow: "0 10px 20px rgba(220, 38, 38, 0.18)",
  },
};