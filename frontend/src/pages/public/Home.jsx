export const Home = ({ data, getImageUrl }) => {
  const bgImage = data?.backgroundImage?.path ? getImageUrl(data.backgroundImage.path) : "";

  return (
    <header className="hero-section" id="home">
      <div
        className="hero-section__media"
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
      />
      <div className="hero-section__overlay" />
      <div className="hero-section__content section-shell">
        <div className="hero-section__copy">
          <span className="section-kicker">ONG RAFIA</span>
          <h1>{data?.title || "Agir avec les communautés pour un développement durable"}</h1>
          <p>
            {data?.paragraph ||
              "RAFIA accompagne des initiatives locales et soutient des actions concrètes au service des communautés."}
          </p>
          <div className="hero-section__actions">
            <a className="button button--primary" href="#projects">
              Découvrir nos projets
            </a>
            <a className="button button--ghost" href="#donation">
              Soutenir nos actions
            </a>
          </div>
        </div>

        <aside className="hero-section__panel">
          <span className="section-kicker">Notre engagement</span>
          <h2>Des actions utiles, conçues au plus près de vos réalités.</h2>
          <p>RAFIA écoute les communautés et accompagne des réponses durables, pensées avec les acteurs locaux.</p>
          <ul>
            <li>Écouter et mobiliser les communautés.</li>
            <li>Accompagner des solutions durables.</li>
            <li>Créer un impact concret et mesurable.</li>
          </ul>
        </aside>
      </div>
      <div className="hero-impact section-shell" aria-label="Engagements de RAFIA">
        <div><strong>Approche locale</strong><span>Des projets construits avec les acteurs du terrain.</span></div>
        <div><strong>Actions durables</strong><span>Des solutions pensées pour s’inscrire dans le temps.</span></div>
        <div><strong>Partenariats ouverts</strong><span>Ensemble, amplifions l’impact de chaque action.</span></div>
      </div>
    </header>
  );
};
