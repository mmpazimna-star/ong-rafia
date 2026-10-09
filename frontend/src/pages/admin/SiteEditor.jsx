import { useContext, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import {
  activateSite,
  getAssetUrl,
  getSite,
  patchSiteSection,
  publishSite,
} from "../../api/adminSite.js";
import { createDefaultSection, sectionEntries } from "./adminSections.js";

const cloneValue = (value) => JSON.parse(JSON.stringify(value));
const ARRAY_SECTIONS = ["activities", "projects", "team", "news"];
const OBJECT_SECTIONS = ["contact", "donation"];
const FIELD_LABELS = {
  address: "Adresse",
  phone: "Téléphone",
  email: "Adresse e-mail",
  whatsapp: "WhatsApp (lien ou numéro international)",
  facebook: "Lien Facebook",
  instagram: "Lien Instagram",
  linkedin: "Lien LinkedIn",
  twitter: "Lien X / Twitter",
  youtube: "Lien YouTube",
};

const emptyArrayItem = {
  activities: { title: "", text: "", icon: null },
  projects: { title: "", description: "", largeImage: null, smallImage: null },
  team: { name: "", job: "", img: null },
  news: { name: "", text: "", img: null },
};

const buildFilesForSection = (sectionKey, pendingFiles) => {
  switch (sectionKey) {
    case "home":
      return pendingFiles.homeImage ? [{ field: "home", file: pendingFiles.homeImage }] : [];
    case "about":
      return []
        .concat(pendingFiles.aboutImage ? [{ field: "about", file: pendingFiles.aboutImage }] : [])
        .concat(Object.entries(pendingFiles.aboutItemImages || {}).map(([index, file]) => ({ field: "aboutitems", file, index: Number(index) })));
    case "activities":
      return Object.entries(pendingFiles.activityImages || {})
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([index, file]) => ({ field: "activities", file, index: Number(index) }));
    case "projects":
      return []
        .concat(Object.entries(pendingFiles.projectLarge || {}).map(([index, file]) => ({ field: "projectsl", file, index: Number(index) })))
        .concat(Object.entries(pendingFiles.projectSmall || {}).map(([index, file]) => ({ field: "projectss", file, index: Number(index) })))
        .sort((a, b) => a.index - b.index);
    case "team":
      return Object.entries(pendingFiles.teamImages || {})
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([index, file]) => ({ field: "team", file, index: Number(index) }));
    case "news":
      return Object.entries(pendingFiles.newsImages || {})
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([index, file]) => ({ field: "news", file, index: Number(index) }));
    default:
      return [];
  }
};

const normalizeSection = (sectionKey, site) => {
  const source = site && site.content ? site.content[sectionKey] : null;
  if (source == null) {
    return createDefaultSection(sectionKey);
  }
  const clonedSource = cloneValue(source);
  return OBJECT_SECTIONS.includes(sectionKey)
    ? { ...createDefaultSection(sectionKey), ...clonedSource }
    : clonedSource;
};

function ObjectSectionFields({ value, onChange }) {
  const updateField = (field, fieldValue) => onChange({ ...value, [field]: fieldValue });

  return (
    <div className="admin-fields">
      {Object.entries(value).map(([key, fieldValue]) => (
        <label key={key}>
          <span>{FIELD_LABELS[key] || key}</span>
          <input value={fieldValue || ""} onChange={(e) => updateField(key, e.target.value)} />
        </label>
      ))}
    </div>
  );
}

function CurrentImage({ siteId, image, alt = "Image actuelle", label = "Image actuelle" }) {
  if (!image?.path) return null;
  return (
    <div className="admin-image-preview">
      <span>{label}</span>
      <img src={getAssetUrl(siteId, "draft", image.path)} alt={alt} />
    </div>
  );
}

