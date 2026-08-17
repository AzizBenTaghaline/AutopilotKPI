import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Bell, Upload, Trophy, FileText, ChevronRight } from "lucide-react";
import apiClient from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import StatCard from "../../components/StatCard";
import "./ManagerDashboard.css";

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardItems, setDashboardItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardRes, alertsRes] = await Promise.all([
          apiClient.get("/dashboard"),
          apiClient.get("/alerts"),
        ]);
        setDashboardItems(dashboardRes.data);
        setAlerts(alertsRes.data);
        await loadChartData(dashboardRes.data);
      } catch (err) {
        console.error("Erreur de chargement du dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Construit la courbe d'évolution à partir de l'historique de saisies
  // du premier KPI Commercial et du premier KPI SAV trouvés.
  async function loadChartData(items) {
    const comKpi = items.find((i) => i.module === "commercial");
    const savKpi = items.find((i) => i.module === "sav");
    if (!comKpi && !savKpi) return;

    const [comEntries, savEntries] = await Promise.all([
      comKpi ? apiClient.get(`/kpi-entries?kpi_id=${comKpi.kpi_id}`) : Promise.resolve({ data: [] }),
      savKpi ? apiClient.get(`/kpi-entries?kpi_id=${savKpi.kpi_id}`) : Promise.resolve({ data: [] }),
    ]);

    // Ne garde que la saisie la plus récente par période (l'historique
    // peut contenir plusieurs corrections pour une même période)
    const latestByPeriod = (entries) => {
      const map = new Map();
      for (const e of entries) {
        if (!map.has(e.period)) map.set(e.period, e.value); // déjà trié du + récent au + ancien par l'API
      }
      return map;
    };

    const comByPeriod = latestByPeriod(comEntries.data);
    const savByPeriod = latestByPeriod(savEntries.data);
    const periods = [...new Set([...comByPeriod.keys(), ...savByPeriod.keys()])].sort();

    setChartData(
      periods.map((period) => ({
        period,
        Commercial: comByPeriod.get(period) ?? null,
        SAV: savByPeriod.get(period) ?? null,
      }))
    );
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  if (loading) {
    return <div className="dashboard-loading">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="manager-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Bonjour, {user?.full_name}</h1>
          <p className="dashboard-subtitle">
            Manager — {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="dashboard-header-actions">
          <button className="period-select">Ce mois</button>
          <button className="notif-bell">
            <Bell size={20} />
            {alerts.length > 0 && <span className="notif-badge">{alerts.length}</span>}
          </button>
          <div className="avatar" onClick={logout} title="Se déconnecter">
            {initials}
          </div>
        </div>
      </header>

      {alerts.length > 0 && (
        <div className="alert-banner">
          <span>⚠ {alerts.length} alerte{alerts.length > 1 ? "s" : ""} active{alerts.length > 1 ? "s" : ""} nécessite{alerts.length > 1 ? "nt" : ""} votre attention</span>
          <a href="#alerts-section">Voir les alertes <ChevronRight size={14} /></a>
        </div>
      )}

      <section className="stats-grid">
        {dashboardItems.map((item) => {
          const missedTarget =
            item.has_entry &&
            item.target_value != null &&
            ((item.direction === "higher_is_better" && item.current_value < item.target_value) ||
              (item.direction === "lower_is_better" && item.current_value > item.target_value));

          return (
            <StatCard
              key={item.kpi_id}
              label={item.kpi_name}
              value={item.has_entry ? `${item.current_value} ${item.unit}` : "Aucune saisie"}
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

      <section className="dashboard-main-grid">
        <div className="chart-panel">
          <h2>Évolution CA — historique</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Commercial" stroke="var(--green)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="SAV" stroke="var(--orange)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty">Pas encore assez de données pour tracer une courbe.</p>
          )}
        </div>

        <div className="alerts-panel" id="alerts-section">
          <h2>Alertes actives {alerts.length > 0 && <span className="alerts-count">{alerts.length}</span>}</h2>
          {alerts.length === 0 && <p className="alerts-empty">Aucune alerte active.</p>}
          {alerts.map((alert) => (
            <div className="alert-item" key={alert.id}>
              <strong>{alert.kpi_name}</strong>
              <p>
                Valeur : {alert.actual_value} — Objectif : {alert.target_value} ({alert.period})
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="quick-actions">
        <button className="quick-action primary">
          <Upload size={18} /> Importer Excel du mois
        </button>
        <button className="quick-action">
          <Trophy size={18} /> Voir classement commerciaux
        </button>
        <button className="quick-action">
          <FileText size={18} /> Rapport mensuel
        </button>
      </section>
    </div>
  );
}