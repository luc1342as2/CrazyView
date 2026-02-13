import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import "./AuthPages.css";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(null);
  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const hasRecovery = hash && (hash.includes("type=recovery") || hash.includes("access_token"));
    if (!hasRecovery) {
      setValidSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session);
      if (session) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const result = await resetPassword(newPassword);
    setLoading(false);
    if (result.success) {
      navigate("/login", { replace: true, state: { message: t("reset.successMessage") } });
    } else {
      setError(result.error || t("reset.errorGeneric"));
    }
  };

  if (validSession === null) {
    return null;
  }

  if (validSession === false) {
    return (
      <div className="auth-page">
        <Navbar transparent={false} />
        <div className="auth-bg">
          <div className="auth-card">
            <h1>Reset Password</h1>
            <p className="reset-desc">
              Invalid or expired reset link. Please request a new one.
            </p>
            <p className="auth-new">
              <Link to="/forgot-password">Request new link</Link>
            </p>
            <p className="auth-new">
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Navbar transparent={false} />
      <div className="auth-bg">
        <div className="auth-card">
          <h1>Reset Password</h1>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder={t("reset.newPasswordPlaceholder")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              maxLength={60}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              maxLength={60}
              autoComplete="new-password"
            />
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? t("reset.resetting") : t("reset.resetPassword")}
            </button>
          </form>
          <p className="auth-new">
            <Link to="/login">{t("reset.backToLogin")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
