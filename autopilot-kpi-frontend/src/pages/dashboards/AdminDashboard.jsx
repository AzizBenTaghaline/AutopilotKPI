import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import apiClient from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import StatCard from "../../components/StatCard";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [imports, setImports] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [usersRes, importsRes, kpisRes, alertsRes, auditRes] = await Promise.all([
          apiClient.get("/users"),
          apiClient.get("/imports"),
          apiClient.get("/kpis"),
          apiClient.get("/alerts"),
          apiClient.get("/audit-logs?limit=5"),
        ]);
        setUsers(usersRes.data);
        setImports(importsRes.data);
        setKpis(kpisRes.data);
        setAlerts(alertsRes.data);
        setAuditLogs(auditRes.data);
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

  if (loading) {
    return <div className="dashboard-loading">Chargement...</div>;
  }

  const activeUsers = users.filter((u) => u.is_active);
  const activeKpis = kpis.filter((k) => k.is_active);
  const configuredThresholds = activeKpis.filter((k) => k.target_value != null && k.direction != null);
  const lastImport = imports[0]; // déjà trié du plus récent au plus ancien par l'API

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Bonjour, {user?.full_name}</h1>
          <p className="dashboard-subtitle">
            Administrateur système — {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="dashboard-header-actions">
          <Shield size={20} className="shield-icon" />
          <div className="avatar" onClick={logout} title="Se déconnecter">
            {initials}
          </div>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard
          label="Utilisateurs actifs"
          value={`${activeUsers.length} / ${users.length}`}
          trend={{ direction: "up", text: `${users.length - activeUsers.length} compte(s) inactif(s)` }}
        />
        <StatCard
          label="Dernier import Excel"
          value={lastImport ? new Date(lastImport.created_at).toLocaleDateString("fr-FR") : "Aucun"}
          trend={lastImport ? { direction: "up", text: `${lastImport.nb_lignes_succes} ligne(s) réussie(s)` } : null}
        />
        <StatCard
          label="KPI actifs"
          value={`${activeKpis.length} / ${kpis.length}`}
          trend={{ direction: "up", text: `${kpis.length - activeKpis.length} indicateur(s) désactivé(s)` }}
        />
        <StatCard
          label="Seuils configurés"
          value={`${configuredThresholds.length}`}
          trend={{ direction: alerts.length > 0 ? "down" : "up", text: `${alerts.length} alerte(s) déclenchée(s)` }}
        />
      </section>

      <section className="admin-main-grid">
        <div className="panel">
          <h2>Activité récente</h2>
          {auditLogs.length === 0 && <p className="panel-empty">Aucune activité récente.</p>}
          {auditLogs.map((log) => (
            <div className="activity-row" key={log.id}>
              <span className="activity-dot" />
              <div>
                <strong>{log.action.replace(/_/g, " ")}</strong>
                <p>{new Date(log.created_at).toLocaleString("fr-FR")} — {log.performed_by_email}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="panel">
          <h2>Utilisateurs</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Rôle</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name}</td>
                  <td><span className="role-badge">{u.role.replace("_", " ")}</span></td>
                  <td>
                    <span className={`statut-dot ${u.is_active ? "active" : "inactive"}`} />
                    {u.is_active ? "Actif" : "Inactif"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}