export const Team = ({ data, getImageUrl }) => {
  const team = Array.isArray(data) ? data : [];

  return (
    <section className="content-section" id="team">
      <div className="section-shell">
        <div className="section-heading">
          <span className="section-kicker">Gouvernance</span>
          <h2>Une équipe engagée aux côtés des communautés</h2>
          <p>Des femmes et des hommes mobilisés pour porter les actions de RAFIA au quotidien.</p>
        </div>

        <div className="card-grid card-grid--four">
          {team.map((member, index) => (
            <article className="person-card" key={`${member.name || "member"}-${index}`}>
              <div className="person-card__image">
                {member.img?.path ? <img src={getImageUrl(member.img.path)} alt={member.name} /> : null}
              </div>
              <div className="person-card__body">
                <h3>{member.name}</h3>
                <p>{member.job}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
