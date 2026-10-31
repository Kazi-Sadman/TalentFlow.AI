import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../api/endpoints";
import type { AuthResponse, AuthUser, RegisterPayload } from "../types";

const TOKEN_KEY = "tf_token";
const USER_KEY = "tf_user";

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Reads the saved user from the browser. Returns null if there is none or the token is expired.
function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    const user = JSON.parse(raw) as AuthUser;
    if (new Date(user.expiresAtUtc).getTime() < Date.now()) {
      clearSession();
      return null;
    }
    return user;
  } catch {
    clearSession();
    return null;
  }
}

function saveSession(auth: AuthResponse): AuthUser {
  const user: AuthUser = {
    expiresAtUtc: auth.expiresAtUtc,
    userId: auth.userId,
    fullName: auth.fullName,
    email: auth.email,
    role: auth.role,
    companyId: auth.companyId
  };
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser());

  async function login(email: string, password: string): Promise<AuthUser> {
    const auth = await authApi.login(email, password);
    const saved = saveSession(auth);
    setUser(saved);
    return saved;
  }

  async function register(payload: RegisterPayload): Promise<AuthUser> {
    const auth = await authApi.register(payload);
    const saved = saveSession(auth);
    setUser(saved);
    return saved;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
