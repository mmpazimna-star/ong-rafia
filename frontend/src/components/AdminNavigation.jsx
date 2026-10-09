import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const Icon = ({ children }) => <span className="admin-nav__icon" aria-hidden="true">{children}</span>;

export default function AdminNavigation() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/admin", { replace: true }); };
  return <aside className="admin-navigation"><div className="admin-brand"><span className="admin-brand__mark">✦</span><span>RAFIA</span></div><p className="admin-navigation__label">GÉNÉRAL</p><nav><NavLink to="/admin/dashboard"><Icon>▦</Icon>Tableau de bord</NavLink><NavLink to="/admin/sites"><Icon>▤</Icon>Contenu du site</NavLink>{user?.role === "admin" ? <><p className="admin-navigation__label">GESTION</p><NavLink to="/admin/users"><Icon>♙</Icon>Utilisateurs</NavLink></> : null}<p className="admin-navigation__label">COMPTE</p><NavLink to="/admin/profile"><Icon>⚙</Icon>Mon profil</NavLink></nav><div className="admin-navigation__footer"><div className="admin-user"><span>{user?.name?.slice(0, 1)?.toUpperCase() || "R"}</span><div><strong>{user?.name || "Responsable"}</strong><small>{user?.role === "admin" ? "Administrateur" : "Éditeur"}</small></div></div><button type="button" onClick={handleLogout}><Icon>⇥</Icon>Déconnexion</button></div></aside>;
}
