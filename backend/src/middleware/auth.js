import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ message: "Compte inactif ou introuvable" });
      }
      if (
        req.user.mustChangePassword &&
        !req.originalUrl.endsWith("/api/users/me") &&
        !req.originalUrl.endsWith("/api/users/me/password")
      ) {
        return res.status(403).json({
          message: "Vous devez modifier votre mot de passe avant de poursuivre.",
          code: "PASSWORD_CHANGE_REQUIRED",
        });
      }
      next();
    } catch {
      return res.status(401).json({ message: "Token invalide" });
    }
  } else {
    return res.status(401).json({ message: "Non autorisé, pas de token" });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: "Rôle non autorisé" });
  next();
};
