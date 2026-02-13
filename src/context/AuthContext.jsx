import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const USERS_KEY = "crazyview_users";
const CURRENT_USER_KEY = "crazyview_user";
const RESET_CODES_KEY = "crazyview_reset_codes";
const CODE_EXPIRY_MS = 10 * 60 * 1000;

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toUserObject(stored) {
  return {
    id: stored.id,
    email: stored.email,
    name: stored.name || "User",
    plan: stored.plan || "standard",
    profiles: stored.profiles || ["Profile 1"],
    phone: stored.phone ?? "",
    twoFA: stored.twoFA ?? false,
    twoFAMethod: stored.twoFAMethod ?? null,
    twoFAValue: stored.twoFAValue ?? "",
    memberSince: stored.memberSince || new Date().toISOString().split("T")[0],
    cardBrand: stored.cardBrand ?? "Visa",
    cardLast4: stored.cardLast4 ?? "4242",
    planCancelled: stored.planCancelled ?? false,
    planEndsAt: stored.planEndsAt ?? null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(toUserObject(parsed));
        const profile = localStorage.getItem("netflix_profile");
        const profiles = parsed.profiles || ["Profile 1"];
        if (profile && profiles.includes(profile)) {
          setCurrentProfile(profile);
        } else {
          setCurrentProfile(profiles[0]);
          localStorage.setItem("netflix_profile", profiles[0]);
        }
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persistUser = (u) => {
    if (u) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(CURRENT_USER_KEY);
  };

  const login = async (email, password) => {
    const users = getUsers();
    const trimmed = email.trim();
    const found = users.find((u) => u.email.toLowerCase() === trimmed.toLowerCase());
    if (!found || found.password !== password) {
      return { success: false, error: "Invalid email or password." };
    }
    const sessionUser = toUserObject(found);
    setUser(sessionUser);
    setCurrentProfile(found.profiles?.[0] || "Profile 1");
    localStorage.setItem("netflix_profile", found.profiles?.[0] || "Profile 1");
    persistUser(found);
    return { success: true };
  };

  const signup = async (email, password, name, planId) => {
    const users = getUsers();
    const trimmed = email.trim();
    if (users.some((u) => u.email.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, error: "An account with this email already exists." };
    }
    const newUser = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      email: trimmed,
      password,
      name: name.trim() || "User",
      plan: planId || "standard",
      profiles: ["Profile 1"],
      phone: "",
      twoFA: false,
      twoFAMethod: null,
      twoFAValue: "",
      memberSince: new Date().toISOString().split("T")[0],
      cardBrand: "Visa",
      cardLast4: "4242",
      planCancelled: false,
      planEndsAt: null,
    };
    users.push(newUser);
    saveUsers(users);
    return { success: true };
  };

  const updateUser = async (updates) => {
    if (!user?.id) return;
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx < 0) return;
    if (updates.email) {
      const exists = users.some(
        (u, i) => i !== idx && u.email.toLowerCase() === updates.email.trim().toLowerCase()
      );
      if (exists) return;
    }
    const keyMap = {
      name: "name",
      plan: "plan",
      profiles: "profiles",
      phone: "phone",
      twoFA: "twoFA",
      twoFAMethod: "twoFAMethod",
      twoFAValue: "twoFAValue",
      memberSince: "memberSince",
      cardBrand: "cardBrand",
      cardLast4: "cardLast4",
      planCancelled: "planCancelled",
      planEndsAt: "planEndsAt",
      email: "email",
    };
    Object.entries(updates).forEach(([k, v]) => {
      if (keyMap[k] !== undefined) users[idx][keyMap[k]] = v;
    });
    saveUsers(users);
    const updated = { ...users[idx] };
    setUser(toUserObject(updated));
    persistUser(updated);
  };

  const updateProfile = (oldName, newName) => {
    if (!user) return;
    const profiles = [...(user.profiles || [])];
    const idx = profiles.indexOf(oldName);
    if (idx >= 0) profiles[idx] = newName;
    updateUser({ profiles });
  };

  const addProfile = (name) => {
    if (!user) return;
    const profiles = [...(user.profiles || []), name];
    updateUser({ profiles });
  };

  const removeProfile = (name) => {
    if (!user) return;
    const profiles = (user.profiles || []).filter((p) => p !== name);
    if (profiles.length < 1) return;
    updateUser({ profiles });
    if (currentProfile === name) {
      setCurrentProfile(profiles[0]);
      localStorage.setItem("netflix_profile", profiles[0]);
    }
  };

  const logout = async () => {
    setUser(null);
    setCurrentProfile(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("netflix_profile");
  };

  const selectProfile = (profileName) => {
    setCurrentProfile(profileName);
    localStorage.setItem("netflix_profile", profileName);
  };

  const verifyPassword = async (password) => {
    if (!user?.email) return false;
    const users = getUsers();
    const found = users.find((u) => u.email === user.email);
    return found ? found.password === password : false;
  };

  const requestPasswordReset = async (email) => {
    const trimmed = email.trim();
    const users = getUsers();
    const found = users.find((u) => u.email.toLowerCase() === trimmed.toLowerCase());
    if (!found) {
      return { success: false, error: "No account found with this email." };
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    let codes = {};
    try {
      codes = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || "{}");
    } catch {}
    codes[trimmed.toLowerCase()] = { code, expires: Date.now() + CODE_EXPIRY_MS };
    localStorage.setItem(RESET_CODES_KEY, JSON.stringify(codes));
    return { success: true, code };
  };

  const resetPassword = async (email, code, newPassword) => {
    const trimmed = email.trim();
    let codes = {};
    try {
      codes = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || "{}");
    } catch {}
    const entry = codes[trimmed.toLowerCase()];
    if (!entry || entry.code !== code) {
      return { success: false, error: "Invalid or expired code." };
    }
    if (Date.now() > entry.expires) {
      delete codes[trimmed.toLowerCase()];
      localStorage.setItem(RESET_CODES_KEY, JSON.stringify(codes));
      return { success: false, error: "Code has expired. Please request a new one." };
    }
    const users = getUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === trimmed.toLowerCase());
    if (idx < 0) return { success: false, error: "Account not found." };
    users[idx].password = newPassword;
    saveUsers(users);
    delete codes[trimmed.toLowerCase()];
    localStorage.setItem(RESET_CODES_KEY, JSON.stringify(codes));
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentProfile,
        loading,
        login,
        signup,
        logout,
        selectProfile,
        updateUser,
        updateProfile,
        addProfile,
        removeProfile,
        verifyPassword,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
