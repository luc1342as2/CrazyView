import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const defaultUserData = () => ({
  twoFA: false,
  phone: "",
  memberSince: new Date().toISOString().split("T")[0],
  cardBrand: "Visa",
  cardLast4: "4242",
  planCancelled: false,
  planEndsAt: null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("netflix_user");
    const profile = localStorage.getItem("netflix_profile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (profile) setCurrentProfile(profile);
      } catch (e) {
        localStorage.removeItem("netflix_user");
      }
    }
    setLoading(false);
  }, []);

  const persistUser = (data) => {
    localStorage.setItem("netflix_user", JSON.stringify(data));
    setUser(data);
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("netflix_users") || "{}");
    const userData = users[email];
    if (!userData || userData.password !== password) {
      return { success: false, error: "Invalid email or password." };
    }
    const session = {
      email,
      name: userData.name,
      plan: userData.plan,
      profiles: userData.profiles || ["Profile 1"],
      phone: userData.phone ?? "",
      twoFA: userData.twoFA ?? false,
      twoFAMethod: userData.twoFAMethod ?? null,
      twoFAValue: userData.twoFAValue ?? "",
      memberSince: userData.memberSince || new Date().toISOString().split("T")[0],
      cardBrand: userData.cardBrand ?? "Visa",
      cardLast4: userData.cardLast4 ?? "4242",
      planCancelled: userData.planCancelled ?? false,
      planEndsAt: userData.planEndsAt ?? null,
    };
    persistUser(session);
    return { success: true };
  };

  const signup = (email, password, name, planId) => {
    const users = JSON.parse(localStorage.getItem("netflix_users") || "{}");
    if (users[email]) return { success: false, error: "An account with this email already exists." };
    const memberSince = new Date().toISOString().split("T")[0];
    users[email] = {
      password,
      name,
      plan: planId,
      profiles: ["Profile 1"],
      paymentComplete: true,
      phone: "",
      twoFA: false,
      twoFAMethod: null,
      twoFAValue: "",
      memberSince,
      cardBrand: "Visa",
      cardLast4: "4242",
      planCancelled: false,
      planEndsAt: null,
    };
    localStorage.setItem("netflix_users", JSON.stringify(users));
    const session = { email, name, plan: planId, profiles: ["Profile 1"], phone: "", twoFA: false, twoFAMethod: null, twoFAValue: "", memberSince, cardBrand: "Visa", cardLast4: "4242", planCancelled: false, planEndsAt: null };
    persistUser(session);
    return { success: true };
  };

  const updateUser = (updates) => {
    if (!user) return;
    const users = JSON.parse(localStorage.getItem("netflix_users") || "{}");
    const userData = users[user.email] || {};
    const newSession = { ...user, ...updates };
    const storeKeys = ["name", "plan", "profiles", "phone", "twoFA", "twoFAMethod", "twoFAValue", "memberSince", "email", "password", "cardBrand", "cardLast4", "planCancelled", "planEndsAt"];
    const dataToStore = { ...userData };
    storeKeys.forEach((k) => {
      if (updates[k] !== undefined) dataToStore[k] = updates[k];
    });
    if (updates.email) {
      delete users[user.email];
      users[updates.email] = dataToStore;
      newSession.email = updates.email;
    } else {
      users[user.email] = dataToStore;
    }
    localStorage.setItem("netflix_users", JSON.stringify(users));
    persistUser(newSession);
  };

  const updateProfile = (oldName, newName) => {
    if (!user) return;
    const profiles = [...(user.profiles || [])];
    const idx = profiles.indexOf(oldName);
    if (idx >= 0) profiles[idx] = newName;
    const users = JSON.parse(localStorage.getItem("netflix_users") || "{}");
    users[user.email] = { ...users[user.email], profiles };
    localStorage.setItem("netflix_users", JSON.stringify(users));
    persistUser({ ...user, profiles });
  };

  const addProfile = (name) => {
    if (!user) return;
    const profiles = [...(user.profiles || []), name];
    const users = JSON.parse(localStorage.getItem("netflix_users") || "{}");
    users[user.email] = { ...users[user.email], profiles };
    localStorage.setItem("netflix_users", JSON.stringify(users));
    persistUser({ ...user, profiles });
  };

  const removeProfile = (name) => {
    if (!user) return;
    const profiles = (user.profiles || []).filter((p) => p !== name);
    if (profiles.length < 1) return; // Keep at least 1 profile
    const users = JSON.parse(localStorage.getItem("netflix_users") || "{}");
    users[user.email] = { ...users[user.email], profiles };
    localStorage.setItem("netflix_users", JSON.stringify(users));
    persistUser({ ...user, profiles });
    if (currentProfile === name) {
      setCurrentProfile(profiles[0]);
      localStorage.setItem("netflix_profile", profiles[0]);
    }
  };

  const logout = () => {
    localStorage.removeItem("netflix_user");
    localStorage.removeItem("netflix_profile");
    setUser(null);
    setCurrentProfile(null);
  };

  const selectProfile = (profileName) => {
    setCurrentProfile(profileName);
    localStorage.setItem("netflix_profile", profileName);
  };

  const verifyPassword = (password) => {
    const users = JSON.parse(localStorage.getItem("netflix_users") || "{}");
    const userData = users[user?.email];
    return userData?.password === password;
  };

  const requestPasswordReset = (email) => {
    const users = JSON.parse(localStorage.getItem("netflix_users") || "{}");
    const trimmed = email.trim();
    if (!users[trimmed]) {
      return { success: false, error: "reset.noAccount" };
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    const codes = JSON.parse(localStorage.getItem("crazyview_reset_codes") || "{}");
    codes[trimmed] = { code, expiry };
    localStorage.setItem("crazyview_reset_codes", JSON.stringify(codes));
    return { success: true, code };
  };

  const resetPassword = (email, code, newPassword) => {
    const codes = JSON.parse(localStorage.getItem("crazyview_reset_codes") || "{}");
    const stored = codes[email.trim()];
    if (!stored) return { success: false, error: "reset.invalidCode" };
    if (Date.now() > stored.expiry) {
      delete codes[email.trim()];
      localStorage.setItem("crazyview_reset_codes", JSON.stringify(codes));
      return { success: false, error: "reset.codeExpired" };
    }
    if (stored.code !== code.trim()) return { success: false, error: "reset.invalidCode" };
    if (newPassword.length < 4 || newPassword.length > 60) {
      return { success: false, error: "signup.errorPassword" };
    }
    const users = JSON.parse(localStorage.getItem("netflix_users") || "{}");
    if (!users[email.trim()]) return { success: false, error: "reset.noAccount" };
    users[email.trim()].password = newPassword;
    localStorage.setItem("netflix_users", JSON.stringify(users));
    delete codes[email.trim()];
    localStorage.setItem("crazyview_reset_codes", JSON.stringify(codes));
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, currentProfile, loading, login, signup, logout, selectProfile, updateUser, updateProfile, addProfile, removeProfile, verifyPassword, requestPasswordReset, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
