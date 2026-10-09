import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext.jsx";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, login } = useContext(AuthContext);
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/admin/sites" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await api.post("/api/users/login", { email, password });
      login(res.data.token, res.data.user);
      navigate(res.data.user.mustChangePassword ? "/admin/profile" : "/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Identifiants incorrects");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-auth">
      <div className="admin-auth__panel">
        <span className="admin-eyebrow">ONG RAFIA</span>
        <h1>Espace d’administration</h1>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@rafia.org" />
          </label>
          <label>
            <span>Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
            />
          </label>
          {error ? <p className="admin-error">{error}</p> : null}
          <button className="button button--primary" disabled={submitting}>
            {submitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
