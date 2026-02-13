import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { subscriptionPlans } from "../data/plans";
import Navbar from "../components/Navbar";
import "./AuthPages.css";
import "./SignupPage.css";

const STEPS = { email: 1, password: 2, plan: 3, payment: 4 };

export default function SignupPage() {
  const [step, setStep] = useState(STEPS.email);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [planId, setPlanId] = useState("standard");
  const [payment, setPayment] = useState({ cardNumber: "", expiry: "", cvc: "", zip: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/profiles", { replace: true });
  }, [user, navigate]);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePassword = (p) => p.length >= 4 && p.length <= 60;

  const handleEmailNext = (e) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(email.trim())) {
      setError(t("signup.errorInvalidEmail"));
      return;
    }
    setStep(STEPS.password);
  };

  const handlePasswordNext = (e) => {
    e.preventDefault();
    setError("");
    if (!validatePassword(password)) {
      setError(t("signup.errorPassword"));
      return;
    }
    setStep(STEPS.plan);
  };

  const handlePlanNext = (e) => {
    e?.preventDefault?.();
    setStep(STEPS.payment);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { cardNumber, expiry, cvc, zip } = payment;
    const cardClean = cardNumber.replace(/\s/g, "");
    if (cardClean.length < 13) {
      setError(t("signup.errorCard"));
      return;
    }
    if (!expiry || expiry.length < 4) {
      setError(t("signup.errorExpiry"));
      return;
    }
    if (cvc.length < 3) {
      setError(t("signup.errorCvc"));
      return;
    }
    if (zip.length < 3) {
      setError(t("signup.errorZip"));
      return;
    }
    setLoading(true);
    const result = await signup(email.trim(), password, name.trim() || "User", planId);
    setLoading(false);
    if (result.success) {
      navigate("/profiles", { replace: true });
    } else {
      setError(result.error || t("login.error"));
    }
  };

  const formatCardNumber = (v) => v.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19);
  const formatExpiry = (v) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length >= 2) return clean.slice(0, 2) + "/" + clean.slice(2, 4);
    return clean;
  };

  return (
    <div className="auth-page">
      <Navbar transparent={false} />
      <div className="auth-bg">
        <div className="auth-card signup-card">
          <div className="signup-progress">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`progress-step ${step >= s ? "active" : ""}`} />
            ))}
          </div>
          <h1>
            {step === STEPS.email && t("signup.createAccount")}
            {step === STEPS.password && t("signup.createPassword")}
            {step === STEPS.plan && t("signup.choosePlan")}
            {step === STEPS.payment && t("signup.setupPayment")}
          </h1>
          {error && <div className="auth-error">{error}</div>}

          {step === STEPS.email && (
            <form onSubmit={handleEmailNext}>
              <input
                type="email"
                placeholder={t("signup.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <button type="submit" className="auth-submit">{t("signup.next")}</button>
            </form>
          )}

          {step === STEPS.password && (
            <form onSubmit={handlePasswordNext}>
              <input
                type="password"
                placeholder={t("signup.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                maxLength={60}
                autoComplete="new-password"
              />
              <input
                type="text"
                placeholder={t("signup.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
              />
              <button type="submit" className="auth-submit">{t("signup.next")}</button>
            </form>
          )}

          {step === STEPS.plan && (
            <>
              <div className="plan-grid">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-card ${planId === plan.id ? "selected" : ""} ${plan.recommended ? "recommended" : ""}`}
                    onClick={() => setPlanId(plan.id)}
                  >
                    {plan.recommended && <span className="plan-badge">{t("signup.mostPopular")}</span>}
                    <h3>{plan.name}</h3>
                    <p className="plan-price">${plan.price}<span>{t("signup.perMonth")}</span></p>
                    <ul>
                      {plan.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <button className="auth-submit" onClick={handlePlanNext}>{t("signup.continue")}</button>
            </>
          )}

          {step === STEPS.payment && (
            <form onSubmit={handlePaymentSubmit} className="payment-form">
              <div className="payment-row">
                <label>{t("signup.cardNumber")}</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={payment.cardNumber}
                  onChange={(e) => setPayment((p) => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))}
                  maxLength={19}
                />
              </div>
              <div className="payment-row two-cols">
                <div>
                  <label>{t("signup.expiryDate")}</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={payment.expiry}
                    onChange={(e) => setPayment((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                    maxLength={5}
                  />
                </div>
                <div>
                  <label>{t("signup.securityCode")}</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={payment.cvc}
                    onChange={(e) => setPayment((p) => ({ ...p, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    maxLength={4}
                  />
                </div>
              </div>
              <div className="payment-row">
                <label>{t("signup.billingZip")}</label>
                <input
                  type="text"
                  placeholder="12345"
                  value={payment.zip}
                  onChange={(e) => setPayment((p) => ({ ...p, zip: e.target.value }))}
                />
              </div>
              <p className="payment-note">
                {t("signup.paymentNote")} ${subscriptionPlans.find((p) => p.id === planId)?.price}{t("signup.perMonthCharge")}
              </p>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? t("signup.processing") : t("signup.startMembership")}
              </button>
            </form>
          )}

          <p className="auth-new">
            {step === STEPS.email && <>{t("signup.alreadyHaveAccount")} <Link to="/login">{t("login.submit")}</Link>.</>}
            {step > STEPS.email && (
              <button type="button" className="link-btn" onClick={() => setStep(Math.max(1, step - 1))}>
                {t("signup.back")}
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
