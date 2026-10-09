export const sectionEntries = [
  { key: "home", label: "Accueil" },
  { key: "about", label: "À propos" },
  { key: "activities", label: "Activités" },
  { key: "projects", label: "Projets" },
  { key: "team", label: "Équipe" },
  { key: "news", label: "Actualités" },
  { key: "donation", label: "Soutien" },
  { key: "contact", label: "Contact" },
];

export const createDefaultSection = (sectionKey) => {
  switch (sectionKey) {
    case "home":
      return { title: "", paragraph: "", backgroundImage: null };
    case "about":
      return { title: "", paragraph: "", why: [], aboutImage: null, items: [] };
    case "activities":
      return [];
    case "projects":
      return [];
    case "team":
      return [];
    case "news":
      return [];
    case "donation":
    case "contact":
      return {
        address: "",
        phone: "",
        email: "",
        whatsapp: "",
        facebook: "",
        instagram: "",
        linkedin: "",
        twitter: "",
        youtube: "",
      };
    default:
      return {};
  }
};
