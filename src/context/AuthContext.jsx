import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

function mapProfileToUser(profile, authUser) {
  if (!authUser) return null;
  return {
    id: authUser.id,
    email: authUser.email,
    name: profile?.name || "User",
    plan: profile?.plan || "standard",
    profiles: profile?.profiles || ["Profile 1"],
    phone: profile?.phone ?? "",
    twoFA: profile?.two_fa ?? false,
    twoFAMethod: profile?.two_fa_method ?? null,
    twoFAValue: profile?.two_fa_value ?? "",
    memberSince: profile?.member_since || new Date().toISOString().split("T")[0],
    cardBrand: profile?.card_brand ?? "Visa",
    cardLast4: profile?.card_last4 ?? "4242",
    planCancelled: profile?.plan_cancelled ?? false,
    planEndsAt: profile?.plan_ends_at ?? null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    return data;
  };

  const syncUser = async (authUser) => {
    if (!authUser) {
      setUser(null);
      setCurrentProfile(null);
      localStorage.removeItem("netflix_profile");
      return;
    }
    const profile = await fetchProfile(authUser.id);
    const sessionUser = mapProfileToUser(profile, authUser);
    setUser(sessionUser);
    const storedProfile = localStorage.getItem("netflix_profile");
    if (storedProfile && (profile?.profiles || []).includes(storedProfile)) {
      setCurrentProfile(storedProfile);
    } else {
      setCurrentProfile(profile?.profiles?.[0] || "Profile 1");
      if (profile?.profiles?.[0]) localStorage.setItem("netflix_profile", profile.profiles[0]);
    }
  };

  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await syncUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      const msg = error.message || "Invalid email or password.";
      const isInvalidCreds =
        msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("credentials");
      const hint = isInvalidCreds
        ? " If you just signed up, check your email for a confirmation link."
        : "";
      return { success: false, error: msg + hint };
    }
    await syncUser(data.user);
    return { success: true };
  };

  const signup = async (email, password, name, planId) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim() || "User",
          plan: planId,
          profiles: ["Profile 1"],
          member_since: new Date().toISOString().split("T")[0],
        },
      },
    });
    if (error) {
      if (error.message?.includes("already registered") || error.code === "user_already_exists") {
        return { success: false, error: "An account with this email already exists." };
      }
      return { success: false, error: error.message };
    }
    if (data.user) await syncUser(data.user);
    return { success: true };
  };

  const updateUser = async (updates) => {
    if (!user?.id) return;
    const profileUpdates = {};
    const keyMap = {
      name: "name",
      plan: "plan",
      profiles: "profiles",
      phone: "phone",
      twoFA: "two_fa",
      twoFAMethod: "two_fa_method",
      twoFAValue: "two_fa_value",
      memberSince: "member_since",
      cardBrand: "card_brand",
      cardLast4: "card_last4",
      planCancelled: "plan_cancelled",
      planEndsAt: "plan_ends_at",
      email: "email",
    };
    Object.entries(updates).forEach(([k, v]) => {
      if (keyMap[k] !== undefined) profileUpdates[keyMap[k]] = v;
    });
    profileUpdates.updated_at = new Date().toISOString();

    await supabase.from("profiles").update(profileUpdates).eq("id", user.id);

    if (updates.email) {
      await supabase.auth.updateUser({ email: updates.email });
    }

    const profile = await fetchProfile(user.id);
    setUser(mapProfileToUser(profile, { ...user, email: updates.email || user.email }));
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
    await supabase.auth.signOut();
    setUser(null);
    setCurrentProfile(null);
    localStorage.removeItem("netflix_profile");
  };

  const selectProfile = (profileName) => {
    setCurrentProfile(profileName);
    localStorage.setItem("netflix_profile", profileName);
  };

  const verifyPassword = async (password) => {
    if (!user?.email) return false;
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
    return !error;
  };

  const requestPasswordReset = async (email) => {
    const trimmed = email.trim();
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const resetPassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
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
