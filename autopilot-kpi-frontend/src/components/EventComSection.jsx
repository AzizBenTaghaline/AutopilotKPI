import { useState } from "react";
import { MapPin, Calendar, Users, Plus, X } from "lucide-react";
import apiClient from "../api/client";
import "./EventComSection.css";

const TYPE_LABELS = { salon: "SALON", interne: "INTERNE", campagne: "CAMPAGNE" };

function formatDateRange(debut, fin) {
  const start = new Date(debut);
  const startStr = start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  if (!fin) return startStr;

  const end = new Date(fin);
  const endStr = end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const startDay = start.toLocaleDateString("fr-FR", { day: "numeric" });
  return `${startDay} – ${endStr}`;
}

export default function EventComSection({ events, onEventCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titre: "", type: "salon", lieu: "", date_debut: "", date_fin: "", nb_participants: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiClient.post("/event-coms", {
        titre: form.titre,
        type: form.type,
        lieu: form.lieu,
        date_debut: new Date(form.date_debut).toISOString(),
        date_fin: form.date_fin ? new Date(form.date_fin).toISOString() : null,
        nb_participants: Number(form.nb_participants),
      });
      setForm({ titre: "", type: "salon", lieu: "", date_debut: "", date_fin: "", nb_participants: "" });
      setShowForm(false);
      onEventCreated();
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de la création de l'événement");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="eventcom-section">
      <div className="eventcom-header">
        <div>
          <h2>Événements commerciaux</h2>
          <p className="eventcom-subtitle">Suivi actions terrain &amp; campagnes</p>
        </div>
        <button className="eventcom-add-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Annuler" : "Ajouter un événement"}
        </button>
      </div>

      {showForm && (
        <form className="eventcom-form" onSubmit={handleSubmit}>
          <div className="eventcom-form-row">
            <input
              placeholder="Titre de l'événement"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              required
            />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="salon">Salon</option>
              <option value="interne">Interne</option>
              <option value="campagne">Campagne</option>
            </select>
          </div>
          <div className="eventcom-form-row">
            <input
              placeholder="Lieu"
              value={form.lieu}
              onChange={(e) => setForm({ ...form, lieu: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Nb participants"
              value={form.nb_participants}
              onChange={(e) => setForm({ ...form, nb_participants: e.target.value })}
              required
              min="0"
            />
          </div>
          <div className="eventcom-form-row">
            <label>
              Date début
              <input
                type="date"
                value={form.date_debut}
                onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                required
              />
            </label>
            <label>
              Date fin (optionnel)
              <input
                type="date"
                value={form.date_fin}
                onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
              />
            </label>
          </div>
          {error && <p className="eventcom-error">{error}</p>}
          <button type="submit" className="eventcom-submit" disabled={submitting}>
            {submitting ? "Création..." : "Créer l'événement"}
          </button>
        </form>
      )}

      <div className="eventcom-grid">
        {events.length === 0 && <p className="eventcom-empty">Aucun événement enregistré.</p>}
        {events.map((ev) => (
          <div className="eventcom-card" key={ev.id}>
            <div className="eventcom-card-top">
              <span className={`eventcom-badge badge-${ev.type}`}>{TYPE_LABELS[ev.type]}</span>
            </div>
            <h3>{ev.titre}</h3>
            <div className="eventcom-meta">
              <MapPin size={14} /> {ev.lieu}
            </div>
            <div className="eventcom-meta">
              <Calendar size={14} /> {formatDateRange(ev.date_debut, ev.date_fin)}
            </div>
            <div className="eventcom-footer">
              <Users size={14} /> {ev.nb_participants} participants
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}