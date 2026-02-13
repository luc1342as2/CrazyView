import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { PROFILE_AVATARS } from "../data/profileAvatars";
import Navbar from "../components/Navbar";
import "./ProfilesPage.css";

const FALLBACK_AVATARS = ["👤", "👨", "👩", "🧒", "👦", "👧"];

export default function ProfilesPage() {
  const { user, selectProfile, addProfile, updateProfile, removeProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [manageMode, setManageMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const profiles = user?.profiles || ["Profile 1", "Profile 2", "Kids"];
  const profileAvatars = user?.profileAvatars || {};

  const getProfileAvatar = (profileName, index) => {
    return profileAvatars[profileName] || PROFILE_AVATARS[index % PROFILE_AVATARS.length]?.url || null;
  };

  const handleSelect = (profileName) => {
    if (manageMode) {
      setEditingProfile(profileName);
      setNewProfileName(profileName);
      setSelectedAvatar(profileAvatars[profileName] || PROFILE_AVATARS[0]?.url || null);
      setShowEditModal(true);
    } else {
      selectProfile(profileName);
      navigate("/browse", { replace: true });
    }
  };

  const handleAddProfile = (e) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      addProfile(newProfileName.trim(), selectedAvatar || PROFILE_AVATARS[0]?.url);
      setNewProfileName("");
      setSelectedAvatar(null);
      setShowAddModal(false);
    }
  };

  const handleSaveEdit = () => {
    const newName = newProfileName.trim() || editingProfile;
    const hasChanges = newName !== editingProfile || selectedAvatar !== (profileAvatars[editingProfile] || null);
    if (editingProfile && hasChanges) {
      updateProfile(editingProfile, newName, selectedAvatar || undefined);
    }
    setShowEditModal(false);
    setEditingProfile(null);
    setNewProfileName("");
    setSelectedAvatar(null);
  };

  const handleDeleteProfile = () => {
    if (editingProfile && profiles.length > 1) {
      removeProfile(editingProfile);
      setShowEditModal(false);
      setEditingProfile(null);
      setNewProfileName("");
      setSelectedAvatar(null);
    }
  };

  return (
    <div className="profiles-page">
      <Navbar transparent={false} />
      <div className="profiles-content">
        <h1>{manageMode ? t("profiles.manageProfiles") : t("profiles.whosWatching")}</h1>
        <div className="profiles-grid">
          {profiles.map((name, i) => {
            const avatarUrl = getProfileAvatar(name, i);
            return (
              <button
                key={name}
                className="profile-card"
                onClick={() => handleSelect(name)}
                aria-label={manageMode ? `${t("profiles.editProfile")}: ${name}` : name}
              >
                <div className="profile-avatar-large">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="profile-avatar-img" />
                  ) : (
                    <span>{FALLBACK_AVATARS[i % FALLBACK_AVATARS.length]}</span>
                  )}
                  {manageMode && (
                    <span className="profile-edit-icon" aria-hidden>
                      ✎
                    </span>
                  )}
                </div>
                <span>{name}</span>
              </button>
            );
          })}
          <button className="profile-card add" onClick={() => {
            setNewProfileName("");
            setSelectedAvatar(PROFILE_AVATARS[0]?.url || null);
            setShowAddModal(true);
          }}>
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
              <div className="profile-avatar-picker">
                <p className="avatar-picker-label">{t("profiles.chooseAvatar")}</p>
                <div className="avatar-grid">
                  {PROFILE_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      className={`avatar-option ${selectedAvatar === av.url ? "selected" : ""}`}
                      onClick={() => setSelectedAvatar(av.url)}
                    >
                      <img src={av.url} alt="" />
                    </button>
                  ))}
                </div>
              </div>
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
            <div className="profile-avatar-picker">
              <p className="avatar-picker-label">{t("profiles.chooseAvatar")}</p>
              <div className="avatar-grid">
                {PROFILE_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    className={`avatar-option ${selectedAvatar === av.url ? "selected" : ""}`}
                    onClick={() => setSelectedAvatar(av.url)}
                  >
                    <img src={av.url} alt="" />
                  </button>
                ))}
              </div>
            </div>
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
