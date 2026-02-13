import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ContentRow from "../components/ContentRow";
import { contentRows } from "../data/content";
import "./LandingPage.css";

export default function LandingPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="landing-page landing-page--cta-only">
        <Navbar transparent />
        <div className="landing-cta">
          <h2>{t("landing.unlimited")}</h2>
          <p>{t("landing.watchAnywhere")}</p>
          <p className="cta-small">{t("landing.readyToWatch")}</p>
          <div className="cta-form">
            <Link to="/signup" className="cta-btn">{t("landing.getStarted")} &gt;</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <Navbar transparent />
      <Hero />
      <div className="content-rows">
        {contentRows.map((row) => (
          <ContentRow key={row.titleKey} title={t(row.titleKey)} items={row.items} />
        ))}
      </div>
      <footer className="landing-footer">
        <p>{t("footer.questions")}</p>
        <div className="footer-links">
          <a href="#">{t("footer.faq")}</a>
          <a href="#">{t("footer.helpCenter")}</a>
          <a href="#">{t("footer.account")}</a>
          <a href="#">{t("footer.mediaCenter")}</a>
          <a href="#">{t("footer.investorRelations")}</a>
          <a href="#">{t("footer.jobs")}</a>
          <a href="#">{t("footer.redeemGiftCards")}</a>
          <a href="#">{t("footer.buyGiftCards")}</a>
          <a href="#">{t("footer.waysToWatch")}</a>
          <a href="#">{t("footer.termsOfUse")}</a>
          <a href="#">{t("footer.privacy")}</a>
          <a href="#">{t("footer.cookiePrefs")}</a>
          <a href="#">{t("footer.corporateInfo")}</a>
          <a href="#">{t("footer.contactUs")}</a>
        </div>
        <p className="footer-lang">{t("footer.demo")}</p>
      </footer>
    </div>
  );
}
