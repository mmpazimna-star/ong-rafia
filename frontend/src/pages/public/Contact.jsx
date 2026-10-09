import { useState } from "react";
import api from "../../api/axios";

const initialState = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const socialPlatforms = [
  ["WhatsApp", "whatsapp"],
  ["Facebook", "facebook"],
  ["Instagram", "instagram"],
  ["LinkedIn", "linkedin"],
  ["X", "twitter"],
  ["YouTube", "youtube"],
];

const getSocialHref = (platform, value) => {
  if (!value) return "";
  if (platform === "whatsapp" && /^[+\d\s().-]+$/.test(value)) {
    const phone = value.replace(/\D/g, "");
    return phone ? `https://wa.me/${phone}` : "";
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
};

export const Contact = ({ data }) => {
  const [{ name, email, phone, message }, setState] = useState(initialState);

  const handleChange = (e) => {
    const { name: fieldName, value } = e.target;
    setState((prevState) => ({ ...prevState, [fieldName]: value }));
  };

  const clearState = () => setState(initialState);

  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      const { data: response } = await api.post("/api/public/contacts", { name, email, phone, message });
      clearState();
      setFeedback({ type: "success", message: response.message });
    } catch (error) {
      setFeedback({ type: "error", message: error.response?.data?.message || "L’envoi a échoué. Réessayez plus tard." });
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <section className="content-section" id="contact">
        <div className="section-shell contact-layout contact-layout--distinct">
          <div className="contact-panel contact-panel--institutional">
            <div className="section-heading section-heading--compact section-heading--contact">
              <span className="section-kicker">Contact</span>
              <h2>Contacter RAFIA</h2>
              <p>Pour une demande d’information, un partenariat ou un échange institutionnel.</p>
            </div>

            <div className="contact-list contact-list--institutional">
              <div>
                <strong>Adresse</strong>
                <span>{data?.address || "Information non renseignée"}</span>
              </div>
              <div>
                <strong>Téléphone</strong>
                {data?.phone ? <a href={`tel:${data.phone.replace(/[^+\d]/g, "")}`}>{data.phone}</a> : <span>Information non renseignée</span>}
              </div>
              <div>
                <strong>E-mail</strong>
                {data?.email ? <a href={`mailto:${data.email}`}>{data.email}</a> : <span>Information non renseignée</span>}
              </div>
            </div>

            <div className="social-links social-links--contact">
              {socialPlatforms.map(([label, platform]) => {
                const href = getSocialHref(platform, data?.[platform]);
                return href ? <a key={platform} href={href} target="_blank" rel="noreferrer">{label}</a> : null;
              })}
            </div>
          </div>

          <form className="contact-form contact-form--institutional" name="contactMessage" onSubmit={handleSubmit}>
            <div className="contact-form__intro">
              <span className="section-kicker">Message</span>
              <h3>Envoyer un message</h3>
              <p>Nous vous répondrons dans les meilleurs délais.</p>
            </div>
            <label className="sr-only" htmlFor="contact-name">Votre nom</label><input id="contact-name" type="text" name="name" value={name} placeholder="Votre nom" required onChange={handleChange} />
            <label className="sr-only" htmlFor="contact-email">Votre adresse e-mail</label><input id="contact-email" type="email" name="email" value={email} placeholder="Votre adresse e-mail" required onChange={handleChange} />
            <label className="sr-only" htmlFor="contact-phone">Votre numéro de téléphone</label><input id="contact-phone" type="tel" name="phone" value={phone} placeholder="Votre numéro de téléphone" required onChange={handleChange} />
            <label className="sr-only" htmlFor="contact-message">Votre message</label><textarea id="contact-message" name="message" rows="5" value={message} placeholder="Votre message" required onChange={handleChange} />
            {feedback.message ? <p className={`form-feedback form-feedback--${feedback.type}`}>{feedback.message}</p> : null}
            <button className="button button--primary" type="submit" disabled={submitting}>
              {submitting ? "Envoi en cours…" : "Envoyer le message"}
            </button>
          </form>
        </div>
      </section>

      <footer className="site-footer">
        <div className="section-shell site-footer__inner">
          <p>© 2026 ONG RAFIA. Tous droits réservés.</p>
        </div>
      </footer>
    </>
  );
};
