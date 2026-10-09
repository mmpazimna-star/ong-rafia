import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const PrivateAdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/admin" replace />;
  if (user?.mustChangePassword && location.pathname !== "/admin/profile") return <Navigate to="/admin/profile" replace />;
  return children;
};

export default PrivateAdminRoute;
