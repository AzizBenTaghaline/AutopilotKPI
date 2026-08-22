import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import apiClient from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import "./CommercialDashboard.css";
import EventComSection from "../../components/EventComSection";
import ExcelImportSection from "../../components/ExcelImportSection";

export default function CommercialDashboard() {
  const { user, logout } = useAuth();
  const [dashboardItems, setDashboardItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [devis, setDevis] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [imports, setImports] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          dashboardRes,
          alertsRes,
          devisRes,
          rankingRes,
          eventsRes,
          importsRes,
        ] = await Promise.all([
          apiClient.get("/dashboard"),
          apiClient.get("/alerts"),
          apiClient.get("/devis"),
          apiClient.get("/devis/ranking/commerciaux"),
          apiClient.get("/event-coms"),
          apiClient.get("/imports"),
        ]);
        setDashboardItems(dashboardRes.data);
        setAlerts(alertsRes.data);
        setDevis(devisRes.data);
        setRanking(rankingRes.data);
        setEvents(eventsRes.data);
        setImports(importsRes.data);
      } catch (err) {
        console.error("Erreur de chargement du dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function reloadEvents() {
    const res = await apiClient.get("/event-coms");
    setEvents(res.data);
  }

  async function reloadImports() {
    const [importsRes, dashboardRes] = await Promise.all([
      apiClient.get("/imports"),
      apiClient.get("/dashboard"),
    ]);
    setImports(importsRes.data);
    setDashboardItems(dashboardRes.data);
  }

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  const mainObjective = dashboardItems.find((i) => i.target_value != null);

  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-08"
  const devisThisMonth = devis.filter(
    (d) => d.date_devis.slice(0, 7) === currentMonth,
  );
  const convertedThisMonth = devisThisMonth.filter(
    (d) => d.statut === "converti",
  );
  const tauxTransformation =
    devisThisMonth.length > 0
      ? Math.round((convertedThisMonth.length / devisThisMonth.length) * 100)
      : 0;

  const myPosition = ranking.findIndex((r) => r.is_current_user) + 1; // 0 si absent du classement
  const medal =
    myPosition === 1
      ? "🥇"
      : myPosition === 2
        ? "🥈"
        : myPosition === 3
          ? "🥉"
          : null;

  if (loading) {
    return <div className="dashboard-loading">Chargement...</div>;
  }

  return (
    <div className="commercial-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Bonjour, {user?.full_name}</h1>
          <p className="dashboard-subtitle">
            Commercial —{" "}
            {new Date().toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="dashboard-header-actions">
          <button className="notif-bell">
            <Bell size={20} />
            {alerts.length > 0 && (
              <span className="notif-badge">{alerts.length}</span>
            )}
          </button>
          <div className="avatar" onClick={logout} title="Se déconnecter">
            {initials}
          </div>
        </div>
      </header>

      {mainObjective ? (
        <section className="objective-card">
          <div className="objective-header">
            <h2>Mon objectif du mois</h2>
            <span className="objective-period">{mainObjective.period}</span>
          </div>
          <div className="objective-bar-track">
            <div
              className="objective-bar-fill"
              style={{
                width: `${Math.min(100, ((mainObjective.current_value ?? 0) / mainObjective.target_value) * 100)}%`,
              }}
            />
          </div>
          <div className="objective-footer">
            <div>
              <strong>
                {mainObjective.current_value ?? 0} {mainObjective.unit}
              </strong>{" "}
              réalisés
              <p className="objective-remaining">
                {mainObjective.current_value != null &&
                mainObjective.current_value < mainObjective.target_value
                  ? `Il vous reste ${(mainObjective.target_value - mainObjective.current_value).toFixed(1)} ${mainObjective.unit} pour atteindre votre objectif.`
                  : "Objectif atteint 🎉"}
              </p>
            </div>
            <span className="objective-target">
              Objectif : <strong>{mainObjective.target_value}</strong>
            </span>
          </div>
        </section>
      ) : (
        <p className="dashboard-empty">
          Aucun KPI avec objectif défini pour votre module.
        </p>
      )}

      <section className="commercial-grid">
        <div className="panel">
          <span className="panel-label">Mes devis ce mois</span>
          <strong className="panel-big-value">
            {devisThisMonth.length} devis
          </strong>
          {devisThisMonth.length > 0 ? (
            <>
              <div className="taux-transfo-bar">
                <span>Taux de transformation</span>
                <strong>{tauxTransformation}%</strong>
              </div>
              <p className="panel-note">
                {convertedThisMonth.length} devis convertis en vente
              </p>
            </>
          ) : (
            <p className="panel-note">Aucun devis saisi ce mois-ci.</p>
          )}
        </div>

        <div className="panel">
          <span className="panel-label">Mon classement</span>
          {ranking.length === 0 ? (
            <p className="panel-note">
              Aucune vente convertie ce mois-ci pour établir un classement.
            </p>
          ) : (
            <>
              {myPosition > 0 ? (
                <div className="ranking-badge">
                  {medal ?? `#${myPosition}`}
                  {!medal && <sup>e</sup>}
                </div>
              ) : (
                <p className="panel-note">
                  Vous n'avez pas encore de vente ce mois-ci.
                </p>
              )}
              <p className="panel-note">
                sur {ranking.length} commercial{ranking.length > 1 ? "aux" : ""}{" "}
                ce mois
              </p>
              <ul className="ranking-list">
                {ranking.slice(0, 5).map((r, i) => (
                  <li key={r.user_id} className={r.is_current_user ? "me" : ""}>
                    <span>
                      {i + 1}. {r.full_name}
                    </span>
                    <strong>
                      {r.total_montant.toLocaleString("fr-FR")} DT
                    </strong>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
      <EventComSection events={events} onEventCreated={reloadEvents} />
      <ExcelImportSection
        title="Importer données Excel"
        subtitle="Fichiers KPI Commercial — ventes, devis, objectifs"
        importTypes={[
          {
            value: "kpi_entries",
            label: "KPI Commercial",
            endpoint: "/imports/kpi-entries",
          },
        ]}
        imports={imports}
        onImportDone={reloadImports}
      />
    </div>
  );
}
