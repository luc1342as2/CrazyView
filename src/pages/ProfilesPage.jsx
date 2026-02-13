import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import "./ProfilesPage.css";

const AVATARS = ["👤", "👨", "👩", "🧒", "👦", "👧"];

export default function ProfilesPage() {
  const { user, selectProfile, addProfile, updateProfile, removeProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [manageMode, setManageMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [newProfileName, setNewProfileName] = useState("");

  const profiles = user?.profiles || ["Profile 1", "Profile 2", "Kids"];

  const handleSelect = (profileName) => {
    if (manageMode) {
      setEditingProfile(profileName);
      setNewProfileName(profileName);
      setShowEditModal(true);
    } else {
      selectProfile(profileName);
      navigate("/browse", { replace: true });
    }
  };

  const handleAddProfile = (e) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      addProfile(newProfileName.trim());
      setNewProfileName("");
      setShowAddModal(false);
    }
  };

  const handleSaveEdit = () => {
    if (editingProfile && newProfileName.trim() && newProfileName.trim() !== editingProfile) {
      updateProfile(editingProfile, newProfileName.trim());
      setShowEditModal(false);
      setEditingProfile(null);
      setNewProfileName("");
    }
  };

  const handleDeleteProfile = () => {
    if (editingProfile && profiles.length > 1) {
      removeProfile(editingProfile);
      setShowEditModal(false);
      setEditingProfile(null);
      setNewProfileName("");
    }
  };

  return (
    <div className="profiles-page">
      <Navbar transparent={false} />
      <div className="profiles-content">
        <h1>{manageMode ? t("profiles.manageProfiles") : t("profiles.whosWatching")}</h1>
        <div className="profiles-grid">
          {profiles.map((name, i) => (
            <button
              key={name}
              className="profile-card"
              onClick={() => handleSelect(name)}
              aria-label={manageMode ? `${t("profiles.editProfile")}: ${name}` : name}
            >
              <div className="profile-avatar-large">
                {AVATARS[i % AVATARS.length]}
                {manageMode && (
                  <span className="profile-edit-icon" aria-hidden>
                    ✎
                  </span>
                )}
              </div>
              <span>{name}</span>
            </button>
          ))}
          <button className="profile-card add" onClick={() => setShowAddModal(true)}>
            <div className="profile-avatar-large add-icon">+</div>
            <span>{t("profiles.addProfile")}</span>
          </button>
        </div>
        <button
          className="manage-profiles"
          onClick={() => setManageMode(!manageMode)}
          aria-label={manageMode ? t("profiles.done") : t("profiles.manageProfiles")}
        >
          {manageMode ? t("profiles.done") : t("profiles.manageProfiles")}
        </button>
      </div>

      {showAddModal && (
        <div className="profile-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("profiles.addProfile")}</h3>
            <form onSubmit={handleAddProfile}>
              <input
                type="text"
                placeholder={t("profiles.profileNamePlaceholder")}
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="profile-modal-input"
                maxLength={20}
              />
              <div className="profile-modal-buttons">
                <button type="submit" className="profile-btn-save">{t("profiles.add")}</button>
                <button type="button" onClick={() => setShowAddModal(false)}>{t("profiles.cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingProfile && (
        <div className="profile-modal-overlay" onClick={() => { setShowEditModal(false); setEditingProfile(null); }}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("profiles.editProfile")}</h3>
            <input
              type="text"
              placeholder={t("profiles.profileNamePlaceholder")}
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              className="profile-modal-input"
              maxLength={20}
            />
            <div className="profile-modal-buttons">
              <button type="button" className="profile-btn-save" onClick={handleSaveEdit}>{t("account.save")}</button>
              {profiles.length > 1 && (
                <button
                  type="button"
                  className="profile-btn-delete"
                  onClick={handleDeleteProfile}
                >
                  {t("profiles.deleteProfile")}
                </button>
              )}
              <button type="button" onClick={() => { setShowEditModal(false); setEditingProfile(null); }}>
                {t("profiles.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
