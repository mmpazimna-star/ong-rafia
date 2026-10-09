import Contact from "../models/Contact.js";
import Donation from "../models/Donation.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phonePattern = /^[0-9+().\s-]{6,30}$/;

const validateSubmission = ({ name, email, phone, message }) => {
  if (!name?.trim() || !email?.trim() || !phone?.trim() || !message?.trim()) {
    return "Tous les champs sont obligatoires.";
  }
  if (!emailPattern.test(email.trim())) return "L’adresse e-mail est invalide.";
  if (!phonePattern.test(phone.trim())) return "Le numéro de téléphone est invalide.";
  if (name.trim().length > 120 || message.trim().length > 5000) {
    return "Un des champs dépasse la longueur autorisée.";
  }
  return null;
};

const createSubmission = (Model, successMessage) => async (req, res, next) => {
  try {
    const validationError = validateSubmission(req.body);
    if (validationError) return res.status(422).json({ message: validationError });

    const submission = await Model.create(req.body);
    return res.status(201).json({ message: successMessage, id: submission._id });
  } catch (error) {
    next(error);
  }
};

export const createContact = createSubmission(Contact, "Votre message a bien été envoyé.");
export const createDonation = createSubmission(Donation, "Votre demande de soutien a bien été enregistrée.");
