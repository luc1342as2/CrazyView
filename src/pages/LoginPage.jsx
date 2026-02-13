import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import "./AuthPages.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) navigate("/profiles", { replace: true });
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate("/profiles", { replace: true });
    } else {
      setError(result.error || t("login.error"));
    }
  };

  return (
    <div className="auth-page">
      <Navbar transparent={false} />
      <div className="auth-bg">
        <div className="auth-card">
          <h1>{t("login.title")}</h1>
          {location.state?.message && (
            <div className="auth-success">{location.state.message}</div>
          )}
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder={t("login.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? t("login.signingIn") : t("login.submit")}
            </button>
          </form>
          <div className="auth-help">
            <label className="checkbox">
              <input type="checkbox" />
              <span>{t("login.rememberMe")}</span>
            </label>
            <Link to="/forgot-password">{t("login.needHelp")}</Link>
          </div>
          <p className="auth-new">
            {t("login.newUser")} <Link to="/signup">{t("login.signUpNow")}</Link>.
          </p>
          <p className="auth-captcha">
            {t("login.captcha")}
          </p>
        </div>
      </div>
    </div>
  );
}
