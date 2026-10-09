import fs from "fs-extra";
import path from "path";
import { UPLOAD_BASE_DIR } from "./config.js";

export const FileManager = {
  baseDir: UPLOAD_BASE_DIR,

  getPath({ status, siteId, section, filename }) {
    return path.join(this.baseDir, status, String(siteId), section, filename);
  },

  ensureDir({ status, siteId, section }) {
    fs.ensureDirSync(path.join(this.baseDir, status, String(siteId), section));
  },

  removeFileIfExists({ status, siteId, relativePath }) {
    if (!relativePath) return;
    const fullPath = path.join(
      this.baseDir,
      status,
      String(siteId),
      relativePath
    );
    if (fs.existsSync(fullPath)) {
      fs.removeSync(fullPath);
    }
  }
};


export async function copyFolder(src, dest, overwrite = true) {
  try {
    await fs.ensureDir(dest); // créer le dossier cible si nécessaire
    await fs.copy(src, dest, { overwrite }); // copie récursive
    console.log(`Dossier copié de ${src} vers ${dest}`);
    return dest;
  } catch (err) {
    console.error("Erreur lors de la copie du dossier :", err);
    throw err;
  }
}
