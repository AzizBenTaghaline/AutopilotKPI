import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import apiClient from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import StatCard from "../../components/StatCard";
import "./ChefAtelierDashboard.css";
import ExcelImportSection from "../../components/ExcelImportSection";

export default function ChefAtelierDashboard() {
  const { user, logout } = useAuth();
  const [dashboardItems, setDashboardItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [retoursOuverts, setRetoursOuverts] = useState([]);
  const [reclamations, setReclamations] = useState([]);
  const [orStats, setOrStats] = useState(null);
  const [satisfactionStats, setSatisfactionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imports, setImports] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          dashboardRes,
          alertsRes,
          retoursRes,
          reclamationsRes,
          orStatsRes,
          satisfactionRes,
          importsRes,
        ] = await Promise.all([
          apiClient.get("/dashboard"),
          apiClient.get("/alerts"),
          apiClient.get("/sav-retours?cloture=false"),
          apiClient.get("/sav-reclamations"),
          apiClient.get("/ordres-reparation/stats"),
          apiClient.get("/satisfactions/stats"),
          apiClient.get("/imports"),
        ]);
        setDashboardItems(dashboardRes.data);
        setAlerts(alertsRes.data);
        setRetoursOuverts(retoursRes.data);
        setReclamations(reclamationsRes.data.slice(0, 5));
        setOrStats(orStatsRes.data);
        setSatisfactionStats(satisfactionRes.data);
        setImports(
          importsRes.data.filter((i) =>
            ["sav_retour", "sav_reclamation"].includes(i.entity_type),
          ),
        );
      } catch (err) {
        console.error("Erreur de chargement du dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  async function reloadImports() {
    const [importsRes, retoursRes, reclamationsRes] = await Promise.all([
      apiClient.get("/imports"),
      apiClient.get("/sav-retours?cloture=false"),
      apiClient.get("/sav-reclamations"),
    ]);
    setImports(
      importsRes.data.filter((i) =>
        ["sav_retour", "sav_reclamation"].includes(i.entity_type),
      ),
    );
    setRetoursOuverts(retoursRes.data);
    setReclamations(reclamationsRes.data.slice(0, 5));
  }

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  if (loading) {
    return <div className="dashboard-loading">Chargement...</div>;
  }

  return (
    <div className="chef-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Bonjour, {user?.full_name}</h1>
          <p className="dashboard-subtitle">
            Chef d'atelier —{" "}
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

      {orStats && (
        <section className="or-satisfaction-grid">
          <div className="panel or-panel">
            <span className="panel-label">OR ouverts</span>
            <strong className="panel-big-value">{orStats.ouverts}</strong>
            <p className="panel-note">
              dont <strong>{orStats.sous_garantie}</strong> sous garantie
            </p>
          </div>

          <div className="panel satisfaction-panel">
            <span className="panel-label">Satisfaction client</span>
            {satisfactionStats.nb_saisies > 0 ? (
              <>
                <strong className="panel-big-value">
                  {satisfactionStats.moyenne}%
                </strong>
                <p className="panel-note">
                  Basé sur {satisfactionStats.nb_saisies} saisie(s)
                </p>
              </>
            ) : (
              <p className="panel-note">
                Aucune saisie de satisfaction pour l'instant.
              </p>
            )}
          </div>

          <div className="panel">
            <span className="panel-label">Retours non clôturés</span>
            <strong className="panel-big-value">{retoursOuverts.length}</strong>
            <p className="panel-note">Retours en attente de traitement</p>
          </div>
        </section>
      )}

      {dashboardItems.length > 0 && (
        <section className="stats-grid">
          {dashboardItems.map((item) => {
            const missedTarget =
              item.has_entry &&
              item.target_value != null &&
              ((item.direction === "higher_is_better" &&
                item.current_value < item.target_value) ||
                (item.direction === "lower_is_better" &&
                  item.current_value > item.target_value));

            return (
              <StatCard
                key={item.kpi_id}
                label={item.kpi_name}
                value={
                  item.has_entry
                    ? `${item.current_value} ${item.unit}`
                    : "Aucune saisie"
                }
                accent={missedTarget ? "red" : "green"}
                trend={
                  item.has_entry && item.target_value != null
                    ? {
                        direction: missedTarget ? "down" : "up",
                        text: `Objectif : ${item.target_value} ${item.unit}`,
                      }
                    : null
                }
              />
            );
          })}
        </section>
      )}

      <section className="chef-main-grid">
        <div className="panel">
          <h2>
            Retours non clôturés{" "}
            <span className="count-badge">{retoursOuverts.length}</span>
          </h2>
          {retoursOuverts.length === 0 && (
            <p className="panel-empty">Aucun retour en attente.</p>
          )}
          {retoursOuverts.map((r) => (
            <div className="retour-row" key={r.id}>
              <span>{r.cause}</span>
              <span className="retour-date">
                {new Date(r.date_retour).toLocaleDateString("fr-FR")}
              </span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h2>
            Dernières réclamations{" "}
            <span className="count-badge">{reclamations.length}</span>
          </h2>
          {reclamations.length === 0 && (
            <p className="panel-empty">Aucune réclamation.</p>
          )}
          {reclamations.length > 0 && (
            <table className="reclamations-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Cause</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {reclamations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.client}</td>
                    <td>{r.cause}</td>
                    <td>
                      {new Date(r.date_reclamation).toLocaleDateString("fr-FR")}
                    </td>
                    <td>
                      <span className={`statut-badge statut-${r.statut}`}>
                        {r.statut.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
      <ExcelImportSection
        title="Importer données Excel"
        subtitle="Fichiers SAV — retours et réclamations clients"
        importTypes={[
          {
            value: "sav_retours",
            label: "Retours SAV",
            endpoint: "/imports/sav-retours",
          },
          {
            value: "sav_reclamations",
            label: "Réclamations SAV",
            endpoint: "/imports/sav-reclamations",
          },
        ]}
        imports={imports}
        onImportDone={reloadImports}
      />
    </div>
  );
}
