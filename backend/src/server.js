import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import siteRoutes from "./routes/siteRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { httpLogger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cors from "cors";
import publicRoutes from "./routes/publicRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(httpLogger);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/site", siteRoutes);
app.use("/api/public", publicRoutes);
app.use("/upload", uploadRoutes);

// Middleware erreurs
app.use(errorHandler);

// Connexion DB & lancement serveur
mongoose
  .connect(
    process.env.MONGO_URI,
    process.env.MONGO_DB_NAME ? { dbName: process.env.MONGO_DB_NAME } : {}
  )
  .then(() =>
    app.listen(process.env.PORT || 5000, () =>
      console.log("Serveur prêt en prod")
    )
  )
  .catch((err) => console.error(err));
