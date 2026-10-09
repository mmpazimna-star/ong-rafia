import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import set from "lodash/set.js";
import { FileManager } from "./fileManager.js";

function saveFile({ file, status, siteId, section }) {
  const ext = path.extname(file.originalname);
  const id = uuidv4();
  const filename = id + ext;

  FileManager.ensureDir({ status, siteId, section });

  const finalPath = FileManager.getPath({ status, siteId, section, filename });

  fs.moveSync(file.path, finalPath, { overwrite: true });

  return {
    id,
    name: file.originalname,
    type: file.mimetype,
    path: `${section}/${filename}`,
  };
}

const parseIndexedField = (fieldname) => {
  const match = /^([a-z]+)(?:\[(\d+)\])?$/i.exec(String(fieldname || ""));
  if (!match) {
    return { key: String(fieldname || "").toLowerCase(), index: null };
  }

  return {
    key: match[1].toLowerCase(),
    index: match[2] == null ? null : Number(match[2]),
  };
};

export const injectFilesIntoContent = (content, files, siteId, isActive) => {
  if (!files || !files.length) return content;

  const status = isActive ? "active" : "draft";

  const groups = {
    home: [],
    about: [],
    aboutitems: [],
    activities: [],
    team: [],
    news: [],
    projectsl: [],
    projectss: [],
  };

  for (const file of files) {
    const { key, index } = parseIndexedField(file.fieldname);
    if (!groups[key]) continue;

    if (index == null) {
      groups[key].push(file);
      continue;
    }

    groups[key][index] = file;
  }

  if (groups.home[0]) {
    FileManager.removeFileIfExists({
      status,
      siteId,
      relativePath: content?.home?.backgroundImage?.path,
    });
    const img = saveFile({ file: groups.home[0], status, siteId, section: "home" });
    set(content, "home.backgroundImage", img);
  }

  if (groups.about[0]) {
    FileManager.removeFileIfExists({
      status,
      siteId,
      relativePath: content?.about?.aboutImage?.path,
    });
    const img = saveFile({ file: groups.about[0], status, siteId, section: "about" });
    set(content, "about.aboutImage", img);
  }

  groups.aboutitems.forEach((file, index) => {
    if (!file) return;

    FileManager.removeFileIfExists({
      status,
      siteId,
      relativePath: content?.about?.items?.[index]?.image?.path,
    });
    const img = saveFile({ file, status, siteId, section: "about" });
    set(content, `about.items.${index}.image`, img);
  });

  groups.activities.forEach((file, index) => {
    if (!file) return;

    FileManager.removeFileIfExists({
      status,
      siteId,
      relativePath: content?.activities?.[index]?.icon?.path,
    });
    const img = saveFile({ file, status, siteId, section: "activities" });
    set(content, `activities.${index}.icon`, img);
  });

  groups.team.forEach((file, index) => {
    if (!file) return;

    FileManager.removeFileIfExists({
      status,
      siteId,
      relativePath: content?.team?.[index]?.img?.path,
    });
    const img = saveFile({ file, status, siteId, section: "team" });
    set(content, `team.${index}.img`, img);
  });

  groups.news.forEach((file, index) => {
    if (!file) return;

    FileManager.removeFileIfExists({
      status,
      siteId,
      relativePath: content?.news?.[index]?.img?.path,
    });
    const img = saveFile({ file, status, siteId, section: "news" });
    set(content, `news.${index}.img`, img);
  });

  const max = Math.max(groups.projectsl.length, groups.projectss.length);
  content.projects = content.projects || [];

  for (let i = 0; i < max; i += 1) {
    content.projects[i] = content.projects[i] || {};

    if (groups.projectsl[i]) {
      FileManager.removeFileIfExists({
        status,
        siteId,
        relativePath: content?.projects?.[i]?.largeImage?.path,
      });
      const img = saveFile({
        file: groups.projectsl[i],
        status,
        siteId,
        section: "projects",
      });
      content.projects[i].largeImage = img;
    }

    if (groups.projectss[i]) {
      FileManager.removeFileIfExists({
        status,
        siteId,
        relativePath: content?.projects?.[i]?.smallImage?.path,
      });
      const img = saveFile({
        file: groups.projectss[i],
        status,
        siteId,
        section: "projects",
      });
      content.projects[i].smallImage = img;
    }
  }

  return content;
};
