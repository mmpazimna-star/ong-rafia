import express from "express";
import { changeMyPassword, createUser, getMe, getUser, listUsers, loginUser, resetUserPassword, updateUser } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.patch("/me/password", protect, changeMyPassword);
router.get("/", protect, authorize("admin"), listUsers);
router.post("/", protect, authorize("admin"), createUser);
router.get("/:id", protect, authorize("admin"), getUser);
router.put("/:id", protect, authorize("admin"), updateUser);
router.patch("/:id/reset-password", protect, authorize("admin"), resetUserPassword);

export default router;
