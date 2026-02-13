import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { featuredContent } from "../data/content";
import { getContentDescription } from "../i18n/contentTranslations";
import { GENRE_TO_KEY } from "../data/navCategories";
import ContentDetailModal from "./ContentDetailModal";
import PlayerModal from "./PlayerModal";
import "./Hero.css";

export default function Hero() {
  const { t, lang } = useLanguage();
  const [active, setActive] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [detailContent, setDetailContent] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playingContent, setPlayingContent] = useState(null);
  const content = featuredContent[active];

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % featuredContent.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero">
      <div className="hero-backdrop">
        <img src={content.backdrop} alt="" />
        <div className="hero-gradient" />
      </div>
      <div className="hero-content">
        <h1 className="hero-title">{content.title}</h1>
        <p className="hero-description">{getContentDescription(lang, content.id, "description", content.description)}</p>
        <div className="hero-meta">
          <span className="maturity">{content.maturity}</span>
          <span>{content.year}</span>
          <span>{(content.genre || []).map((g) => t(GENRE_TO_KEY[g]) || g).join(" • ")}</span>
        </div>
        <div className="hero-actions">
          <button className="btn-play" onClick={() => { setPlayingContent(content); setShowPlayer(true); }}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            {t("common.play")}
          </button>
          <button className="btn-info" onClick={() => { setDetailContent(content); setShowDetail(true); }}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
            {t("common.moreInfo")}
          </button>
        </div>
      </div>
      <div className="hero-indicators">
        {featuredContent.map((_, i) => (
          <button
            key={i}
            className={`indicator ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
      {showDetail && detailContent && (
        <ContentDetailModal
          content={detailContent}
          onClose={() => setShowDetail(false)}
          onPlay={() => { setPlayingContent(detailContent); setShowDetail(false); setShowPlayer(true); }}
          onSelectSimilar={(item) => setDetailContent(item)}
        />
      )}
      {showPlayer && playingContent && (
        <PlayerModal content={playingContent} onClose={() => setShowPlayer(false)} />
      )}
    </section>
  );
}
