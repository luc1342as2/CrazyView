import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import "./HelpPage.css";

const FAQ_INDICES = [1, 2, 3, 4, 5];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const { t } = useLanguage();
  const faqs = FAQ_INDICES.map((i) => ({ q: t(`help.faq${i}q`), a: t(`help.faq${i}a`) }));

  return (
    <div className="help-page">
      <Navbar />
      <div className="help-content">
        <h1>{t("help.faqTitle")}</h1>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <button
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                {faq.q}
                <span className="faq-icon">{openIndex === i ? "×" : "+"}</span>
              </button>
              {openIndex === i && <p className="faq-answer">{faq.a}</p>}
            </div>
          ))}
        </div>
        <div className="help-contact">
          <h2>{t("help.contactTitle")}</h2>
          <p>{t("help.contactDesc")}</p>
          <Link to="/help-center" className="help-link">
            {t("help.visitHelp")} →
          </Link>
        </div>
        <Link to="/browse" className="help-back">{t("help.backToBrowse")}</Link>
      </div>
    </div>
  );
}
