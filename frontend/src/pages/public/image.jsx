import { useState } from "react";

export const Image = ({ title, description, largeImage, smallImage }) => {
  const [open, setOpen] = useState(false);
  const previewImage = smallImage || largeImage;

  return (
    <>
      <article className="project-card">
        <button className="project-card__trigger" type="button" onClick={() => setOpen(true)}>
          {previewImage ? <img src={previewImage} alt={title} /> : null}
          <div className="project-card__overlay">
            <span>Projet</span>
            <h3>{title}</h3>
            {description ? <p>{description}</p> : null}
          </div>
        </button>
      </article>

      {open ? (
        <div className="project-modal" role="dialog" aria-modal="true">
          <div className="project-modal__backdrop" onClick={() => setOpen(false)} />
          <div className="project-modal__panel">
            <button className="project-modal__close" type="button" onClick={() => setOpen(false)}>
              Fermer
            </button>
            {largeImage || previewImage ? (
              <img className="project-modal__image" src={largeImage || previewImage} alt={title} />
            ) : null}
            <div className="project-modal__content">
              <span className="section-kicker">Projet</span>
              <h3>{title}</h3>
              {description ? <p>{description}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
