import fs from "fs";
import path from "path";
import morgan from "morgan";

// Créer dossier logs si inexistant
if (!fs.existsSync("logs")) fs.mkdirSync("logs");

// Logging HTTP
export const httpLogger = morgan("combined", {
  stream: fs.createWriteStream(path.join("logs", "access.log"), { flags: "a" }),
});

// Logging actions métiers
export const logAction = (action, userId, details) => {
  const log = `${new Date().toISOString()} | User: ${userId} | Action: ${action} | Details: ${JSON.stringify(details)}\n`;
  fs.appendFileSync(path.join("logs", "actions.log"), log);
};
