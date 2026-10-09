import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { getAssetUrl, getSite } from "../../api/adminSite.js";
import PublicSiteView from "../../components/PublicSiteView.jsx";

export default function SitePreview() {
  const { siteId } = useParams();
  const { token } = useContext(AuthContext);
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSite = async () => {
      try {
        const data = await getSite(siteId, token);
        setSite(data);
      } finally {
        setLoading(false);
      }
    };

    loadSite();
  }, [siteId, token]);

  if (loading) {
    return <div className="admin-page-state">Chargement de l’aperçu…</div>;
  }

  if (!site) {
    return <div className="admin-page-state">Version introuvable.</div>;
  }

  return (
    <div>
      <header className="admin-preview-bar">
        <div className="admin-preview-bar__identity">
          <span className={`admin-badge admin-badge--${site.status}`}>{site.status === "draft" ? "Brouillon" : site.isActive ? "Version active" : "Publiée"}</span>
          <div>
            <span className="admin-eyebrow">APERÇU DU SITE</span>
            <h1>{site.description || `Version ${site.version}`}</h1>
          </div>
        </div>
        <div className="admin-preview-bar__actions">
          {site.status === "draft" ? (
            <Link className="button button--ghost-dark" to={`/admin/sites/${siteId}/sections/home`}>
              Modifier le brouillon
            </Link>
          ) : (
            <Link className="button button--ghost-dark" to="/admin/sites">
              Fermer l’aperçu
            </Link>
          )}
        </div>
      </header>

      <PublicSiteView
        siteData={site.content}
        getImageUrl={(relativePath) => getAssetUrl(site._id, site.status, relativePath)}
        showAdminEntry={false}
      />
    </div>
  );
}
