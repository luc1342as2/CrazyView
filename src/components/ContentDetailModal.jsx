import { useEffect, useRef, useMemo } from "react";
import { useMyList } from "../context/MyListContext";
import { useLanguage } from "../context/LanguageContext";
import { getSimilarContent } from "../data/content";
import { getContentDescription } from "../i18n/contentTranslations";
import { GENRE_TO_KEY } from "../data/navCategories";
import "./ContentDetailModal.css";

export default function ContentDetailModal({ content, onClose, onPlay, onSelectSimilar }) {
  const similarRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const { toggleInList, isInList } = useMyList();
  const { t, lang } = useLanguage();
  const similarContent = useMemo(() => getSimilarContent(content, 12), [content]);

  if (!content) return null;

  const inList = isInList(content.id);
  const trailerUrl = content.trailerId
    ? `https://www.youtube.com/embed/${content.trailerId}?autoplay=1&mute=1&rel=0`
    : null;

  return (
    <div
      className="detail-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="detail-modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div className="detail-modal-header">
          <div
            className="detail-backdrop"
            style={{ backgroundImage: `url(${content.backdrop})` }}
          />
          <div className="detail-header-content">
            <h1 className="detail-title">{content.title}</h1>
            <div className="detail-meta">
              {content.rating && (
                <span className="detail-rating">★ {content.rating}</span>
              )}
              <span className="maturity">{content.maturity}</span>
              <span>{content.year}</span>
              <span>{content.duration}</span>
              <span>{(content.genre || []).map((g) => t(GENRE_TO_KEY[g]) || g).join(" • ")}</span>
            </div>
            <div className="detail-actions">
              <button className="btn-play" onClick={() => onPlay?.()}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {t("common.play")}
              </button>
              <button className={`btn-add ${inList ? "in-list" : ""}`} onClick={() => toggleInList(content)}>
                {inList ? t("common.inMyList") : `+ ${t("common.myList")}`}
              </button>
              <button className="btn-similar" onClick={() => similarRef.current?.scrollIntoView({ behavior: "smooth" })}>
                {t("common.similar")}
              </button>
            </div>
          </div>
        </div>

        <div className="detail-modal-body">
          <div className="detail-info-section">
            <h3>{t("common.about")}</h3>
            <p className="detail-description">
              {getContentDescription(lang, content.id, "longDescription", content.longDescription || content.description)}
            </p>
            {content.cast?.length > 0 && (
              <div className="detail-info-row">
                <span className="detail-label">{t("common.cast")}</span>
                <span>{content.cast.join(", ")}</span>
              </div>
            )}
            {content.creator && (
              <div className="detail-info-row">
                <span className="detail-label">{t("common.creator")}</span>
                <span>{content.creator}</span>
              </div>
            )}
          </div>

          {trailerUrl && (
            <div className="detail-trailer-section">
              <h3>{t("common.trailer")}</h3>
              <div className="detail-trailer-wrapper">
                <iframe
                  src={trailerUrl}
                  title={`${content.title} - Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {similarContent.length > 0 && (
            <div className="detail-similar-section" ref={similarRef}>
              <h3>{t("common.moreLikeThis")}</h3>
              <div className="detail-similar-row">
                {similarContent.map((item) => (
                  <div
                    key={item.id}
                    className="detail-similar-item"
                    onClick={() => onSelectSimilar?.(item)}
                  >
                    <img src={item.poster} alt={item.title} />
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
