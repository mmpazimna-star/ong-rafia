import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { logAction } from "../middleware/logger.js";

const passwordError = (password) => {
  if (typeof password !== "string" || password.length < 10) return "Le mot de passe doit contenir au moins 10 caractères.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre.";
  }
  return null;
};

const userResponse = (user) => ({
  _id: user._id, name: user.name, email: user.email, role: user.role,
  isActive: user.isActive, mustChangePassword: user.mustChangePassword,
  isSystem: user.isSystem, createdAt: user.createdAt, updatedAt: user.updatedAt,
});

export const listUsers = async (req, res, next) => {
  try {
    const { search = "", role, active, sort = "createdAt", order = "desc" } = req.query;
    const filter = {};
    if (search.trim()) filter.$or = [{ name: { $regex: search.trim(), $options: "i" } }, { email: { $regex: search.trim(), $options: "i" } }];
    if (["admin", "editor"].includes(role)) filter.role = role;
    if (active === "true" || active === "false") filter.isActive = active === "true";
    const allowedSorts = ["name", "email", "role", "createdAt", "updatedAt", "isActive"];
    const sortField = allowedSorts.includes(sort) ? sort : "createdAt";
    const users = await User.find(filter).sort({ [sortField]: order === "asc" ? 1 : -1 });
    res.json(users.map(userResponse));
  } catch (error) { next(error); }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(userResponse(user));
  } catch (error) { next(error); }
};

export const getMe = (req, res) => res.json(userResponse(req.user));

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = "editor" } = req.body;
    const validation = passwordError(password);
    if (validation) return res.status(422).json({ message: validation });
    if (!name?.trim() || !email?.trim() || !["admin", "editor"].includes(role)) return res.status(422).json({ message: "Informations utilisateur invalides." });
    const user = await User.create({ name: name.trim(), email: email.trim(), password, role, createdBy: req.user._id, mustChangePassword: true });
    logAction("CREATE_USER", req.user._id, { createdUser: user._id });
    res.status(201).json(userResponse(user));
  } catch (error) { next(error); }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    if (user.isSystem && user._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Ce compte système ne peut pas être modifié." });
    const { name, email, role, isActive } = req.body;
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (role !== undefined && ["admin", "editor"].includes(role)) user.role = role;
    if (isActive !== undefined) {
      if (user._id.toString() === req.user._id.toString() && !isActive) return res.status(422).json({ message: "Vous ne pouvez pas désactiver votre propre compte." });
      user.isActive = Boolean(isActive);
    }
    user.lastModifiedBy = req.user._id;
    await user.save();
    logAction("UPDATE_USER", req.user._id, { updatedUser: user._id });
    res.json(userResponse(user));
  } catch (error) { next(error); }
};

export const resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const validation = passwordError(req.body.password);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    if (validation) return res.status(422).json({ message: validation });
    user.password = req.body.password;
    user.mustChangePassword = true;
    user.lastModifiedBy = req.user._id;
    await user.save();
    logAction("RESET_PASSWORD", req.user._id, { userId: user._id });
    res.json({ message: "Mot de passe réinitialisé. L utilisateur devra le modifier à sa prochaine connexion." });
  } catch (error) { next(error); }
};

export const changeMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmation } = req.body;
    const validation = passwordError(newPassword);
    if (validation) return res.status(422).json({ message: validation });
    if (newPassword !== confirmation) return res.status(422).json({ message: "La confirmation ne correspond pas au nouveau mot de passe." });
    if (!(await req.user.comparePassword(currentPassword))) return res.status(401).json({ message: "Le mot de passe actuel est incorrect." });
    req.user.password = newPassword;
    req.user.mustChangePassword = false;
    await req.user.save();
    logAction("CHANGE_OWN_PASSWORD", req.user._id, {});
    res.json({ message: "Mot de passe modifié avec succès." });
  } catch (error) { next(error); }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Aucun compte trouvé avec cet email." });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Ce compte est désactivé." });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = generateToken(user._id);
    logAction("LOGIN_USER", user._id, {});
    res.json({ token, user: userResponse(user) });
  } catch (error) { next(error); }
};
