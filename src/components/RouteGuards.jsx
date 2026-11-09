import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { ADMIN } from "../constants/roles";

function SessionLoader() {

    return (
        <div className="session-loader">
            <span className="logo-mark">🏗️</span>
            <span>Loading your session…</span>
        </div>
    );
}

export function ProtectedRoute({ adminOnly = false, children }) {

    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <SessionLoader />;
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    if (adminOnly && user.role !== ADMIN) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export function PublicRoute({ children }) {

    const { user, loading } = useAuth();

    if (loading) {
        return <SessionLoader />;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
