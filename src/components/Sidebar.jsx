import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { ADMIN, ADMIN_ONLY_PATHS, ROLE_LABELS } from "../constants/roles";

function Sidebar() {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const isAdmin = user?.role === ADMIN;

    const menu = [
        ["🏠", "Dashboard", "/dashboard"],
        ["🧾", "Cash Register", "/cash-register"],
        ["📦", "Products", "/products"],
        ["📊", "Stock", "/stock"],
        ["💰", "Sales", "/sales"],
        ["🏗️", "Rentals", "/rentals"],
        ["↩️", "Returns", "/returns"],
        ["👥", "Customers", "/customers"],
        ["🔐", "Users", "/users"],
        ["🚚", "Suppliers", "/suppliers"],
        ["💸", "Expenses", "/expenses"],
        ["📈", "Reports", "/reports"]
    ].filter(([, , path]) =>
        isAdmin || !ADMIN_ONLY_PATHS.includes(path)
    );

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (

        <aside className="sidebar">

            <div className="sidebar-logo">
                <span className="logo-mark">🏗️</span>
                <span>QUINCAILLERIE</span>
            </div>

            <nav>

                {menu.map(([icon, name, path]) => (

                    <NavLink
                        key={path}
                        to={path}
                    >

                        <span>{icon}</span>

                        {name}

                    </NavLink>

                ))}

            </nav>

            <div className="sidebar-footer">

                {user ? (
                    <>
                        <div className="sidebar-user">

                            <span className="sidebar-user-name">
                                {user.name}
                            </span>

                            <span className={`role-badge role-${user.role}`}>
                                {ROLE_LABELS[user.role] || user.role}
                            </span>

                        </div>

                        <button
                            className="btn btn-block"
                            onClick={handleLogout}
                            style={{
                                background: "transparent",
                                border: "1px solid #334155",
                                color: "#cbd5e1"
                            }}
                        >
                            ⎋ Log out
                        </button>
                    </>
                ) : (
                    <NavLink to="/login">⎋ Sign in</NavLink>
                )}

            </div>

        </aside>
    );
}

export default Sidebar;
