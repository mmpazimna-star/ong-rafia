import express from "express";
import {
  createSiteVersion,
  updateSiteVersion,
  patchSiteVersion,
  deleteSiteVersion,
  publishSiteVersion,
  activateSiteVersion,
  getActiveSite,
  listSiteVersions,
  getSiteVersion,
  cloneSiteVersion,
  getSiteAsset,
} from "../controllers/siteController.js";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.get("/active", getActiveSite);
router.get("/:id/asset", getSiteAsset);

router.get("/", protect, authorize("admin", "editor"), listSiteVersions);
router.post(
  "/",
  protect,
  authorize("admin", "editor"),
  upload.any(),
  createSiteVersion
);
router.get("/:id", protect, authorize("admin", "editor"), getSiteVersion);
router.post(
  "/:id/clone",
  protect,
  authorize("admin", "editor"),
  cloneSiteVersion
);
router.put(
  "/:id",
  protect,
  authorize("admin", "editor"),
  upload.any(),
  updateSiteVersion
);
router.patch(
  "/:id",
  protect,
  authorize("admin", "editor"),
  upload.any(),
  patchSiteVersion
);
router.patch("/:id/publish", protect, authorize("admin"), publishSiteVersion);
router.patch("/:id/activate", protect, authorize("admin"), activateSiteVersion);
router.delete("/:id", protect, authorize("admin"), deleteSiteVersion);

export default router;
