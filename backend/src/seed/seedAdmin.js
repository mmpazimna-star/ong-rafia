import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import User from "../models/User.js";
import SiteVersion from "../models/SiteVersion.js";

dotenv.config();

/* Résoudre __dirname en ES Modules */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Charger data.json */
const dataPath = path.join(__dirname, "data.json");
let content = {};
if (fs.existsSync(dataPath)) {
  content = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
} else {
  console.warn("data.json introuvable, contenu vide utilisé");
}

/* Fonction seed */
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connecté");

    // Créer le premier admin système si inexistant
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new Error("ADMIN_EMAIL est requis pour créer l’admin système");
    }

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword) {
        throw new Error("ADMIN_PASSWORD est requis pour créer l’admin système");
      }

      admin = await User.create({
        name: "rafia",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isSystem: true, // Indique que c'est le user système
        createdBy: null,
      });
      console.log("Admin système créé :", admin.email);
    } else {
      console.log("Admin déjà existant :", admin.email);
    }

    // Créer la première version active du site si inexistante
    /*const siteExists = await SiteVersion.findOne({ isActive: true });

    if (!siteExists) {
      const site = await SiteVersion.create({
        description: "Version initiale du site",
        content, 
        status: "published",
        isActive: true,
        createdBy: admin._id,
        publishedBy: admin._id,
        activatedBy: admin._id,
      });

      console.log("Version initiale du site créée :", site.version);
    }*/

    await mongoose.disconnect();
    console.log("Seed terminé avec succès");
    process.exit(0);
  } catch (error) {
    console.error("Erreur seed :", error);
    process.exit(1);
  }
};

seed();
