export const About = ({ data, getImageUrl }) => {
  const imageSrc = data?.aboutImage?.path ? getImageUrl(data.aboutImage.path) : "";
  const reasons = Array.isArray(data?.why) ? data.why : [];
  const midpoint = Math.ceil(reasons.length / 2);
  const reasonColumns = [reasons.slice(0, midpoint), reasons.slice(midpoint)].filter(
    (column) => column.length
  );

  return (
    <section className="content-section content-section--split" id="about">
      <div className="section-shell split-layout">
        <div className="split-layout__media">
          {imageSrc ? <img src={imageSrc} alt={data?.title || "Présentation de RAFIA"} /> : null}
        </div>

        <div className="split-layout__content">
          <div className="section-heading section-heading--compact">
            <span className="section-kicker">À propos</span>
            <h2>{data?.title || "Une organisation de terrain"}</h2>
            <p>{data?.paragraph || "RAFIA agit au plus près des besoins locaux."}</p>
            <p className="about-history">Depuis 1992, RAFIA accompagne les communautés rurales du Togo, de l’agroécologie à la préservation des ressources et au renforcement des initiatives locales.</p>
          </div>

          {reasonColumns.length ? (
            <div className="bullet-columns">
              {reasonColumns.map((column, index) => (
                <ul key={`why-column-${index}`}>
                  {column.map((item, itemIndex) => (
                    <li key={`${item}-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {Array.isArray(data?.items) && data.items.length ? (
        <div className="section-shell card-grid card-grid--three">
          {data.items.map((item, index) => (
            <article className="news-card" key={`${item.title || "about"}-${index}`}>
              <div className="news-card__image">
                {item.image?.path ? <img src={getImageUrl(item.image.path)} alt={item.title || "RAFIA"} /> : null}
              </div>
              <div className="news-card__body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};
