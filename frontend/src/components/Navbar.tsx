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
          <span style={styles.brand}>VardagsFix</span>
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
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  },
  inner: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  brandSection: {
    display: "flex",
    alignItems: "center",
  },
  brand: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "0.3px",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  link: {
    textDecoration: "none",
    color: "#374151",
    padding: "8px 12px",
    borderRadius: "8px",
    fontWeight: 500,
    transition: "background 0.2s ease, color 0.2s ease",
  },
  activeLink: {
    background: "#eff6ff",
    color: "#2563eb",
  },
  actions: {
    display: "flex",
    alignItems: "center",
  },
  logoutButton: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
};