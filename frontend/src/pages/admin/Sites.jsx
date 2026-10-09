import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { activateSite, cloneSite, listSites } from "../../api/adminSite.js";
import AdminNavigation from "../../components/AdminNavigation.jsx";

const statusLabel = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archive",
};

export default function AdminSites() {
  const { token, logout, user } = useContext(AuthContext);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cloningId, setCloningId] = useState("");
  const [activatingId, setActivatingId] = useState("");
  const navigate = useNavigate();

  const loadSites = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listSites(token);
      setSites(data);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les versions du site.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const draftSites = useMemo(() => sites.filter((site) => site.status === "draft"), [sites]);

  const handleClone = async (siteId, version) => {
    setCloningId(siteId);
    try {
      const cloned = await cloneSite(siteId, `Clone de la version ${version}`, token);
      navigate(`/admin/sites/${cloned._id}/sections/home`);
    } catch (err) {
      setError(err.response?.data?.message || "Le clonage a échoué.");
    } finally {
      setCloningId("");
    }
  };

  const handleActivate = async (site) => {
    if (!window.confirm(`Activer « ${site.description || `Version ${site.version}`} » comme version publique du site ?`)) return;
    setActivatingId(site._id);
    setError("");
    try {
      await activateSite(site._id, token);
      await loadSites();
    } catch (err) {
      setError(err.response?.data?.message || "L’activation a échoué.");
    } finally {
      setActivatingId("");
    }
  };

  return (
    <div className="admin-app"><AdminNavigation /><main className="admin-main">
      <header className="admin-topbar">
        <div>
          <span className="admin-eyebrow">Administration</span>
          <h1>Versions du site</h1>
          <p>Gérez les brouillons, les publications et la version visible sur le site public.</p>
        </div>
      </header>

      {error ? <p className="admin-error">{error}</p> : null}

      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2>Brouillons en cours</h2>
          <span>{draftSites.length} brouillon(s)</span>
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : draftSites.length ? (
          <div className="admin-card-grid">
            {draftSites.map((site) => (
              <article className="admin-card" key={site._id}>
                <span className="admin-badge admin-badge--draft">Brouillon</span>
                <h3>{site.description || `Version ${site.version}`}</h3>
                <p>Version #{site.version}</p>
                <div className="admin-card__actions">
                  <Link className="button button--primary" to={`/admin/sites/${site._id}/sections/home`}>
                    Modifier
                  </Link>
                  <Link className="button button--ghost-dark" to={`/admin/sites/${site._id}/preview`}>
                    Aperçu
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>Aucun brouillon disponible.</p>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2>Toutes les versions</h2>
          <button className="button button--ghost-dark" onClick={loadSites}>
            Actualiser
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Version</th>
                <th>Statut</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site._id}>
                  <td>{site.description || `Version ${site.version}`}</td>
                  <td>#{site.version}</td>
                  <td>{statusLabel[site.status] || site.status}</td>
                  <td>{site.isActive ? "Oui" : "Non"}</td>
                  <td>
                    <div className="admin-table__actions">
                      {site.status === "draft" ? (
                        <Link to={`/admin/sites/${site._id}/sections/home`}>Modifier</Link>
                      ) : (
                        <Link to={`/admin/sites/${site._id}/preview`}>Aperçu</Link>
                      )}
                      {site.status === "published" && !site.isActive && user?.role === "admin" ? (
                        <button
                          type="button"
                          className="admin-action--activate"
                          onClick={() => handleActivate(site)}
                          disabled={activatingId === site._id}
                        >
                          {activatingId === site._id ? "Activation..." : "Activer"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleClone(site._id, site.version)}
                        disabled={cloningId === site._id}
                      >
                        {cloningId === site._id ? "Clonage..." : "Cloner"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main></div>
  );
}
