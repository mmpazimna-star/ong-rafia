import { Navigation } from "../pages/public/navigation";
import { Home } from "../pages/public/Home";
import { About } from "../pages/public/About";
import { Activities } from "../pages/public/Activities";
import { Projects } from "../pages/public/Projects";
import { Team } from "../pages/public/Team";
import { News } from "../pages/public/News";
import { Donation } from "../pages/public/Donation";
import { Contact } from "../pages/public/Contact";

export default function PublicSiteView({ siteData, getImageUrl, showAdminEntry = false }) {
  const safeImageUrl = (relativePath) => (relativePath ? getImageUrl(relativePath) : "");
  const donationContact = { ...(siteData?.contact || {}), ...(siteData?.donation || {}) };

  return (
    <div className="public-site" id="page-top">
      <Navigation showAdminEntry={showAdminEntry} />
      <main>
        <Home data={siteData?.home || {}} getImageUrl={safeImageUrl} />
        <About data={siteData?.about || {}} getImageUrl={safeImageUrl} />
        <Activities data={siteData?.activities || []} getImageUrl={safeImageUrl} />
        <Projects data={siteData?.projects || []} getImageUrl={safeImageUrl} />
        <Team data={siteData?.team || []} getImageUrl={safeImageUrl} />
        <News data={siteData?.news || []} getImageUrl={safeImageUrl} />
        <Donation data={donationContact} />
        <Contact data={siteData?.contact || {}} />
      </main>
    </div>
  );
}
