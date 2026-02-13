import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import "./AuthPages.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { requestPasswordReset } = useAuth();
  const { t } = useLanguage();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await requestPasswordReset(email.trim());
    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      const errMsg =
        typeof result.error === "string" &&
        (result.error.startsWith("reset.") || result.error.startsWith("signup."))
          ? t(result.error)
          : result.error || t("reset.errorGeneric");
      setError(errMsg);
    }
  };

  return (
    <div className="auth-page">
      <Navbar transparent={false} />
      <div className="auth-bg">
        <div className="auth-card">
          <h1>{t("reset.title")}</h1>
          {error && <div className="auth-error">{error}</div>}

          {sent ? (
            <div className="reset-sent">
              <p className="reset-desc">{t("reset.checkEmail")}</p>
              <p className="reset-sent-note">
                We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRequestReset}>
              <p className="reset-desc">{t("reset.enterEmail")}</p>
              <input
                type="email"
                placeholder={t("signup.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? t("reset.sending") : t("reset.sendCode")}
              </button>
            </form>
          )}

          <p className="auth-new">
            <Link to="/login">{t("reset.backToLogin")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