function ArraySectionFields({ sectionKey, siteId, items, onChange, onFileChange }) {
  const addItem = () => onChange([...(items || []), cloneValue(emptyArrayItem[sectionKey])]);
  const updateItem = (index, nextItem) => {
    const nextItems = [...items];
    nextItems[index] = nextItem;
    onChange(nextItems);
  };
  const removeItem = (index) => {
    onChange(items.filter((_, itemIndex) => itemIndex != index));
  };

  return (
    <div className="admin-stack">
      {(items || []).map((item, index) => (
        <div className="admin-repeatable" key={sectionKey + "-" + index}>
          <div className="admin-repeatable__header">
            <strong>{sectionKey + " #" + (index + 1)}</strong>
            <button type="button" onClick={() => removeItem(index)}>
              Supprimer
            </button>
          </div>

          {sectionKey === "activities" ? (
            <div className="admin-fields">
              <label>
                <span>Titre</span>
                <input value={item.title || ""} onChange={(e) => updateItem(index, { ...item, title: e.target.value })} />
              </label>
              <label className="admin-fields__full">
                <span>Image de l’activité</span>
                <input type="file" accept="image/*" onChange={(e) => onFileChange("activityImages", index, e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              </label>
              <CurrentImage siteId={siteId} image={item.icon} alt={item.title || "Illustration de l’activité"} />
              <label className="admin-fields__full">
                <span>Texte</span>
                <textarea value={item.text || ""} rows="4" onChange={(e) => updateItem(index, { ...item, text: e.target.value })} />
              </label>
            </div>
          ) : null}

          {sectionKey === "projects" ? (
            <div className="admin-fields">
              <label className="admin-fields__full">
                <span>Titre</span>
                <input value={item.title || ""} onChange={(e) => updateItem(index, { ...item, title: e.target.value })} />
              </label>
              <label className="admin-fields__full">
                <span>Description</span>
                <textarea value={item.description || ""} rows="4" onChange={(e) => updateItem(index, { ...item, description: e.target.value })} />
              </label>
              <label>
                <span>Grande image</span>
                <input type="file" accept="image/*" onChange={(e) => onFileChange("projectLarge", index, e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              </label>
              <CurrentImage siteId={siteId} image={item.largeImage} alt={item.title || "Grande image du projet"} label="Grande image actuelle" />
              <label>
                <span>Petite image</span>
                <input type="file" accept="image/*" onChange={(e) => onFileChange("projectSmall", index, e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              </label>
              <CurrentImage siteId={siteId} image={item.smallImage} alt={item.title || "Petite image du projet"} label="Petite image actuelle" />
            </div>
          ) : null}

          {sectionKey === "team" ? (
            <div className="admin-fields">
              <label>
                <span>Nom</span>
                <input value={item.name || ""} onChange={(e) => updateItem(index, { ...item, name: e.target.value })} />
              </label>
              <label>
                <span>Fonction</span>
                <input value={item.job || ""} onChange={(e) => updateItem(index, { ...item, job: e.target.value })} />
              </label>
              <label className="admin-fields__full">
                <span>Photo</span>
                <input type="file" accept="image/*" onChange={(e) => onFileChange("teamImages", index, e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              </label>
              <CurrentImage siteId={siteId} image={item.img} alt={item.name || "Membre de l’équipe"} />
            </div>
          ) : null}

          {sectionKey === "news" ? (
            <div className="admin-fields">
              <label>
                <span>Titre ou auteur</span>
                <input value={item.name || ""} onChange={(e) => updateItem(index, { ...item, name: e.target.value })} />
              </label>
              <label className="admin-fields__full">
                <span>Texte</span>
                <textarea value={item.text || ""} rows="4" onChange={(e) => updateItem(index, { ...item, text: e.target.value })} />
              </label>
              <label className="admin-fields__full">
                <span>Image</span>
                <input type="file" accept="image/*" onChange={(e) => onFileChange("newsImages", index, e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              </label>
              <CurrentImage siteId={siteId} image={item.img} alt={item.name || "Illustration de l’actualité"} />
            </div>
          ) : null}
        </div>
      ))}

      <button className="button button--ghost-dark" type="button" onClick={addItem}>
        Ajouter un élément
      </button>
    </div>
  );
}

export default function SiteEditor() {
  const { siteId, sectionKey } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [sectionState, setSectionState] = useState(createDefaultSection(sectionKey));
  const [pendingFiles, setPendingFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const currentEntry = useMemo(
    () => sectionEntries.find((entry) => entry.key === sectionKey),
    [sectionKey]
  );

  const safeSectionState = useMemo(() => {
    if (ARRAY_SECTIONS.includes(sectionKey)) {
      return Array.isArray(sectionState) ? sectionState : [];
    }

    if (OBJECT_SECTIONS.includes(sectionKey) || sectionKey === "home" || sectionKey === "about") {
      return sectionState && Array.isArray(sectionState) === false
        ? sectionState
        : createDefaultSection(sectionKey);
    }

    return sectionState;
  }, [sectionKey, sectionState]);

  useEffect(() => {
    setSectionState(createDefaultSection(sectionKey));
    setPendingFiles({});
    setMessage("");
    setError("");
  }, [sectionKey]);

  useEffect(() => {
    const loadSite = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getSite(siteId, token);
        setSite(data);
        setSectionState(normalizeSection(sectionKey, data));
        setPendingFiles({});
      } catch (err) {
        setError((err.response && err.response.data && err.response.data.message) || "Impossible de charger ce brouillon.");
      } finally {
        setLoading(false);
      }
    };

    loadSite();
  }, [siteId, token, sectionKey]);

  const setSingleFile = (key, file) => {
    setPendingFiles((prev) => ({ ...prev, [key]: file }));
  };

  const setIndexedFile = (group, index, file) => {
    setPendingFiles((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] || {}),
        [index]: file,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const patch = { [sectionKey]: safeSectionState };
      const files = buildFilesForSection(sectionKey, pendingFiles);
      const updated = await patchSiteSection(siteId, patch, token, files);
      setSite(updated);
      setSectionState(normalizeSection(sectionKey, updated));
      setPendingFiles({});
      setMessage("Section enregistrée.");
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.message) || "La sauvegarde a échoué.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setError("");
    setMessage("");
    try {
      const updated = await publishSite(siteId, token);
      setSite(updated);
      setMessage("Version publiée.");
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.message) || "Publication impossible.");
    }
  };

  const handleActivate = async () => {
    setError("");
    setMessage("");
    try {
      const updated = await activateSite(siteId, token);
      setSite(updated);
      setMessage("Version activée.");
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.message) || "Activation impossible.");
    }
  };

  if (loading) {
    return <div className="admin-page-state">Chargement du brouillon...</div>;
  }

  if (site == null) {
    return <div className="admin-page-state">Brouillon introuvable.</div>;
  }

  if (site.status !== "draft") {
    return (
      <div className="admin-page-state">
        <div className="admin-page-state__card">
          <span className={`admin-badge admin-badge--${site.status}`}>{site.status === "published" ? "Publié" : site.status}</span>
          <h1>Cette version n’est plus modifiable</h1>
          <p>Une version doit être publiée avant de pouvoir être activée.</p>
          <div className="admin-card__actions">
            <Link className="button button--ghost-dark" to={"/admin/sites/" + siteId + "/preview"}>Voir l’aperçu</Link>
            {site.status === "published" && !site.isActive && user?.role === "admin" ? (
              <button className="button button--primary" type="button" onClick={handleActivate}>
                Activer cette version
              </button>
            ) : null}
          </div>
          {message ? <p className="admin-success">{message}</p> : null}
          {error ? <p className="admin-error">{error}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-editor">
      <aside className="admin-sidebar">
        <Link className="admin-sidebar__back" to="/admin/sites">
          Retour aux versions
        </Link>
        <h1>{site.description || ("Version " + site.version)}</h1>
        <nav className="admin-sidebar__nav">
          {sectionEntries.map((entry) => (
            <NavLink key={entry.key} to={"/admin/sites/" + siteId + "/sections/" + entry.key}>
              {entry.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__actions">
          <Link className="button button--ghost-dark" to={"/admin/sites/" + siteId + "/preview"}>
            Aperçu
          </Link>
          {user?.role === "admin" ? <button className="button button--primary" type="button" onClick={handlePublish}>Publier cette version</button> : null}
        </div>
      </aside>

      <section className="admin-editor__content">
        <header className="admin-panel admin-panel--tight">
          <span className="admin-eyebrow">Section</span>
          <h2>{currentEntry ? currentEntry.label : sectionKey}</h2>
        </header>

        {message ? <p className="admin-success">{message}</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}

        {sectionKey === "home" ? (
          <div className="admin-panel">
            <div className="admin-fields">
              <label className="admin-fields__full">
                <span>Titre</span>
                <input value={safeSectionState.title || ""} onChange={(e) => setSectionState({ ...safeSectionState, title: e.target.value })} />
              </label>
              <label className="admin-fields__full">
                <span>Texte</span>
                <textarea rows="6" value={safeSectionState.paragraph || ""} onChange={(e) => setSectionState({ ...safeSectionState, paragraph: e.target.value })} />
              </label>
              <label className="admin-fields__full">
                <span>Image de fond</span>
                <input type="file" accept="image/*" onChange={(e) => setSingleFile("homeImage", e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              </label>
              <CurrentImage siteId={siteId} image={safeSectionState.backgroundImage} alt="Image de fond de l’accueil" />
            </div>
          </div>
        ) : null}

        {sectionKey === "about" ? (
          <div className="admin-panel">
            <div className="admin-fields">
              <label className="admin-fields__full">
                <span>Titre</span>
                <input value={safeSectionState.title || ""} onChange={(e) => setSectionState({ ...safeSectionState, title: e.target.value })} />
              </label>
              <label className="admin-fields__full">
                <span>Texte</span>
                <textarea rows="6" value={safeSectionState.paragraph || ""} onChange={(e) => setSectionState({ ...safeSectionState, paragraph: e.target.value })} />
              </label>
              <label className="admin-fields__full">
                <span>Pourquoi RAFIA (une ligne par élément)</span>
                <textarea
                  rows="6"
                  value={(safeSectionState.why || []).join("\n")}
                  onChange={(e) => setSectionState({ ...safeSectionState, why: e.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })}
                />
              </label>
              <label className="admin-fields__full">
                <span>Image à propos</span>
                <input type="file" accept="image/*" onChange={(e) => setSingleFile("aboutImage", e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              </label>
              <CurrentImage siteId={siteId} image={safeSectionState.aboutImage} alt="Image de la section À propos" />
            </div>
            <div className="admin-stack">
              {(safeSectionState.items || []).map((item, index) => (
                <div className="admin-repeatable" key={`about-${index}`}>
                  <div className="admin-repeatable__header">
                    <strong>Élément #{index + 1}</strong>
                    <button
                      type="button"
                      onClick={() => setSectionState({
                        ...safeSectionState,
                        items: safeSectionState.items.filter((_, itemIndex) => itemIndex !== index),
                      })}
                    >
                      Supprimer
                    </button>
                  </div>
                  <div className="admin-fields">
                    <label className="admin-fields__full">
                      <span>Titre</span>
                      <input value={item.title || ""} onChange={(e) => setSectionState({
                        ...safeSectionState,
                        items: safeSectionState.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: e.target.value } : entry),
                      })} />
                    </label>
                    <label className="admin-fields__full">
                      <span>Texte</span>
                      <textarea rows="3" value={item.text || ""} onChange={(e) => setSectionState({
                        ...safeSectionState,
                        items: safeSectionState.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, text: e.target.value } : entry),
                      })} />
                    </label>
                    <label className="admin-fields__full">
                      <span>Image</span>
                      <input type="file" accept="image/*" onChange={(e) => setIndexedFile("aboutItemImages", index, e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                    </label>
                    <CurrentImage siteId={siteId} image={item.image} alt={item.title || "Illustration de RAFIA"} />
                  </div>
                </div>
              ))}
              <button
                className="button button--ghost-dark"
                type="button"
                onClick={() => setSectionState({
                  ...safeSectionState,
                  items: [...(safeSectionState.items || []), { title: "", text: "", image: null }],
                })}
              >
                Ajouter un élément
              </button>
            </div>
          </div>
        ) : null}

        {ARRAY_SECTIONS.includes(sectionKey) ? (
          <div className="admin-panel">
            <ArraySectionFields
              key={sectionKey}
              sectionKey={sectionKey}
              siteId={siteId}
              items={safeSectionState}
              onChange={setSectionState}
              onFileChange={setIndexedFile}
            />
          </div>
        ) : null}

        {OBJECT_SECTIONS.includes(sectionKey) ? (
          <div className="admin-panel">
            <ObjectSectionFields value={safeSectionState} onChange={setSectionState} />
          </div>
        ) : null}

        <div className="admin-editor__footer">
          <button className="button button--primary" type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer la section"}
          </button>
          <button className="button button--ghost-dark" type="button" onClick={() => navigate("/admin/sites/" + siteId + "/preview")}>
            Voir l’aperçu
          </button>
        </div>
      </section>
    </div>
  );
}
