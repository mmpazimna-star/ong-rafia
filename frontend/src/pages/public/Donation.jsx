import { useState } from "react";
import api from "../../api/axios";

const initialState = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export const Donation = ({ data }) => {
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
      const { data: response } = await api.post("/api/public/donations", { name, email, phone, message });
      clearState();
      setFeedback({ type: "success", message: response.message });
    } catch (error) {
      setFeedback({ type: "error", message: error.response?.data?.message || "L’envoi a échoué. Réessayez plus tard." });
    } finally { setSubmitting(false); }
  };

  return (
    <section className="content-section" id="donation">
      <div className="section-shell donation-layout donation-layout--distinct">
        <div className="donation-panel donation-panel--primary donation-panel--warm">
          <div className="section-heading section-heading--compact section-heading--support">
            <span className="section-kicker">Soutenir RAFIA</span>
            <h2>Soutenir RAFIA, c’est renforcer des actions utiles sur le terrain</h2>
            <p>
              Votre appui peut prendre la forme d’un don, d’un partenariat ou d’un soutien
              matériel. Chaque contribution aide à renforcer les actions sur le terrain.
            </p>
          </div>

          <div className="donation-points donation-points--support">
            <div>
              <strong>Pourquoi soutenir</strong>
              <span>Pour renforcer des actions concrètes menées au plus près des communautés.</span>
            </div>
            <div>
              <strong>Comment contribuer</strong>
              <span>Par un don, un partenariat, un appui logistique ou une mise en relation utile.</span>
            </div>
            <div>
              <strong>Contact de soutien</strong>
              <span>{data?.email || "Information non renseignée"}</span>
              {data?.phone ? <span>{data.phone}</span> : null}
            </div>
          </div>
        </div>

        <form className="donation-form donation-form--support" name="donationMessage" onSubmit={handleSubmit}>
          <div className="donation-form__intro">
            <span className="section-kicker">Passer à l’action</span>
            <h3>Je souhaite soutenir RAFIA</h3>
            <p>Précisez votre intention de soutien afin d’être recontacté rapidement.</p>
          </div>
          <label className="sr-only" htmlFor="donation-name">Votre nom</label><input id="donation-name" type="text" name="name" value={name} placeholder="Votre nom" required onChange={handleChange} />
          <label className="sr-only" htmlFor="donation-email">Votre adresse e-mail</label><input id="donation-email" type="email" name="email" value={email} placeholder="Votre adresse e-mail" required onChange={handleChange} />
          <label className="sr-only" htmlFor="donation-phone">Votre numéro de téléphone</label><input id="donation-phone" type="tel" name="phone" value={phone} placeholder="Votre numéro de téléphone" required onChange={handleChange} />
          <label className="sr-only" htmlFor="donation-message">Votre message</label>
          <textarea
            id="donation-message"
            name="message"
            rows="5"
            value={message}
            placeholder="Type de soutien souhaité : don, partenariat, équipement, accompagnement…"
            required
            onChange={handleChange}
          />
          {feedback.message ? <p className={`form-feedback form-feedback--${feedback.type}`}>{feedback.message}</p> : null}
          <button className="button button--primary" type="submit" disabled={submitting}>
            {submitting ? "Envoi en cours…" : "Envoyer ma demande de soutien"}
          </button>
        </form>
      </div>
    </section>
  );
};
