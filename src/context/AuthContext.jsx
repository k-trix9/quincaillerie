import { createContext, useContext, useEffect, useState } from "react";

import {
    authLogin,
    authRegister,
    authMe,
    authLogout,
    isDesktop
} from "../services/db";
import { ADMIN, USER } from "../constants/roles";

const AuthContext = createContext();

const STORAGE_KEY = "quincaillerie:user";
const TOKEN_KEY = "quincaillerie:token";

const normalizeUser = (user) => {
    if (!user) {
        return user;
    }

    return {
        ...user,
        role: user.role === ADMIN ? ADMIN : USER
    };
};

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const restore = async () => {
            if (isDesktop) {
                // Session is restored from the httpOnly session cookie
                // held by the Electron main process.
                const result = await authMe();

                if (active && result.ok) {
                    setUser(normalizeUser(result.user));
                }
            } else {
                try {
                    const saved = localStorage.getItem(STORAGE_KEY);

                    if (active && saved) {
                        setUser(normalizeUser(JSON.parse(saved)));
                    }
                } catch {
                    // ignore malformed storage
                }
            }

            if (active) {
                setLoading(false);
            }
        };

        restore();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        // The desktop app relies on the session cookie, not localStorage.
        if (isDesktop) {
            return;
        }

        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [user]);

    const login = async ({ email, password }) => {
        if (isDesktop) {
            const result = await authLogin({ email, password });

            if (!result.ok) {
                return { ok: false, error: result.error };
            }

            setUser(normalizeUser(result.user));

            return { ok: true };
        }

        try {
            const data = await authLogin({ email, password });

            localStorage.setItem(TOKEN_KEY, data.token || "");
            setUser(normalizeUser(data.user || data));

            return { ok: true };
        } catch {
            setUser({
                name: email.split("@")[0],
                email,
                role: USER
            });

            return { ok: true, offline: true };
        }
    };

    const register = async (payload) => {
        if (isDesktop) {
            const result = await authRegister(payload);

            if (!result.ok) {
                return { ok: false, error: result.error };
            }

            setUser(normalizeUser(result.user));

            return { ok: true };
        }

        try {
            const data = await authRegister(payload);

            localStorage.setItem(TOKEN_KEY, data.token || "");
            setUser(normalizeUser(data.user || data));

            return { ok: true };
        } catch {
            const { password: _password, ...safePayload } = payload;

            setUser(normalizeUser(safePayload));

            return { ok: true, offline: true };
        }
    };

    const logout = async () => {
        if (isDesktop) {
            await authLogout();
        }

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAdmin: user?.role === ADMIN,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
