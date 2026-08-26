import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Wrench, Shield, Mail, Lock, Eye, EyeOff, ChevronRight } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import "./Login.css";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(`/dashboard/${user.role}`);
    } catch (err) {
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <aside className="login-hero">
        <h1>
          Pilotez vos
          <br />
          performances.
        </h1>
        <p className="login-hero-subtitle">Tableau de bord KPI — Concession Automobile</p>

        <ul className="login-features">
          <li>
            <span className="login-feature-icon">
              <TrendingUp size={20} />
            </span>
            <div>
              <strong>Suivi Commercial en temps réel</strong>
              <p>Ventes VN/VO, chiffre d'affaires et objectifs à portée de main.</p>
            </div>
          </li>
          <li>
            <span className="login-feature-icon">
              <Wrench size={20} />
            </span>
            <div>
              <strong>Pilotage du Service Après-Vente</strong>
              <p>Interventions, délais et satisfaction client centralisés.</p>
            </div>
          </li>
          <li>
            <span className="login-feature-icon">
              <Shield size={20} />
            </span>
            <div>
              <strong>Alertes et objectifs automatiques</strong>
              <p>Notifications proactives dès qu'un KPI dépasse son seuil.</p>
            </div>
          </li>
        </ul>

        <div className="login-preview-card" aria-hidden="true">
          <div className="preview-bar-group">
            <div className="preview-bar-block" />
            <div className="preview-bar-block" />
            <div className="preview-bar-block" />
          </div>
        </div>
      </aside>

      <main className="login-form-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Connexion</h2>
          <p className="login-card-subtitle">Accédez à votre espace de pilotage</p>
          <label className="login-label" htmlFor="email">
            Adresse e-mail
          </label>
          <div className="input-with-icon">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              placeholder="prenom.nom@concession.tn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label className="login-label" htmlFor="password">
            Mot de passe
          </label>
          <div className="input-with-icon">
            <Lock size={18} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
            <ChevronRight size={18} />
          </button>
        </form>

        <p className="login-footer-note">
          <Shield size={14} />
          Plateforme réservée au personnel autorisé
        </p>
      </main>
    </div>
  );
}