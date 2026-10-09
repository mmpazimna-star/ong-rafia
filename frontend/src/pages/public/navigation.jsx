import { useState } from "react";

export const Navigation = ({ showAdminEntry = false }) => {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  return (
    <nav className="site-nav">
      <div className="site-nav__inner section-shell">
        <a className="site-nav__brand" href="#page-top">
          <img className="site-nav__brand-mark" src="/rafia-logo.png.png" alt="Logo RAFIA" />
          <span>
            <strong>ONG RAFIA</strong>
            <small>Développement rural</small>
          </span>
        </a>

        <button className="site-nav__toggle" type="button" aria-label="Ouvrir le menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
        <div className={`site-nav__links ${open ? "is-open" : ""}`}>
          <a href="#about" onClick={closeMenu}>À propos</a>
          <a href="#activities" onClick={closeMenu}>Actions</a>
          <a href="#projects" onClick={closeMenu}>Projets</a>
          <a href="#team" onClick={closeMenu}>Équipe</a>
          <a href="#news" onClick={closeMenu}>Actualités</a>
          <a className="site-nav__support" href="#donation" onClick={closeMenu}>Soutenir RAFIA</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
        </div>

        {showAdminEntry ? (
          <a className="site-nav__admin" href="/admin">
            Administration
          </a>
        ) : null}
      </div>
    </nav>
  );
};
