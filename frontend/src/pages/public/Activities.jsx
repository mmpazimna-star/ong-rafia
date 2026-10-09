export const Activities = ({ data, getImageUrl }) => {
  const activities = Array.isArray(data) ? data : [];

  return (
    <section className="content-section" id="activities">
      <div className="section-shell">
        <div className="section-heading">
          <span className="section-kicker">Actions et activités</span>
          <h2>Des interventions au service des communautés</h2>
          <p>Agriculture familiale, ressources naturelles, activités génératrices de revenus et accompagnement local : découvrez les domaines d’intervention de RAFIA.</p>
        </div>

        <div className="card-grid card-grid--three">
          {activities.map((item, index) => (
            <article className="info-card" key={(item.title || "action") + "-" + index}>
              <div className={`info-card__icon${item.icon?.path ? " info-card__icon--image" : ""}`}>
                {item.icon?.path ? (
                  <img src={getImageUrl(item.icon.path)} alt={item.title || "Activité"} />
                ) : (
                  <span>{(item.title || "A").charAt(0)}</span>
                )}
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
