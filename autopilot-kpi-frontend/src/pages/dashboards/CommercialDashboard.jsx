import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import apiClient from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import "./CommercialDashboard.css";

export default function CommercialDashboard() {
  const { user, logout } = useAuth();
  const [dashboardItems, setDashboardItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
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
      } catch (err) {
        console.error("Erreur de chargement du dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const mainObjective = dashboardItems.find((i) => i.target_value != null);

  if (loading) {
    return <div className="dashboard-loading">Chargement...</div>;
  }

  return (
    <div className="commercial-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Bonjour, {user?.full_name}</h1>
          <p className="dashboard-subtitle">
            Commercial — {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="dashboard-header-actions">
          <button className="notif-bell">
            <Bell size={20} />
            {alerts.length > 0 && <span className="notif-badge">{alerts.length}</span>}
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
              <strong>{mainObjective.current_value ?? 0} {mainObjective.unit}</strong> réalisés
              <p className="objective-remaining">
                {mainObjective.current_value != null && mainObjective.current_value < mainObjective.target_value
                  ? `Il vous reste ${(mainObjective.target_value - mainObjective.current_value).toFixed(1)} ${mainObjective.unit} pour atteindre votre objectif.`
                  : "Objectif atteint 🎉"}
              </p>
            </div>
            <span className="objective-target">Objectif : <strong>{mainObjective.target_value}</strong></span>
          </div>
        </section>
      ) : (
        <p className="dashboard-empty">Aucun KPI avec objectif défini pour votre module.</p>
      )}
    </div>
  );
}