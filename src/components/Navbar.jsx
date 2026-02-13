import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGE_OPTIONS } from "../i18n/translations";
import { MOVIE_GENRES, SERIES_GENRES, DOCUMENTARY_GENRES, GENRE_TO_KEY } from "../data/navCategories";
import "./Navbar.css";

export default function Navbar({ transparent = false }) {
  const [showMenu, setShowMenu] = useState(false);
  const [hoverDropdown, setHoverDropdown] = useState(null);
  const { user, currentProfile, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className={`navbar ${transparent || isLanding ? "transparent" : "solid"}`}>
      <Link to="/" className="navbar-logo">
        CrazyView
      </Link>
      {user && (
        <div className="navbar-center">
          <NavLink to="/browse/my-list" className="nav-link">{t("nav.myList")}</NavLink>
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => setHoverDropdown("movies")}
            onMouseLeave={() => setHoverDropdown(null)}
          >
            <NavLink to="/browse/movies" className="nav-link">{t("nav.movies")}</NavLink>
            <div className={`nav-genre-dropdown ${hoverDropdown === "movies" ? "visible" : ""}`}>
              {MOVIE_GENRES.map((genre) => (
                <Link key={genre} to={`/browse/movies?genre=${encodeURIComponent(genre)}`} className="nav-genre-link">
                  {t(GENRE_TO_KEY[genre]) || genre}
                </Link>
              ))}
            </div>
          </div>
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => setHoverDropdown("series")}
            onMouseLeave={() => setHoverDropdown(null)}
          >
            <NavLink to="/browse/series" className="nav-link">{t("nav.series")}</NavLink>
            <div className={`nav-genre-dropdown ${hoverDropdown === "series" ? "visible" : ""}`}>
              {SERIES_GENRES.map((genre) => (
                <Link key={genre} to={`/browse/series?genre=${encodeURIComponent(genre)}`} className="nav-genre-link">
                  {t(GENRE_TO_KEY[genre]) || genre}
                </Link>
              ))}
            </div>
          </div>
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => setHoverDropdown("documentaries")}
            onMouseLeave={() => setHoverDropdown(null)}
          >
            <NavLink to="/browse/documentaries" className="nav-link">{t("nav.documentaries")}</NavLink>
            <div className={`nav-genre-dropdown ${hoverDropdown === "documentaries" ? "visible" : ""}`}>
              {DOCUMENTARY_GENRES.map((genre) => (
                <Link key={genre} to={`/browse/documentaries?genre=${encodeURIComponent(genre)}`} className="nav-genre-link">
                  {t(GENRE_TO_KEY[genre]) || genre}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="navbar-right">
        {user ? (
          <>
            <select className="nav-lang" value={lang} onChange={(e) => setLang(e.target.value)}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>{opt.label}</option>
              ))}
            </select>
            <div className="nav-profile" onClick={() => setShowMenu(!showMenu)}>
              <div className="profile-avatar">
                {user?.profileAvatars?.[currentProfile] ? (
                  <img src={user.profileAvatars[currentProfile]} alt="" />
                ) : (
                  "U"
                )}
              </div>
              <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z" />
              </svg>
              {showMenu && (
                <div className="dropdown-menu">
                  <Link to="/profiles" onClick={() => setShowMenu(false)}>{t("nav.manageProfiles")}</Link>
                  <Link to="/account" onClick={() => setShowMenu(false)}>{t("nav.account")}</Link>
                  <Link to="/help" onClick={() => setShowMenu(false)}>{t("nav.helpCenter")}</Link>
                  <button onClick={() => { logout(); setShowMenu(false); }}>{t("nav.signOut")}</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <select className="nav-lang" value={lang} onChange={(e) => setLang(e.target.value)}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>{opt.label}</option>
              ))}
            </select>
            <Link to="/login" className="nav-btn-signin">{t("nav.signIn")}</Link>
          </>
        )}
      </div>
    </nav>
  );
}
