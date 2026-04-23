import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { getAllServices } from "../api/serviceApi";
import { getToken } from "../utils/storage";
import { ui } from "../styles/ui";

type AvailableSlot = {
  id: number;
  startTime: string;
  endTime: string;
  booked: boolean;
};

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
  location: string;
  user?: ServiceUser;
  availableSlots?: AvailableSlot[];
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
      const location = service.location?.toLowerCase() ?? "";

      return (
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        ownerName.includes(normalizedSearch) ||
        location.includes(normalizedSearch)
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
      <div style={styles.heroCard}>
        <div style={styles.heroText}>
          <h1 style={ui.title}>Alla tjänster</h1>
          <p style={styles.heroDescription}>
            Hitta vardagstjänster, jämför alternativ och boka en tid som passar.
          </p>
        </div>

        <div style={styles.heroStats}>
          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>{services.length}</span>
            <span style={styles.heroStatLabel}>Totala tjänster</span>
          </div>

          <div style={styles.heroStatCard}>
            <span style={styles.heroStatValue}>
              {filteredAndSortedServices.length}
            </span>
            <span style={styles.heroStatLabel}>Visas just nu</span>
          </div>
        </div>
      </div>

      <section style={ui.section}>
        <div style={styles.filterCard}>
          <div style={styles.filterHeader}>
            <h2 style={ui.sectionTitle}>Sök och filtrera</h2>
            <p style={styles.filterText}>
              Filtrera efter titel, beskrivning, plats eller användare.
            </p>
          </div>

          <div style={styles.filterGrid}>
            <div>
              <label htmlFor="service-search" style={ui.label}>
                Sök
              </label>
              <input
                id="service-search"
                type="text"
                placeholder="Till exempel hundpromenad, Malmö eller Anna"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={ui.input}
              />
            </div>

            <div>
              <label htmlFor="service-sort" style={ui.label}>
                Sortera
              </label>
              <select
                id="service-sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={styles.select}
              >
                <option value="newest">Nyaste först</option>
                <option value="oldest">Äldsta först</option>
                <option value="priceLow">Pris: lägst först</option>
                <option value="priceHigh">Pris: högst först</option>
              </select>
            </div>
          </div>

          <div style={styles.filterFooter}>
            <span style={styles.resultPill}>
              Visar {filteredAndSortedServices.length} av {services.length} tjänster
            </span>
          </div>
        </div>
      </section>

      {error && <p style={ui.error}>{error}</p>}

      {!error && filteredAndSortedServices.length === 0 && (
        <div style={styles.emptyState}>
          <h2 style={styles.emptyStateTitle}>Inga tjänster matchade din sökning</h2>
          <p style={styles.emptyStateText}>
            Testa att söka bredare eller byt sortering för att hitta fler tjänster.
          </p>
        </div>
      )}

      {!error && filteredAndSortedServices.length > 0 && (
        <section style={ui.section}>
          <div style={ui.list}>
            {filteredAndSortedServices.map((service) => {
              const serviceOwnerEmail = service.user?.email?.toLowerCase() ?? "";
              const isOwnService =
                !!currentUserEmail && serviceOwnerEmail === currentUserEmail;

              const availableSlots =
                service.availableSlots?.filter((slot) => !slot.booked) ?? [];

              const totalSlots = service.availableSlots?.length ?? 0;

              return (
                <div key={service.id} style={styles.serviceCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.titleBlock}>
                      <h2 style={styles.title}>{service.title}</h2>
                      <p style={styles.description}>{service.description}</p>
                    </div>

                    <div style={styles.headerMeta}>
                      <span style={isOwnService ? styles.ownBadge : styles.availableBadge}>
                        {isOwnService ? "Din tjänst" : "Bokningsbar"}
                      </span>
                      <span style={styles.priceTag}>{service.price} kr</span>
                    </div>
                  </div>

                  <div style={styles.divider} />

                  <div style={styles.metaGrid}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Plats</span>
                      <span style={styles.metaValue}>{service.location}</span>
                    </div>

                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Utförare</span>
                      <span style={styles.metaValue}>
                        {service.user?.name ?? "Okänd användare"}
                      </span>
                    </div>

                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>E-post</span>
                      <span style={styles.metaSubtle}>
                        {service.user?.email ?? "Ingen e-post"}
                      </span>
                    </div>

                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>
                        {isOwnService ? "Upplagda tider" : "Lediga tider"}
                      </span>
                      <span style={styles.metaValue}>
                        {isOwnService ? totalSlots : availableSlots.length}
                      </span>
                    </div>
                  </div>

                  <div style={styles.divider} />

                  {!isOwnService ? (
                    <div style={styles.cardFooter}>
                      <p style={styles.footerText}>
                        Välj en tjänst för att se lediga tider och fortsätta till bokning.
                      </p>

                      <div style={styles.actionRow}>
                        <button
                          onClick={() => navigate(`/bookings/create/${service.id}`)}
                          style={styles.primaryActionButton}
                        >
                          Se lediga tider
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.cardFooter}>
                      <p style={styles.ownServiceText}>
                        Detta är din egen tjänst och kan därför inte bokas av dig.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  heroCard: {
    background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
    border: "1px solid #dbeafe",
    borderRadius: "24px",
    padding: "28px",
    display: "grid",
    gap: "24px",
    marginBottom: "8px",
    boxShadow: "0 12px 30px rgba(37, 99, 235, 0.08)",
  },
  heroText: {
    display: "grid",
    gap: "10px",
  },
  heroDescription: {
    margin: 0,
    color: "#475569",
    fontSize: "16px",
    lineHeight: 1.6,
    maxWidth: "680px",
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
  },
  heroStatCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
    display: "grid",
    gap: "6px",
  },
  heroStatValue: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#111827",
    lineHeight: 1,
  },
  heroStatLabel: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 600,
  },
  filterCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },
  filterHeader: {
    display: "grid",
    gap: "6px",
    marginBottom: "18px",
  },
  filterText: {
    margin: 0,
    color: "#6b7280",
    lineHeight: 1.5,
  },
  filterGrid: {
    display: "grid",
    gap: "16px",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  filterFooter: {
    marginTop: "18px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  resultPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#334155",
    fontSize: "14px",
    fontWeight: 600,
  },
  emptyState: {
    background: "#ffffff",
    border: "1px dashed #cbd5e1",
    borderRadius: "20px",
    padding: "40px 24px",
    textAlign: "center",
  },
  emptyStateTitle: {
    margin: "0 0 8px 0",
    fontSize: "22px",
    color: "#111827",
  },
  emptyStateText: {
    margin: 0,
    color: "#6b7280",
    lineHeight: 1.6,
  },
  serviceCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
    display: "grid",
    gap: "16px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  titleBlock: {
    display: "grid",
    gap: "8px",
    flex: 1,
    minWidth: "240px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    lineHeight: 1.2,
    color: "#0f172a",
    fontWeight: 800,
  },
  description: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
    maxWidth: "700px",
  },
  headerMeta: {
    display: "grid",
    gap: "10px",
    justifyItems: "end",
  },
  availableBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: "#dcfce7",
    color: "#166534",
  },
  ownBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    background: "#fef3c7",
    color: "#92400e",
  },
  priceTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: "14px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "18px",
    fontWeight: 800,
  },
  divider: {
    height: "1px",
    background: "#e5e7eb",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },
  metaItem: {
    display: "grid",
    gap: "4px",
  },
  metaLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  metaValue: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#111827",
    lineHeight: 1.4,
  },
  metaSubtle: {
    fontSize: "15px",
    color: "#6b7280",
    lineHeight: 1.4,
  },
  cardFooter: {
    display: "grid",
    gap: "14px",
  },
  footerText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.5,
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryActionButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    boxShadow: "0 10px 20px rgba(21, 128, 61, 0.18)",
  },
  ownServiceText: {
    margin: 0,
    color: "#6b7280",
    fontStyle: "italic",
    lineHeight: 1.6,
  },
};