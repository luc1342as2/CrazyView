import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import "./HelpCenterPage.css";

const HELP_SECTIONS = [
  {
    id: "getting-started",
    titleKey: "helpCenter.gettingStarted",
    articles: [
      { titleKey: "helpCenter.whatIsCrazyView", descKey: "helpCenter.whatIsCrazyViewDesc", bodyKey: "helpCenter.articleWhatIsCrazyView" },
      { titleKey: "helpCenter.createAccount", descKey: "helpCenter.createAccountDesc", bodyKey: "helpCenter.articleCreateAccount" },
      { titleKey: "helpCenter.plansAndPricing", descKey: "helpCenter.plansAndPricingDesc", bodyKey: "helpCenter.articlePlansAndPricing" },
    ],
  },
  {
    id: "account-billing",
    titleKey: "helpCenter.accountBilling",
    articles: [
      { titleKey: "helpCenter.updatePayment", descKey: "helpCenter.updatePaymentDesc", bodyKey: "helpCenter.articleUpdatePayment" },
      { titleKey: "helpCenter.cancelMembership", descKey: "helpCenter.cancelMembershipDesc", bodyKey: "helpCenter.articleCancelMembership" },
      { titleKey: "helpCenter.changeEmail", descKey: "helpCenter.changeEmailDesc", bodyKey: "helpCenter.articleChangeEmail" },
    ],
  },
  {
    id: "streaming",
    titleKey: "helpCenter.streaming",
    articles: [
      { titleKey: "helpCenter.whereToWatch", descKey: "helpCenter.whereToWatchDesc", bodyKey: "helpCenter.articleWhereToWatch" },
      { titleKey: "helpCenter.downloadContent", descKey: "helpCenter.downloadContentDesc", bodyKey: "helpCenter.articleDownloadContent" },
      { titleKey: "helpCenter.videoQuality", descKey: "helpCenter.videoQualityDesc", bodyKey: "helpCenter.articleVideoQuality" },
    ],
  },
  {
    id: "profiles",
    titleKey: "helpCenter.profiles",
    articles: [
      { titleKey: "helpCenter.createProfile", descKey: "helpCenter.createProfileDesc", bodyKey: "helpCenter.articleCreateProfile" },
      { titleKey: "helpCenter.myList", descKey: "helpCenter.myListDesc", bodyKey: "helpCenter.articleMyList" },
      { titleKey: "helpCenter.parentalControls", descKey: "helpCenter.parentalControlsDesc", bodyKey: "helpCenter.articleParentalControls" },
    ],
  },
];

const RTL_LANGS = ["ar", "he"];

export default function HelpCenterPage() {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [expandedArticle, setExpandedArticle] = useState(null);
  const isRtl = RTL_LANGS.includes(lang);

  return (
    <div className="help-center-page">
      <Navbar />
      <div className="help-center-content" dir={isRtl ? "rtl" : "ltr"}>
        <header className="help-center-header">
          <h1>{t("helpCenter.title")}</h1>
          <p className="help-center-subtitle">{t("helpCenter.subtitle")}</p>
          <div className="help-center-search">
            <input
              type="search"
              placeholder={t("helpCenter.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="help-center-search-input"
            />
            <svg className="help-center-search-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>
        </header>

        <div className="help-center-sections">
          {HELP_SECTIONS.map((section) => {
            const searchLower = search.toLowerCase().trim();
            const filteredArticles = searchLower
              ? section.articles.filter(
                  (a) =>
                    t(a.titleKey).toLowerCase().includes(searchLower) ||
                    t(a.descKey).toLowerCase().includes(searchLower) ||
                    (a.bodyKey && t(a.bodyKey).toLowerCase().includes(searchLower))
                )
              : section.articles;
            if (filteredArticles.length === 0) return null;
            return (
            <section key={section.id} className="help-center-section">
              <h2>{t(section.titleKey)}</h2>
              <ul className="help-center-articles">
                {filteredArticles.map((article) => {
                  const articleId = `${section.id}-${article.titleKey}`;
                  const isExpanded = expandedArticle === articleId;
                  return (
                    <li key={article.titleKey} className="help-center-article">
                      <button
                        type="button"
                        className="help-center-article-link"
                        onClick={() => setExpandedArticle(isExpanded ? null : articleId)}
                      >
                        <span className="article-text">
                          <span className="article-title">{t(article.titleKey)}</span>
                          <span className="article-desc">{t(article.descKey)}</span>
                        </span>
                        <span className="article-expand-icon">{isExpanded ? "−" : "+"}</span>
                      </button>
                      {isExpanded && article.bodyKey && (
                        <div className="help-center-article-body">
                          <p>{t(article.bodyKey)}</p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
            );
          })}
        </div>

        <div className="help-center-contact">
          <h2>{t("help.contactTitle")}</h2>
          <p>{t("help.contactDesc")}</p>
          <Link to="/help" className="help-center-contact-btn">
            {t("help.faqTitle")}
          </Link>
          <Link to="/help" className="help-center-contact-link">
            {t("help.visitHelp")}{isRtl ? " ←" : " →"}
          </Link>
        </div>

        <div className="help-center-footer-links">
          <Link to="/browse">{t("help.backToBrowse")}</Link>
          <span className="separator">|</span>
          <Link to="/account">{t("account.title")}</Link>
        </div>
      </div>
    </div>
  );
}
