import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { changePassword } from "../../api/users.js";
import AdminNavigation from "../../components/AdminNavigation.jsx";

export default function AdminProfile() {
  const { token, user, updateCurrentUser } = useContext(AuthContext);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmation: "" });
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const submit = async (event) => { event.preventDefault(); setError(""); setFeedback(""); try { const response = await changePassword(token, form); updateCurrentUser({ ...user, mustChangePassword: false }); setFeedback(response.message); setForm({ currentPassword: "", newPassword: "", confirmation: "" }); } catch (err) { setError(err.response?.data?.message || "Modification impossible."); } };
  return <div className="admin-app"><AdminNavigation /><main className="admin-main"><header className="admin-page-header"><div><span className="admin-eyebrow">MON COMPTE</span><h1>{user?.name}</h1><p>{user?.email} · {user?.role === "admin" ? "Administrateur" : "Éditeur"}</p></div></header><section className="admin-panel admin-panel--profile"><h2>Modifier mon mot de passe</h2>{user?.mustChangePassword ? <p className="admin-error">Votre administrateur a réinitialisé votre mot de passe : choisissez-en un nouveau avant de poursuivre.</p> : null}{feedback ? <p className="admin-success">{feedback}</p> : null}{error ? <p className="admin-error">{error}</p> : null}<form className="admin-form" onSubmit={submit}><label><span>Mot de passe actuel</span><input required type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /></label><label><span>Nouveau mot de passe</span><input required minLength="10" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} /></label><label><span>Confirmation</span><input required type="password" value={form.confirmation} onChange={(e) => setForm({ ...form, confirmation: e.target.value })} /></label><p className="admin-hint">Au moins 10 caractères, avec une majuscule, une minuscule et un chiffre.</p><button className="button button--primary">Enregistrer le mot de passe</button></form></section></main></div>;
}
