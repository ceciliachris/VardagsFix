import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllServices, updateService } from "../api/serviceApi";
import { ui } from "../styles/ui";

type ServiceItem = {
  id: number;
  title: string;
  description: string;
  price: number;
};

export default function EditServicePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const services = await getAllServices();
        const service = (services as ServiceItem[]).find((s) => s.id === Number(id));

        if (!service) {
          setError("Tjänsten hittades inte.");
          return;
        }

        setTitle(service.title);
        setDescription(service.description);
        setPrice(service.price.toString());
      } catch (err: any) {
        console.error(err);

        let message = "Kunde inte hämta tjänsten.";

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

    fetchService();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const numericPrice = Number(price);

    if (!trimmedTitle) {
      setError("Titel måste fyllas i.");
      return;
    }

    if (!trimmedDescription) {
      setError("Beskrivning måste fyllas i.");
      return;
    }

    if (Number.isNaN(numericPrice)) {
      setError("Pris måste vara ett giltigt nummer.");
      return;
    }

    if (numericPrice <= 0) {
      setError("Pris måste vara större än 0.");
      return;
    }

    setSaving(true);

    try {
      await updateService(Number(id), {
        title: trimmedTitle,
        description: trimmedDescription,
        price: numericPrice,
      });

      navigate("/services/my");
    } catch (err: any) {
      console.error(err);

      let message = "Kunde inte uppdatera tjänsten.";

      if (typeof err?.response?.data === "string") {
        message = err.response.data;
      } else if (typeof err?.response?.data?.message === "string") {
        message = err.response.data.message;
      } else if (typeof err?.message === "string") {
        message = err.message;
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={ui.message}>Laddar...</p>;
  }

  return (
    <div style={ui.formWrapper}>
      <form onSubmit={handleSubmit} style={ui.formCard}>
        <h1>Redigera tjänst</h1>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={ui.input}
          placeholder="Titel"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={ui.textarea}
          placeholder="Beskrivning"
          required
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={ui.input}
          placeholder="Pris"
          min="1"
          required
        />

        <div style={ui.buttonRow}>
          <button type="submit" disabled={saving} style={ui.primaryBlueButton}>
            {saving ? "Sparar..." : "Spara"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/services/my")}
            disabled={saving}
            style={ui.secondaryButton}
          >
            Avbryt
          </button>
        </div>

        {error && <p style={ui.error}>{error}</p>}
      </form>
    </div>
  );
}