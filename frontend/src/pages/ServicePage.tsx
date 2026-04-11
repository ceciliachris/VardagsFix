import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { getAllServices } from "../api/serviceApi";
import { getToken } from "../utils/storage";
import { ui } from "../styles/ui";

type ServiceUser = {
  id: number;
  name: string;
  email: string;
};

type ServiceItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  user?: ServiceUser;
};

type JwtPayload = {
  sub?: string;
};

function getCurrentUserEmail(): string | null {
  const token = getToken();

  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64)) as JwtPayload;
    return decodedPayload.sub?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const currentUserEmail = getCurrentUserEmail();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getAllServices();

        if (Array.isArray(data)) {
          setServices(data);
        } else {
          setError("Ogiltigt svar från servern.");
        }
      } catch (err: any) {
        let message = "Kunde inte hämta tjänster.";

        if (typeof err?.response?.data === "string") {
          message = err.response.data;
        } else if (typeof err?.response?.data?.message === "string") {
          message = err.response.data.message;
        } else if (typeof err?.message === "string") {
          message = err.message;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredAndSortedServices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    let result = [...services].filter((service) => {
      if (!normalizedSearch) return true;

      const title = service.title?.toLowerCase() ?? "";
      const description = service.description?.toLowerCase() ?? "";
      const ownerName = service.user?.name?.toLowerCase() ?? "";

      return (
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        ownerName.includes(normalizedSearch)
      );
    });

    switch (sortOption) {
      case "newest":
        result.sort((a, b) => b.id - a.id);
        break;
      case "oldest":
        result.sort((a, b) => a.id - b.id);
        break;
      case "priceLow":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [services, searchTerm, sortOption]);

  if (loading) {
    return <p style={ui.message}>Laddar tjänster...</p>;
  }

  return (
    <div style={ui.pageWrapper}>
      <div style={ui.topBar}>
        <h1>Alla tjänster</h1>
      </div>

      <div style={styles.filterSection}>
        <input
          type="text"
          placeholder="Sök tjänst, beskrivning eller användare"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        <div style={styles.sortRow}>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={styles.select}
          >
            <option value="newest">Nyaste först</option>
            <option value="oldest">Äldsta först</option>
            <option value="priceLow">Pris: lägst först</option>
            <option value="priceHigh">Pris: högst först</option>
          </select>

          <p style={styles.resultText}>
            Visar {filteredAndSortedServices.length} av {services.length}
          </p>
        </div>
      </div>

      {error && <p style={ui.error}>{error}</p>}

      {!error && filteredAndSortedServices.length === 0 && (
        <p style={ui.message}>Inga tjänster matchade din sökning.</p>
      )}

      {!error && filteredAndSortedServices.length > 0 && (
        <div style={ui.list}>
          {filteredAndSortedServices.map((service) => {
            const serviceOwnerEmail = service.user?.email?.toLowerCase() ?? "";
            const isOwnService =
              !!currentUserEmail && serviceOwnerEmail === currentUserEmail;

            return (
              <div key={service.id} style={ui.card}>
                <h2 style={styles.title}>{service.title}</h2>
                <p style={styles.description}>{service.description}</p>
                <p style={styles.price}>{service.price} kr</p>

                <p style={styles.owner}>
                  Erbjuds av:{" "}
                  <strong>{service.user?.name ?? "Okänd användare"}</strong>
                </p>

                <p style={styles.email}>{service.user?.email ?? ""}</p>

                {!isOwnService && (
                  <button
                    onClick={() =>
                      navigate(`/bookings/create/${service.id}`)
                    }
                    style={styles.bookingButton}
                  >
                    Boka
                  </button>
                )}

                {isOwnService && (
                  <p style={styles.ownServiceText}>
                    Detta är din egen tjänst.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  filterSection: {
    marginBottom: "24px",
  },
  searchInput: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
    marginBottom: "8px",
    boxSizing: "border-box",
  },
  sortRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    background: "#ffffff",
    cursor: "pointer",
  },
  resultText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },
  title: {
    margin: "0 0 8px 0",
  },
  description: {
    margin: "0 0 12px 0",
    color: "#4b5563",
  },
  price: {
    margin: "0 0 10px 0",
    fontWeight: 700,
  },
  owner: {
    margin: "0 0 4px 0",
    color: "#111827",
  },
  email: {
    margin: "0 0 16px 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  bookingButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#5dc9328a",
    cursor: "pointer",
  },
  ownServiceText: {
    margin: 0,
    color: "#6b7280",
    fontStyle: "italic",
  },
};