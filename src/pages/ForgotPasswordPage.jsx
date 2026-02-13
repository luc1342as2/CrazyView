import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import "./AuthPages.css";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset, resetPassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await requestPasswordReset(email.trim());
    setLoading(false);
    if (result.success) {
      setSentCode(result.code);
      setStep(2);
    } else {
      const errMsg =
        typeof result.error === "string" &&
        (result.error.startsWith("reset.") || result.error.startsWith("signup."))
          ? t(result.error)
          : result.error || t("reset.errorGeneric");
      setError(errMsg);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setLoading(true);
    const result = await resetPassword(email.trim(), code, newPassword);
    setLoading(false);
    if (result.success) {
      navigate("/login", { replace: true, state: { message: t("reset.successMessage") } });
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

          {step === 1 ? (
            <form onSubmit={handleRequestCode}>
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
          ) : (
            <form onSubmit={handleResetPassword}>
              <p className="reset-desc">{t("reset.checkEmail")}</p>
              <div className="reset-demo-code">
                {t("reset.demoCodeLabel")} <strong>{sentCode}</strong>
              </div>
              <input
                type="text"
                placeholder={t("reset.codePlaceholder")}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
              />
              <input
                type="password"
                placeholder={t("reset.newPasswordPlaceholder")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={4}
                maxLength={60}
                autoComplete="new-password"
              />
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? t("reset.resetting") : t("reset.resetPassword")}
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
