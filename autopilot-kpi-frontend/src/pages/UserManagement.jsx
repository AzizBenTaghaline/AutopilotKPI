import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  ArrowLeft,
  User as UserIcon,
  Shield,
  BarChart3,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/errorMessage";
import apiClient from "../api/client";
import { useAuth } from "../auth/AuthContext";
import "./UserManagement.css";

const EMPTY_FORM = {
  email: "",
  password: "",
  full_name: "",
  role: "commercial",
};

const ROLE_LABELS = {
  administrateur: "Administrateur",
  manager: "Manager",
  commercial: "Commercial",
  chef_atelier: "Chef d'atelier",
};

const ROLE_ICONS = {
  administrateur: Shield,
  manager: BarChart3,
  commercial: TrendingUp,
  chef_atelier: Wrench,
};

export default function UserManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selectedId, setSelectedId] = useState(null); // null | "new" | id
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await apiClient.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Erreur de chargement des utilisateurs", err);
    } finally {
      setLoading(false);
    }
  }

  function selectUser(u) {
    setSelectedId(u.id);
    setForm({
      email: u.email,
      password: "",
      full_name: u.full_name,
      role: u.role,
      is_active: u.is_active,
    });
    setError("");
  }

  function startCreate() {
    setSelectedId("new");
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleQuickToggle(e, u) {
    e.stopPropagation();
    try {
      await apiClient.patch(`/users/${u.id}`, { is_active: !u.is_active });
      await loadUsers();
      if (selectedId === u.id)
        setForm((f) => ({ ...f, is_active: !u.is_active }));
    } catch (err) {
      console.error("Erreur lors du changement de statut", err);
    }
  }

  async function handleSave() {
    setError("");
    setSubmitting(true);
    try {
      if (selectedId === "new") {
        await apiClient.post("/users", {
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          role: form.role,
        });
        await loadUsers();
        setSelectedId(null);
      } else {
        await apiClient.patch(`/users/${selectedId}`, {
          full_name: form.full_name,
          role: form.role,
          is_active: form.is_active,
        });
        await loadUsers();
      }
    } catch (err) {
      setError(getErrorMessage(err, "Erreur lors de l'enregistrement"));
    } finally {
      setSubmitting(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const isCreating = selectedId === "new";
  const hasSelection = selectedId !== null;

  function initialsOf(name) {
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  if (loading) {
    return (
      <div className="user-mgmt-loading">Chargement des utilisateurs...</div>
    );
  }

  return (
    <div className="user-management">
      <header className="user-mgmt-topbar">
        <div className="user-mgmt-topbar-left">
          <button
            className="back-btn"
            onClick={() => navigate(`/dashboard/${user.role}`)}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="user-mgmt-icon">
            <UserIcon size={20} />
          </div>
          <div>
            <div className="user-mgmt-title-row">
              <h1>Gestion des utilisateurs</h1>
              <span className="role-pill">ADMINISTRATEUR</span>
            </div>
            <p>Comptes, rôles et accès à la plateforme</p>
          </div>
        </div>
      </header>

      <div className="user-mgmt-body">
        <aside className="user-sidebar">
          <div className="user-sidebar-search">
            <Search size={16} />
            <input
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="user-filter-tabs">
            {[
              "all",
              "administrateur",
              "manager",
              "commercial",
              "chef_atelier",
            ].map((f) => (
              <button
                key={f}
                className={`user-filter-tab ${roleFilter === f ? "active" : ""}`}
                onClick={() => setRoleFilter(f)}
              >
                {f === "all" ? "Tous" : ROLE_LABELS[f]}
              </button>
            ))}
          </div>

          <div className="user-sidebar-list">
            {filteredUsers.length === 0 && (
              <p className="user-sidebar-empty">Aucun utilisateur trouvé.</p>
            )}
            {filteredUsers.map((u) => {
              const RoleIcon = ROLE_ICONS[u.role];
              return (
                <div
                  key={u.id}
                  className={`user-sidebar-item ${selectedId === u.id ? "selected" : ""} ${!u.is_active ? "inactive" : ""}`}
                  onClick={() => selectUser(u)}
                >
                  <div className="user-avatar-sm">
                    {initialsOf(u.full_name)}
                  </div>
                  <div className="user-sidebar-item-info">
                    <strong>{u.full_name}</strong>
                    <span className="user-sidebar-item-meta">
                      {RoleIcon && <RoleIcon size={12} />} {ROLE_LABELS[u.role]}
                    </span>
                  </div>
                  <label
                    className="user-mini-switch"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={u.is_active}
                      onChange={(e) => handleQuickToggle(e, u)}
                    />
                    <span className="user-mini-switch-track" />
                  </label>
                </div>
              );
            })}
          </div>

          <button className="user-add-btn" onClick={startCreate}>
            <Plus size={16} /> Nouvel utilisateur
          </button>
        </aside>

        <main className="user-detail-panel">
          {!hasSelection && (
            <div className="user-detail-placeholder">
              <UserIcon size={32} />
              <p>
                Sélectionnez un utilisateur pour le modifier, ou créez-en un
                nouveau.
              </p>
            </div>
          )}

          {hasSelection && (
            <>
              <div className="user-detail-header">
                <div className="user-detail-header-left">
                  <div className="user-avatar-lg">
                    {isCreating ? "+" : initialsOf(form.full_name || "?")}
                  </div>
                  <div>
                    <h2>
                      {isCreating ? "Créer un utilisateur" : form.full_name}
                    </h2>
                    <p>{isCreating ? "Nouveau compte" : form.email}</p>
                  </div>
                </div>
                {!isCreating && (
                  <span
                    className={`user-status-pill ${form.is_active ? "active" : "inactive"}`}
                  >
                    <span className="dot" />{" "}
                    {form.is_active ? "Actif" : "Inactif"}
                  </span>
                )}
              </div>

              <div className="user-detail-section">
                <h3>
                  <span className="section-bar" />
                  Informations du compte
                </h3>

                <label>
                  Nom complet *
                  <input
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Adresse e-mail *
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    disabled={!isCreating}
                    required
                  />
                </label>

                {isCreating && (
                  <label>
                    Mot de passe initial *
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                      minLength={6}
                    />
                  </label>
                )}

                <label>
                  Rôle *
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="administrateur">Administrateur</option>
                    <option value="manager">Manager</option>
                    <option value="commercial">Commercial</option>
                    <option value="chef_atelier">Chef d'atelier</option>
                  </select>
                </label>
              </div>

              {!isCreating && (
                <div className="user-detail-section">
                  <h3>
                    <span className="section-bar green" />
                    Statut
                  </h3>
                  <label className="user-status-toggle">
                    <span className="user-status-toggle-switch">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) =>
                          setForm({ ...form, is_active: e.target.checked })
                        }
                      />
                      <span className="user-mini-switch-track" />
                    </span>
                    Compte actif — accès autorisé à la plateforme
                  </label>
                </div>
              )}

              {error && <p className="user-detail-error">{error}</p>}

              <div className="user-detail-actions">
                <button
                  className="user-save-btn"
                  onClick={handleSave}
                  disabled={submitting}
                >
                  {submitting
                    ? "Enregistrement..."
                    : isCreating
                      ? "Créer le compte"
                      : "Enregistrer les modifications"}
                </button>
                <button
                  className="user-cancel-btn"
                  onClick={() => setSelectedId(null)}
                >
                  Annuler
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
