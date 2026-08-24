import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  ArrowLeft,
  TrendingUp,
  Wrench,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../auth/AuthContext";
import "./KpiManagement.css";

const EMPTY_FORM = {
  code: "",
  name: "",
  description: "",
  module: "commercial",
  periodicity: "monthly",
  unit: "",
  target_value: "",
  direction: "higher_is_better",
  is_active: true,
};

const MODULE_ICONS = { commercial: TrendingUp, sav: Wrench };

export default function KpiManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all"); // all | commercial | sav

  const [selectedId, setSelectedId] = useState(null); // null = aucune sélection, "new" = création
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadKpis();
  }, []);

  async function loadKpis() {
    setLoading(true);
    try {
      const res = await apiClient.get("/kpis");
      setKpis(res.data);
    } catch (err) {
      console.error("Erreur de chargement des KPI", err);
    } finally {
      setLoading(false);
    }
  }

  function selectKpi(kpi) {
    setSelectedId(kpi.id);
    setForm({
      code: kpi.code,
      name: kpi.name,
      description: kpi.description,
      module: kpi.module,
      periodicity: kpi.periodicity,
      unit: kpi.unit,
      target_value: kpi.target_value ?? "",
      direction: kpi.direction ?? "higher_is_better",
      is_active: kpi.is_active,
    });
    setError("");
  }

  function startCreate() {
    setSelectedId("new");
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleQuickToggle(e, kpi) {
    e.stopPropagation(); // évite de sélectionner la ligne en cliquant le switch
    try {
      await apiClient.patch(`/kpis/${kpi.id}`, { is_active: !kpi.is_active });
      await loadKpis();
      if (selectedId === kpi.id)
        setForm((f) => ({ ...f, is_active: !kpi.is_active }));
    } catch (err) {
      console.error("Erreur lors du changement de statut", err);
    }
  }

  async function handleSave() {
    setError("");
    setSubmitting(true);
    try {
      if (selectedId === "new") {
        const res = await apiClient.post("/kpis", {
          code: form.code,
          name: form.name,
          description: form.description,
          module: form.module,
          periodicity: form.periodicity,
          unit: form.unit,
          target_value:
            form.target_value === "" ? null : Number(form.target_value),
          direction: form.target_value === "" ? null : form.direction,
        });
        await loadKpis();
        selectKpi(res.data);
      } else {
        await apiClient.patch(`/kpis/${selectedId}`, {
          name: form.name,
          description: form.description,
          unit: form.unit,
          target_value:
            form.target_value === "" ? null : Number(form.target_value),
          is_active: form.is_active,
        });
        await loadKpis();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Supprimer définitivement le KPI "${form.name}" ? Cette action est irréversible.`,
      )
    ) {
      return;
    }
    try {
      await apiClient.delete(`/kpis/${selectedId}`);
      setSelectedId(null);
      await loadKpis();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la suppression");
    }
  }

  const filteredKpis = kpis.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.code.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === "all" || k.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const roleLabel =
    user?.role === "administrateur" ? "ADMINISTRATEUR" : "MANAGER";
  const isCreating = selectedId === "new";
  const hasSelection = selectedId !== null;

  if (loading) {
    return <div className="kpi-mgmt-loading">Chargement du catalogue...</div>;
  }

  return (
    <div className="kpi-management">
      <header className="kpi-mgmt-topbar">
        <div className="kpi-mgmt-topbar-left">
          <button
            className="back-btn"
            onClick={() => navigate(`/dashboard/${user.role}`)}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="kpi-mgmt-icon">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="kpi-mgmt-title-row">
              <h1>Gestion des KPI</h1>
              <span className="role-pill">{roleLabel}</span>
            </div>
            <p>Catalogue des indicateurs de performance</p>
          </div>
        </div>
      </header>

      <div className="kpi-mgmt-body">
        <aside className="kpi-sidebar">
          <div className="kpi-sidebar-search">
            <Search size={16} />
            <input
              placeholder="Rechercher un indicateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="kpi-filter-tabs">
            {["all", "commercial", "sav"].map((f) => (
              <button
                key={f}
                className={`kpi-filter-tab ${moduleFilter === f ? "active" : ""}`}
                onClick={() => setModuleFilter(f)}
              >
                {f === "all"
                  ? "Tous"
                  : f === "commercial"
                    ? "Commercial"
                    : "SAV"}
              </button>
            ))}
          </div>

          <div className="kpi-sidebar-list">
            {filteredKpis.length === 0 && (
              <p className="kpi-sidebar-empty">Aucun indicateur trouvé.</p>
            )}
            {filteredKpis.map((kpi) => {
              const Icon = MODULE_ICONS[kpi.module];
              return (
                <div
                  key={kpi.id}
                  className={`kpi-sidebar-item ${selectedId === kpi.id ? "selected" : ""} ${!kpi.is_active ? "inactive" : ""}`}
                  onClick={() => selectKpi(kpi)}
                >
                  <span
                    className={`kpi-dot ${kpi.is_active ? "active" : ""}`}
                  />
                  <div className="kpi-sidebar-item-info">
                    <div className="kpi-sidebar-item-top">
                      <span className="kpi-code-badge">{kpi.code}</span>
                      {!kpi.is_active && (
                        <span className="kpi-inactive-badge">Inactif</span>
                      )}
                    </div>
                    <strong>{kpi.name}</strong>
                    <span className="kpi-sidebar-item-meta">
                      {Icon && <Icon size={12} />}{" "}
                      {kpi.module === "commercial" ? "Commercial" : "SAV"}
                    </span>
                  </div>
                  <label
                    className="kpi-mini-switch"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={kpi.is_active}
                      onChange={(e) => handleQuickToggle(e, kpi)}
                    />
                    <span className="kpi-mini-switch-track" />
                  </label>
                </div>
              );
            })}
          </div>

          <button className="kpi-add-btn" onClick={startCreate}>
            <Plus size={16} /> Ajouter un KPI
          </button>
        </aside>

        <main className="kpi-detail-panel">
          {!hasSelection && (
            <div className="kpi-detail-placeholder">
              <BarChart3 size={32} />
              <p>
                Sélectionnez un indicateur pour le modifier, ou créez-en un
                nouveau.
              </p>
            </div>
          )}

          {hasSelection && (
            <>
              <div className="kpi-detail-header">
                <div className="kpi-detail-header-left">
                  <div className="kpi-detail-icon">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <div className="kpi-detail-title-row">
                      <h2>
                        {isCreating
                          ? "Créer un nouvel indicateur"
                          : "Modifier l'indicateur"}
                      </h2>
                      {!isCreating && (
                        <span className="kpi-code-badge">{form.code}</span>
                      )}
                    </div>
                    <p>Paramétrage du KPI</p>
                  </div>
                </div>
                {!isCreating && (
                  <span
                    className={`kpi-status-pill ${form.is_active ? "active" : "inactive"}`}
                  >
                    <span className="dot" />{" "}
                    {form.is_active ? "Actif" : "Inactif"}
                  </span>
                )}
              </div>

              <div className="kpi-detail-section">
                <h3>
                  <span className="section-bar" />
                  Informations générales
                </h3>

                <label>
                  Nom de l'indicateur *
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Description
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </label>

                <div className="kpi-detail-row">
                  <label>
                    Module *
                    <select
                      value={form.module}
                      onChange={(e) =>
                        setForm({ ...form, module: e.target.value })
                      }
                      disabled={!isCreating}
                    >
                      <option value="commercial">Commercial</option>
                      <option value="sav">SAV</option>
                    </select>
                  </label>
                  <label>
                    Unité de mesure
                    <input
                      value={form.unit}
                      onChange={(e) =>
                        setForm({ ...form, unit: e.target.value })
                      }
                      placeholder="%, jours, DT..."
                    />
                  </label>
                </div>

                <label>
                  Fréquence de calcul
                  <select
                    value={form.periodicity}
                    onChange={(e) =>
                      setForm({ ...form, periodicity: e.target.value })
                    }
                    disabled={!isCreating}
                  >
                    <option value="daily">Journalière</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                    <option value="free">Libre</option>
                  </select>
                </label>

                {isCreating && (
                  <label>
                    Code *
                    <input
                      value={form.code}
                      onChange={(e) =>
                        setForm({ ...form, code: e.target.value })
                      }
                      placeholder="COM-03"
                      required
                    />
                  </label>
                )}
              </div>

              <div className="kpi-detail-section">
                <h3>
                  <span className="section-bar orange" />
                  Objectif
                </h3>
                <div className="kpi-detail-row">
                  <label>
                    Valeur cible (optionnel)
                    <input
                      type="number"
                      step="any"
                      value={form.target_value}
                      onChange={(e) =>
                        setForm({ ...form, target_value: e.target.value })
                      }
                      placeholder="85"
                    />
                  </label>
                  {form.target_value !== "" && (
                    <label>
                      Sens de l'objectif
                      <select
                        value={form.direction}
                        onChange={(e) =>
                          setForm({ ...form, direction: e.target.value })
                        }
                        disabled={!isCreating}
                      >
                        <option value="higher_is_better">
                          Plus haut = mieux
                        </option>
                        <option value="lower_is_better">
                          Plus bas = mieux
                        </option>
                      </select>
                    </label>
                  )}
                </div>
              </div>

              {!isCreating && (
                <div className="kpi-detail-section">
                  <h3>
                    <span className="section-bar green" />
                    Statut
                  </h3>
                  <label className="kpi-status-toggle">
                    <span className="kpi-status-toggle-switch">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) =>
                          setForm({ ...form, is_active: e.target.checked })
                        }
                      />
                      <span className="kpi-mini-switch-track" />
                    </span>
                    KPI actif — affiché dans les tableaux de bord
                  </label>
                </div>
              )}

              {error && <p className="kpi-detail-error">{error}</p>}

              <div className="kpi-detail-actions">
                <button
                  className="kpi-save-btn"
                  onClick={handleSave}
                  disabled={submitting}
                >
                  {submitting
                    ? "Enregistrement..."
                    : isCreating
                      ? "Créer le KPI"
                      : "Enregistrer les modifications"}
                </button>
                <button
                  className="kpi-cancel-btn"
                  onClick={() => setSelectedId(null)}
                >
                  Annuler
                </button>
                {!isCreating && (
                  <button className="kpi-delete-btn" onClick={handleDelete}>
                    <Trash2 size={15} /> Supprimer le KPI
                  </button>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
