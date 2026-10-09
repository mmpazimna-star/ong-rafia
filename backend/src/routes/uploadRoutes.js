import express from "express";
import path from "path";
import { protect, authorize } from "../middleware/auth.js";
import { UPLOAD_BASE_DIR } from "../utils/config.js";

const router = express.Router();

// --- Images publiques (active) ---
router.use(
  "/active",
  express.static(path.join(UPLOAD_BASE_DIR, "active"))
);

// --- Images privées (draft / archived) ---
router.use(
  "/private/draft",
  protect,
  authorize("admin", "editor"),
  express.static(path.join(UPLOAD_BASE_DIR, "draft"))
);

router.use(
  "/private/archived",
  protect,
  authorize("admin", "editor"),
  express.static(path.join(UPLOAD_BASE_DIR, "archived"))
);

export default router;
