import { Image } from "./image";

export const Projects = ({ data, getImageUrl }) => {
  const projects = Array.isArray(data) ? data : [];

  return (
    <section className="content-section" id="projects">
      <div className="section-shell">
        <div className="section-heading">
          <span className="section-kicker">Projets</span>
          <h2>Des projets construits avec les communautés</h2>
          <p>Des pistes d’intervention ancrées dans les réalités locales, de l’agroécologie à l’entrepreneuriat rural.</p>
        </div>

        <div className="project-grid">
          {projects.map((project, index) => (
            <Image
              key={`${project.title || "project"}-${index}`}
              title={project.title}
              description={project.description}
              largeImage={project.largeImage?.path ? getImageUrl(project.largeImage.path) : ""}
              smallImage={project.smallImage?.path ? getImageUrl(project.smallImage.path) : ""}
            />
          ))}
          {!projects.length ? <p className="public-empty">Les projets seront bientôt présentés ici.</p> : null}
        </div>
      </div>
    </section>
  );
};
