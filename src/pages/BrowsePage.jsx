import { useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ContentRow from "../components/ContentRow";
import { useMyList } from "../context/MyListContext";
import { useLanguage } from "../context/LanguageContext";
import { contentCatalog, contentRows } from "../data/content";
import { GENRE_TO_KEY } from "../data/navCategories";
import "./BrowsePage.css";

export default function BrowsePage() {
  const { section } = useParams();
  const [searchParams] = useSearchParams();
  const genre = searchParams.get("genre");
  const { myList } = useMyList();
  const { t } = useLanguage();

  const allMovies = Object.values(contentCatalog).filter((c) => c.type === "movie");
  const allSeries = Object.values(contentCatalog).filter((c) => c.type === "show");
  const docGenres = ["Biography", "History"];
  const allDocumentaries = Object.values(contentCatalog).filter((c) =>
    (c.genre || []).some((g) => docGenres.includes(g))
  );
  const allContent = Object.values(contentCatalog);

  const filterByGenre = (items) => {
    if (!genre) return items;
    return items.filter((c) => (c.genre || []).includes(genre));
  };

  const getContent = () => {
    if (section === "movies") {
      const items = filterByGenre(allMovies);
      const genreLabel = genre ? (t(GENRE_TO_KEY[genre]) || genre) : null;
      const title = genreLabel ? `${t("nav.movies")} - ${genreLabel}` : t("nav.movies");
      return <ContentRow key={`movies-${genre || "all"}`} title={title} items={items} />;
    }
    if (section === "series") {
      const items = filterByGenre(allSeries);
      const genreLabel = genre ? (t(GENRE_TO_KEY[genre]) || genre) : null;
      const title = genreLabel ? `${t("nav.series")} - ${genreLabel}` : t("nav.series");
      return <ContentRow key={`series-${genre || "all"}`} title={title} items={items} />;
    }
    if (section === "documentaries") {
      const items = genre ? filterByGenre(allContent) : allDocumentaries;
      const genreLabel = genre ? (t(GENRE_TO_KEY[genre]) || genre) : null;
      const title = genreLabel ? `${t("nav.documentaries")} - ${genreLabel}` : t("nav.documentaries");
      return <ContentRow key={`documentaries-${genre || "all"}`} title={title} items={items} />;
    }
    if (section === "my-list") {
      return myList.length > 0 ? (
        <ContentRow key="my-list" title={t("nav.myList")} items={myList} />
      ) : (
        <div className="browse-empty">
          <h2>{t("browse.myListEmpty")}</h2>
          <p>{t("browse.addToWatchLater")}</p>
        </div>
      );
    }
    return (
      <>
        {myList.length > 0 && (
          <ContentRow key="My List" title={t("nav.myList")} items={myList} />
        )}
        {contentRows.map((row) => (
          <ContentRow key={row.titleKey} title={t(row.titleKey)} items={row.items} />
        ))}
      </>
    );
  };

  return (
    <div className="browse-page">
      <Navbar />
      <main>
        <Hero />
        <div className="browse-rows">{getContent()}</div>
      </main>
    </div>
  );
}
