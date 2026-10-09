import path from "path";

export const UPLOAD_BASE_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

export const UPLOAD_STATUS_DIRS = {
  draft: "draft",
  active: "active",
  archived: "archived",
};
