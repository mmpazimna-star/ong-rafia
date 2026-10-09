export const News = ({ data, getImageUrl }) => {
  const news = Array.isArray(data) ? data : [];

  return (
    <section className="content-section content-section--accent" id="news">
      <div className="section-shell">
        <div className="section-heading section-heading--light">
          <span className="section-kicker">Actualités</span>
          <h2>Suivez les actions menées sur le terrain</h2>
        </div>

        <div className="card-grid card-grid--three">
          {news.map((item, index) => (
            <article className="news-card" key={`${item.name || "news"}-${index}`}>
              <div className="news-card__image">
                {item.img?.path ? <img src={getImageUrl(item.img.path)} alt={item.name} /> : null}
              </div>
              <div className="news-card__body">
                <span className="news-card__tag">Terrain</span>
                <p>{item.text}</p>
                <strong>{item.name}</strong>
              </div>
            </article>
          ))}
          {!news.length ? <p className="public-empty public-empty--light">Aucune actualité n’est disponible pour le moment.</p> : null}
        </div>
      </div>
    </section>
  );
};
