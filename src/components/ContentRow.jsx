import { useState, useRef } from "react";
import ContentDetailModal from "./ContentDetailModal";
import PlayerModal from "./PlayerModal";
import { contentCatalog } from "../data/content";
import "./ContentRow.css";

export default function ContentRow({ title, items }) {
  const [selectedContent, setSelectedContent] = useState(null);
  const [playingContent, setPlayingContent] = useState(null);
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (!rowRef.current) return;
    const scrollAmount = 400;
    rowRef.current.scrollBy({ left: dir * scrollAmount, behavior: "smooth" });
  };

  const getContent = (item) => {
    if (typeof item === "number") return contentCatalog[item];
    if (item && typeof item === "object" && item.id) return contentCatalog[item.id] || item;
    return item;
  };

  const resolvedItems = items.map((item) => {
    const content = getContent(item);
    return content || item;
  }).filter(Boolean);

  return (
    <div className="content-row">
      <h2 className="row-title">{title}</h2>
      <div className="row-container">
        <button className="row-nav left" onClick={() => scroll(-1)} aria-label="Scroll left">
          <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
        </button>
        <div className="row-scroll" ref={rowRef}>
          {resolvedItems.map((item) => (
            <div
              key={item.id}
              className="row-item"
              onClick={() => setSelectedContent(item)}
            >
              <img src={item.poster} alt={item.title} />
              <div className="item-overlay">
                <span>{item.title}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="row-nav right" onClick={() => scroll(1)} aria-label="Scroll right">
          <svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" /></svg>
        </button>
      </div>
      {selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onPlay={() => { setPlayingContent(selectedContent); setSelectedContent(null); }}
          onSelectSimilar={(item) => setSelectedContent(item)}
        />
      )}
      {playingContent && (
        <PlayerModal content={playingContent} onClose={() => setPlayingContent(null)} />
      )}
    </div>
  );
}
