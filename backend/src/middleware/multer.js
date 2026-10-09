import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { UPLOAD_BASE_DIR } from "../utils/config.js";

const TMP_DIR = path.join(UPLOAD_BASE_DIR, "_tmp");
fs.ensureDirSync(TMP_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TMP_DIR);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: {
    files: 100,
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Seules les images sont autorisées"));
    } else {
      cb(null, true);
    }
  },
});