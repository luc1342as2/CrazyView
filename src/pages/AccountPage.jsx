import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { subscriptionPlans } from "../data/plans";
import { Enable2FAModal, Disable2FAModal, Verify2FACodeModal } from "../components/TwoFAModal";
import Navbar from "../components/Navbar";
import "./AccountPage.css";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function AccountPage() {
  const { user, updateUser, updateProfile, verifyPassword } = useAuth();
  const { t } = useLanguage();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEmailVerifyModal, setShowEmailVerifyModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showEnable2FAModal, setShowEnable2FAModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCardLast4, setNewCardLast4] = useState("");
  const [newCardBrand, setNewCardBrand] = useState("Visa");
  const [error, setError] = useState("");

  const plan = subscriptionPlans.find((p) => p.id === user?.plan) || subscriptionPlans[1];
  const twoFA = user?.twoFA ?? false;
  const planCancelled = user?.planCancelled ?? false;
  const cardDisplay = user?.cardLast4
    ? `${user?.cardBrand || "Visa"} •••• ${user.cardLast4}`
    : `${user?.cardBrand || "Visa"} •••• 4242`;

  const handleChangePlan = (planId) => {
    updateUser({ plan: planId, planCancelled: false, planEndsAt: null });
    setShowPlanModal(false);
  };

  const handleCancelPlan = () => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    updateUser({ planCancelled: true, planEndsAt: endDate.toISOString().split("T")[0] });
    setShowCancelModal(false);
  };

  const handleUpdateCard = (e) => {
    e.preventDefault();
    setError("");
    const last4 = newCardLast4.replace(/\D/g, "");
    if (last4.length !== 4) {
      setError(t("account.errorInvalidCard"));
      return;
    }
    updateUser({ cardLast4: last4, cardBrand: newCardBrand });
    setShowCardModal(false);
    setNewCardLast4("");
  };

  const handleChangeEmail = (e) => {
    e.preventDefault();
    setError("");
    if (!newEmail.trim()) {
      setError(t("account.errorInvalidEmail"));
      return;
    }
    const users = JSON.parse(localStorage.getItem("netflix_users") || "{}");
    if (users[newEmail.trim()] && newEmail.trim() !== user?.email) {
      setError(t("account.errorEmailExists"));
      return;
    }
    updateUser({ email: newEmail.trim() });
    setShowEmailModal(false);
    setShowEmailVerifyModal(false);
    setNewEmail("");
  };

  const handleAddPhone = (e) => {
    e.preventDefault();
    setError("");
    if (!newPhone.trim()) {
      setError(t("account.errorInvalidPhone"));
      return;
    }
    updateUser({ phone: newPhone.trim() });
    setShowPhoneModal(false);
    setNewPhone("");
  };

  const handleEnable2FA = (data) => {
    updateUser({
      twoFA: true,
      twoFAMethod: data.method,
      twoFAValue: data.value,
    });
    setShowEnable2FAModal(false);
  };

  const handleDisable2FA = () => {
    updateUser({
      twoFA: false,
      twoFAMethod: null,
      twoFAValue: "",
    });
    setShowDisable2FAModal(false);
  };

  const handle2FAClick = () => {
    if (twoFA) setShowDisable2FAModal(true);
    else setShowEnable2FAModal(true);
  };

  const handleChangeEmailClick = () => {
    setShowEmailVerifyModal(true);
  };

  const handleEmailVerifySuccess = () => {
    setShowEmailVerifyModal(false);
    setShowEmailModal(true);
  };

  const handleSaveProfile = () => {
    if (showProfileEdit && editValue.trim()) {
      updateProfile(showProfileEdit, editValue.trim());
      setShowProfileEdit(null);
      setEditValue("");
    }
  };

  return (
    <div className="account-page">
      <Navbar />
      <div className="account-content">
        <h1>{t("account.title")}</h1>

        <div className="account-section">
          <h2>{t("account.membership")}</h2>
          <div className="account-row">
            <div>
              <p className="account-label">{t("account.email")}</p>
              <p className="account-value">{user?.email}</p>
            </div>
            {twoFA ? (
              <button className="account-link-btn" onClick={handleChangeEmailClick}>
                {t("account.changeEmail")}
              </button>
            ) : (
              <span className="account-hint">{t("account.enable2FAHint")}</span>
            )}
          </div>
          <div className="account-row">
            <div>
              <p className="account-label">{t("account.phone")}</p>
              <p className="account-value">{user?.phone || t("account.notAdded")}</p>
            </div>
            <button className="account-link-btn" onClick={() => setShowPhoneModal(true)}>
              {user?.phone ? t("account.change") : t("account.add")}
            </button>
          </div>
          <div className="account-row">
            <div>
              <p className="account-label">{t("account.paymentMethod")}</p>
              <p className="account-value">{cardDisplay || t("account.cardOnFile")}</p>
            </div>
            <button className="account-link-btn" onClick={() => { setNewCardLast4(user?.cardLast4 || ""); setNewCardBrand(user?.cardBrand || "Visa"); setShowCardModal(true); }}>
              {t("account.updateCard")}
            </button>
          </div>
          <div className="account-row">
            <div>
              <p className="account-label">{t("account.plan")}</p>
              <p className="account-value">
                {planCancelled
                  ? `${t("account.cancelledPlan")}${user?.planEndsAt ? ` — ${t("account.planCancelledAt")} ${formatDate(user.planEndsAt)}` : ""}`
                  : `${plan.name} - $${plan.price}/month`}
              </p>
            </div>
            {planCancelled ? (
              <button className="account-link-btn" onClick={() => setShowPlanModal(true)}>
                {t("account.pickPlan")}
              </button>
            ) : (
              <div className="account-plan-actions">
                <button className="account-link-btn" onClick={() => setShowPlanModal(true)}>
                  {t("account.changePlan")}
                </button>
                <button className="account-link-btn cancel" onClick={() => setShowCancelModal(true)}>
                  {t("account.cancelPlan")}
                </button>
              </div>
            )}
          </div>
          <div className="account-row">
            <div>
              <p className="account-label">{t("account.memberSince")}</p>
              <p className="account-value">{formatDate(user?.memberSince)}</p>
            </div>
          </div>
          <div className="account-row">
            <div>
              <p className="account-label">{t("account.twoFA")}</p>
              <p className="account-value">
                {twoFA ? `Enabled (${user?.twoFAMethod === "phone" ? "phone" : "email"})` : "Disabled"}
              </p>
            </div>
            <button className="account-link-btn" onClick={handle2FAClick}>
              {twoFA ? t("account.disable") : t("account.enable")}
            </button>
          </div>
        </div>

        <div className="account-section">
          <h2>{t("account.profiles")}</h2>
          {(user?.profiles || []).map((name) => (
            <div key={name} className="account-row">
              <div>
                <p className="account-label">{t("account.profiles")}</p>
                <p className="account-value">
                  {showProfileEdit === name ? (
                    <input
                      type="text"
                      className="account-edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                      autoFocus
                    />
                  ) : (
                    name
                  )}
                </p>
              </div>
              {showProfileEdit === name ? (
                <div className="account-edit-actions">
                  <button className="account-link-btn" onClick={handleSaveProfile}>{t("account.save")}</button>
                  <button className="account-link-btn cancel" onClick={() => { setShowProfileEdit(null); setEditValue(""); }}>{t("account.cancel")}</button>
                </div>
              ) : (
                <button className="account-link-btn" onClick={() => { setShowProfileEdit(name); setEditValue(name); }}>
                  {t("account.edit")}
                </button>
              )}
            </div>
          ))}
          <div className="account-row">
            <Link to="/profiles" className="account-link">{t("account.manageProfilesLink")}</Link>
          </div>
        </div>

        <div className="account-actions">
          <Link to="/browse" className="account-back">{t("account.backToBrowse")}</Link>
        </div>
      </div>

      {/* Change Plan Modal */}
      {showPlanModal && (
        <div className="account-modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="account-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{planCancelled ? t("account.pickPlan") : t("account.changePlan")}</h3>
            <div className="plan-options">
              {subscriptionPlans.map((p) => (
                <div
                  key={p.id}
                  className={`plan-option ${!planCancelled && user?.plan === p.id ? "current" : ""}`}
                  onClick={() => handleChangePlan(p.id)}
                >
                  <div className="plan-option-header">
                    <span className="plan-name">{p.name}</span>
                    <span className="plan-price">${p.price}/mo</span>
                  </div>
                  {!planCancelled && user?.plan === p.id && <span className="plan-badge">{t("account.currentPlan")}</span>}
                </div>
              ))}
            </div>
            <button className="account-modal-close" onClick={() => setShowPlanModal(false)}>{t("account.cancel")}</button>
          </div>
        </div>
      )}

      {/* Cancel Plan Modal */}
      {showCancelModal && (
        <div className="account-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="account-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("account.cancelPlan")}</h3>
            <p className="account-modal-text">{t("account.confirmCancel")}</p>
            <div className="account-modal-buttons" style={{ marginTop: 16 }}>
              <button className="account-btn-primary" onClick={handleCancelPlan} style={{ background: "#e50914" }}>
                {t("account.cancelPlan")}
              </button>
              <button className="account-btn-secondary" onClick={() => setShowCancelModal(false)}>
                {t("account.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Card Modal */}
      {showCardModal && (
        <div className="account-modal-overlay" onClick={() => setShowCardModal(false)}>
          <div className="account-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("account.updateCard")}</h3>
            {error && <p className="account-modal-error">{error}</p>}
            <form onSubmit={handleUpdateCard}>
              <div className="account-modal-row">
                <label className="account-modal-label">{t("account.cardBrand")}</label>
                <select
                  value={newCardBrand}
                  onChange={(e) => setNewCardBrand(e.target.value)}
                  className="account-modal-input"
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Amex">Amex</option>
                </select>
              </div>
              <div className="account-modal-row">
                <label className="account-modal-label">{t("account.cardLast4")}</label>
                <input
                  type="text"
                  placeholder="4242"
                  maxLength={4}
                  value={newCardLast4}
                  onChange={(e) => setNewCardLast4(e.target.value.replace(/\D/g, ""))}
                  className="account-modal-input"
                />
              </div>
              <div className="account-modal-buttons">
                <button type="submit" className="account-btn-primary">{t("account.save")}</button>
                <button type="button" className="account-btn-secondary" onClick={() => setShowCardModal(false)}>{t("account.cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify 2FA before Change Email */}
      {showEmailVerifyModal && twoFA && (
        <Verify2FACodeModal
          twoFAValue={user?.twoFAValue}
          twoFAMethod={user?.twoFAMethod}
          onClose={() => setShowEmailVerifyModal(false)}
          onSuccess={handleEmailVerifySuccess}
        />
      )}

      {/* Change Email Modal (after verification) */}
      {showEmailModal && twoFA && (
        <div className="account-modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="account-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("account.changeEmail")}</h3>
            {error && <p className="account-modal-error">{error}</p>}
            <form onSubmit={handleChangeEmail}>
              <input
                type="email"
                placeholder={t("account.newEmailPlaceholder")}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="account-modal-input"
              />
              <div className="account-modal-buttons">
                <button type="submit" className="account-btn-primary">{t("account.save")}</button>
                <button type="button" className="account-btn-secondary" onClick={() => setShowEmailModal(false)}>{t("account.cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Change Phone Modal */}
      {showPhoneModal && (
        <div className="account-modal-overlay" onClick={() => setShowPhoneModal(false)}>
          <div className="account-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{user?.phone ? `${t("account.change")} ${t("account.phone")}` : `${t("account.add")} ${t("account.phone")}`}</h3>
            {error && <p className="account-modal-error">{error}</p>}
            <form onSubmit={handleAddPhone}>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="account-modal-input"
              />
              <div className="account-modal-buttons">
                <button type="submit" className="account-btn-primary">{t("account.save")}</button>
                <button type="button" className="account-btn-secondary" onClick={() => setShowPhoneModal(false)}>{t("account.cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enable 2FA Modal */}
      {showEnable2FAModal && (
        <Enable2FAModal
          accountEmail={user?.email}
          accountPhone={user?.phone}
          onClose={() => setShowEnable2FAModal(false)}
          onSuccess={handleEnable2FA}
        />
      )}

      {/* Disable 2FA Modal */}
      {showDisable2FAModal && (
        <Disable2FAModal
          twoFAValue={user?.twoFAValue}
          twoFAMethod={user?.twoFAMethod}
          onClose={() => setShowDisable2FAModal(false)}
          onSuccess={handleDisable2FA}
          onVerifyPassword={verifyPassword}
        />
      )}
    </div>
  );
}
