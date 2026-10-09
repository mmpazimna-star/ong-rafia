import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import api from "./api/axios";
import PublicSiteView from "./components/PublicSiteView.jsx";
import PrivateAdminRoute from "./components/PrivateAdminRoute.jsx";
import AdminLogin from "./pages/admin/Login.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminSites from "./pages/admin/Sites.jsx";
import SiteEditor from "./pages/admin/SiteEditor.jsx";
import SitePreview from "./pages/admin/SitePreview.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminProfile from "./pages/admin/Profile.jsx";
import SmoothScroll from "smooth-scroll";
import "./App.css";
import "./pages/admin/admin.css";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [activeSite, setActiveSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/site/active");
        setActiveSite(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement du site actif :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__panel">
          <span className="app-loading__eyebrow">RAFIA</span>
          <h1>Chargement du site public</h1>
          <p>Préparation des contenus et des sections principales.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicSiteView
            siteData={activeSite?.content || {}}
            getImageUrl={(relativePath) =>
              activeSite?._id
                ? `${api.defaults.baseURL}/upload/active/${activeSite._id}/${relativePath}`
                : ""
            }
            showAdminEntry={false}
          />
        }
      />

      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateAdminRoute>
            <AdminDashboard />
          </PrivateAdminRoute>
        }
      />
      <Route path="/admin/users" element={<PrivateAdminRoute><AdminUsers /></PrivateAdminRoute>} />
      <Route path="/admin/profile" element={<PrivateAdminRoute><AdminProfile /></PrivateAdminRoute>} />
      <Route
        path="/admin/sites"
        element={
          <PrivateAdminRoute>
            <AdminSites />
          </PrivateAdminRoute>
        }
      />
      <Route
        path="/admin/sites/:siteId/sections/:sectionKey"
        element={
          <PrivateAdminRoute>
            <SiteEditor />
          </PrivateAdminRoute>
        }
      />
      <Route
        path="/admin/sites/:siteId/preview"
        element={
          <PrivateAdminRoute>
            <SitePreview />
          </PrivateAdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
