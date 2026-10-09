import express from "express";
import { createContact, createDonation } from "../controllers/publicController.js";

const router = express.Router();

router.post("/contacts", createContact);
router.post("/donations", createDonation);

export default router;
