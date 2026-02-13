import { useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import "./PlayerModal.css";

export default function PlayerModal({ content, onClose }) {
  const { t } = useLanguage();
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

  if (!content) return null;

  const trailerUrl = content.trailerId
    ? `https://www.youtube.com/embed/${content.trailerId}?autoplay=1&mute=1&controls=1&rel=0`
    : null;

  return (
    <div className="player-modal-overlay" onClick={onClose}>
      <div className="player-modal" onClick={(e) => e.stopPropagation()}>
        <button className="player-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
        <div className="player-video">
          {trailerUrl ? (
            <iframe
              src={trailerUrl}
              title={`${content.title} - Playing`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="player-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <p>{t("common.previewNotAvailable")}</p>
              <p className="player-title">{content.title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
