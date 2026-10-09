import mongoose from "mongoose";
import fs from "fs-extra";
import path from "path";
import SiteVersion from "../models/SiteVersion.js";
import { injectFilesIntoContent } from "../utils/injectFilesIntoContent.js";
import { copyFolder } from "../utils/fileManager.js";
import { logAction } from "../middleware/logger.js";
import { UPLOAD_BASE_DIR } from "../utils/config.js";
import merge from "lodash/merge.js";

const CLONEABLE_STATUSES = ["draft", "published", "archived"];
const ASSET_STATUSES = ["draft", "published", "active", "archived"];

export const listSiteVersions = async (_req, res) => {
  const sites = await SiteVersion.find()
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();

  res.json(sites);
};

export const getSiteVersion = async (req, res) => {
  const site = await SiteVersion.findById(req.params.id);

  if (!site) {
    return res.status(404).json({ message: "Version non trouvée" });
  }

  res.json(site);
};

export const cloneSiteVersion = async (req, res) => {
  try {
    const source = await SiteVersion.findById(req.params.id).lean();

    if (!source) {
      return res.status(404).json({ message: "Version source non trouvée" });
    }

    if (!CLONEABLE_STATUSES.includes(source.status)) {
      return res.status(400).json({ message: "Statut source non clonable" });
    }

    const siteId = new mongoose.Types.ObjectId();
    const clone = new SiteVersion({
      _id: siteId,
      content: source.content || {},
      description:
        req.body.description || `Clone de la version ${source.version}`,
      status: "draft",
      isActive: false,
      createdBy: req.user._id,
    });

    const sourceDir = path.join(UPLOAD_BASE_DIR, source.status, String(source._id));
    const destDir = path.join(UPLOAD_BASE_DIR, "draft", String(siteId));

    if (await fs.pathExists(sourceDir)) {
      await copyFolder(sourceDir, destDir);
    }

    await clone.save();
    logAction("CLONE_SITE", req.user._id, {
      sourceSiteId: source._id,
      siteId: clone._id,
    });

    res.status(201).json(clone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getSiteAsset = async (req, res) => {
  const { status, path: relativePath } = req.query;

  if (!ASSET_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Statut d image invalide" });
  }

  if (!relativePath) {
    return res.status(400).json({ message: "Chemin d image manquant" });
  }

  const site = await SiteVersion.findById(req.params.id).select("_id status");

  if (!site) {
    return res.status(404).json({ message: "Version non trouvée" });
  }

  const assetDirectory = path.resolve(UPLOAD_BASE_DIR, status, String(site._id));
  const filePath = path.resolve(assetDirectory, relativePath);
  if (!filePath.startsWith(`${assetDirectory}${path.sep}`)) {
    return res.status(400).json({ message: "Chemin d image invalide" });
  }

  res.sendFile(relativePath, { root: assetDirectory }, (err) => {
    if (!err) {
      return;
    }

    if (err.code === "ENOENT" || err.status === 404 || err.statusCode === 404) {
      return res.status(404).json({ message: "Image introuvable" });
    }

    return res.status(500).json({ message: "Erreur de lecture d image" });
  });
};

export const createSiteVersion = async (req, res) => {
  try {
    const siteId = new mongoose.Types.ObjectId();
    const content = JSON.parse(req.body.content || "{}");

    injectFilesIntoContent(content, req.files || [], siteId.toString());

    const site = new SiteVersion({
      _id: siteId,
      content,
      description: req.body.description || "",
      createdBy: req.user._id,
    });

    await site.save();

    logAction("CREATE_SITE", req.user._id, { siteId: site._id });

    res.status(201).json(site);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateSiteVersion = async (req, res) => {
  try {
    const site = await SiteVersion.findById(req.params.id);
    if (!site) return res.status(404).json({ message: "Version non trouvée" });

    const content = JSON.parse(req.body.content || "{}");

    injectFilesIntoContent(content, req.files || [], site._id);

    site.content = content;
    site.description = req.body.description || site.description;

    await site.save();
    logAction("PUT_UPDATE_SITE", req.user._id, { siteId: site._id });

    res.json(site);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const patchSiteVersion = async (req, res) => {
  try {
    const site = await SiteVersion.findById(req.params.id);
    if (!site) return res.status(404).json({ message: "Version non trouvée" });

    const contentPatch = JSON.parse(req.body.content || "{}");

    injectFilesIntoContent(contentPatch, req.files || [], site._id.toString());

    merge(site.content, contentPatch);

    if (req.body.description) site.description = req.body.description;

    await site.save();
    logAction("PATCH_UPDATE_SITE", req.user._id, { siteId: site._id });

    res.json(site);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteSiteVersion = async (req, res) => {
  try {
    const site = await SiteVersion.findByIdAndDelete(req.params.id);
    if (!site) return res.status(404).json({ message: "Version non trouvée" });
    if (site.status !== "draft") {
      return res.status(400).json({
        message: "Seules les versions en draft peuvent être supprimées",
      });
    }
    logAction("DELETE_SITE", req.user._id, { siteId: site._id });
    res.json({ message: "Version supprimée", id: site._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const publishSiteVersion = async (req, res) => {
  const site = await SiteVersion.findById(req.params.id);
  if (!site) {
    return res.status(404).json({ message: "Version non trouvée" });
  }

  if (site.status !== "draft") {
    return res.status(400).json({
      message: "Seules les versions en draft peuvent être publiées",
    });
  }

  const nextStatus = "published";
  const src = `${UPLOAD_BASE_DIR}/${site.status}/${site._id.toString()}`;
  const dest = `${UPLOAD_BASE_DIR}/${nextStatus}/${site._id.toString()}`;

  if (await fs.pathExists(src)) {
    await copyFolder(src, dest);
    logAction("COPY_DRAFT_TO_PUBLISHED", req.user._id, { siteId: site._id });
  }

  site.status = nextStatus;
  site.publishedBy = req.user._id;

  await site.save();
  logAction("PUBLISH_SITE", req.user._id, { siteId: site._id });

  res.json(site);
};

export const activateSiteVersion = async (req, res) => {
  const site = await SiteVersion.findById(req.params.id);
  if (!site) {
    return res.status(404).json({ message: "Version non trouvée" });
  }

  if (site.status !== "published") {
    return res.status(400).json({
      message: "Seules les versions publiées peuvent être activées",
    });
  }

  await SiteVersion.updateMany({ _id: { $ne: site._id } }, { isActive: false });

  const nextStatus = "active";
  const src = `${UPLOAD_BASE_DIR}/${site.status}/${site._id.toString()}`;
  const dest = `${UPLOAD_BASE_DIR}/${nextStatus}/${site._id.toString()}`;

  if (await fs.pathExists(src)) {
    await copyFolder(src, dest);
    logAction("COPY_PUBLISHED_TO_ACTIVE", req.user._id, { siteId: site._id });
  }

  site.isActive = true;
  site.activatedBy = req.user._id;

  await site.save();
  logAction("ACTIVATE_SITE", req.user._id, { siteId: site._id });

  res.json(site);
};

export const getActiveSite = async (_req, res) => {
  const site = await SiteVersion.findOne({
    isActive: true,
    status: "published",
  });

  if (!site) {
    return res.status(404).json({ message: "Aucune version active" });
  }

  res.json(site);
};
