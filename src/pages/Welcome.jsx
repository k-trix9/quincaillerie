import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../constants/roles";

const YEAR = new Date().getFullYear();

const STATS = [
    ["15,000+", "Products tracked"],
    ["3", "User roles"],
    ["100%", "Works offline"],
    ["24/7", "Always available"]
];

const FEATURES = [
    {
        icon: "📦",
        title: "Inventory & Stock",
        text: "Track every item, set reorder levels and record stock movements in and out of the store."
    },
    {
        icon: "🧾",
        title: "Point of Sale",
        text: "Ring up sales fast with an integrated cash register, receipts and payment tracking."
    },
    {
        icon: "🏗️",
        title: "Equipment Rentals",
        text: "Lend tools and machinery, follow due dates and know exactly what is out at all times."
    },
    {
        icon: "👥",
        title: "Customers & Suppliers",
        text: "Keep a clean directory of buyers and vendors with balances and contact details."
    },
    {
        icon: "💸",
        title: "Expenses & Purchases",
        text: "Record spending and restocking so your books always reflect reality."
    },
    {
        icon: "📈",
        title: "Reports & Insights",
        text: "Daily, weekly and monthly reports that turn your data into clear decisions."
    }
];

const STEPS = [
    ["1", "Create your account", "Sign up in seconds. New accounts start as standard users with secure, cookie-based sessions."],
    ["2", "Set up your catalogue", "Add your products, prices and suppliers, or jump in with the built-in sample data."],
    ["3", "Run and grow", "Sell, rent, restock and review — while administrators manage the team and roles."]
];

function Welcome() {

    const { user } = useAuth();
    const authed = Boolean(user);

    return (

        <div className="landing">

            {/* NAVIGATION */}
            <nav className="landing-nav">

                <Link className="landing-brand" to="/">
                    <span className="logo-mark">🏗️</span>
                    QUINCAILLERIE
                </Link>

                <div className="landing-nav-links">
                    <a href="#features">Features</a>
                    <a href="#how">How it works</a>
                </div>

                <div className="landing-nav-actions">
                    {authed ? (
                        <>
                            <span className="landing-nav-user">
                                {user.name}
                                <span className={`role-badge role-${user.role}`}>
                                    {ROLE_LABELS[user.role] || user.role}
                                </span>
                            </span>

                            <Link className="btn btn-primary" to="/dashboard">
                                Continue
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link className="landing-nav-signin" to="/login">
                                Sign in
                            </Link>

                            <Link className="btn btn-primary" to="/register">
                                Get started
                            </Link>
                        </>
                    )}
                </div>

            </nav>

            {/* HERO */}
            <header className="landing-hero">

                <div className="landing-hero-copy">

                    <span className="landing-pill">
                        Hardware store management system
                    </span>

                    <h1>
                        Run your entire hardware store
                        <span> from one place.</span>
                    </h1>

                    <p>
                        Manage stock, sales, equipment rentals and
                        staff in a single, secure desktop workspace —
                        built for construction and hardware businesses.
                    </p>

                    <div className="landing-cta">

                        {authed ? (
                            <>
                                <Link
                                    className="btn btn-primary landing-btn"
                                    to="/dashboard"
                                >
                                    Continue to dashboard
                                </Link>

                                <a
                                    className="btn landing-btn landing-btn-ghost"
                                    href="#features"
                                >
                                    Explore features
                                </a>
                            </>
                        ) : (
                            <>
                                <Link
                                    className="btn btn-primary landing-btn"
                                    to="/register"
                                >
                                    Create an account
                                </Link>

                                <Link
                                    className="btn landing-btn landing-btn-ghost"
                                    to="/login"
                                >
                                    Sign in
                                </Link>
                            </>
                        )}

                    </div>

                    <ul className="landing-trust">

                        <li>🔒 Secure sessions &amp; cookies</li>
                        <li>👥 Role-based access</li>
                        <li>💾 Offline &amp; private</li>

                    </ul>

                </div>

                <div className="landing-hero-visual" aria-hidden="true">

                    <div className="preview-card">

                        <div className="preview-top">
                            <span className="preview-dot" />
                            <span className="preview-dot" />
                            <span className="preview-dot" />
                            <span className="preview-title">Dashboard</span>
                        </div>

                        <div className="preview-stats">

                            <div className="preview-stat">
                                <span>Stock Value</span>
                                <strong>15.2M RWF</strong>
                            </div>

                            <div className="preview-stat">
                                <span>Sales Today</span>
                                <strong>850K RWF</strong>
                            </div>

                            <div className="preview-stat">
                                <span>Active Rentals</span>
                                <strong>18</strong>
                            </div>

                        </div>

                        <div className="preview-bars">
                            <span style={{ height: "46%" }} />
                            <span style={{ height: "72%" }} />
                            <span style={{ height: "58%" }} />
                            <span style={{ height: "90%" }} />
                            <span style={{ height: "66%" }} />
                            <span style={{ height: "80%" }} />
                        </div>

                    </div>

                </div>

            </header>

            {/* STATS */}
            <section className="landing-stats">

                {STATS.map(([value, label]) => (

                    <div className="landing-stat" key={label}>
                        <strong>{value}</strong>
                        <span>{label}</span>
                    </div>

                ))}

            </section>

            {/* FEATURES */}
            <section className="landing-section" id="features">

                <div className="landing-section-head">
                    <span className="landing-eyebrow">Everything included</span>
                    <h2>One platform for the whole store</h2>
                    <p>
                        Stop juggling notebooks and spreadsheets. Every
                        part of your operation lives together and stays
                        in sync.
                    </p>
                </div>

                <div className="landing-grid">

                    {FEATURES.map((feature) => (

                        <article className="feature-card" key={feature.title}>

                            <span className="feature-icon">{feature.icon}</span>

                            <h3>{feature.title}</h3>

                            <p>{feature.text}</p>

                        </article>

                    ))}

                </div>

            </section>

            {/* HOW IT WORKS */}
            <section className="landing-section landing-how" id="how">

                <div className="landing-section-head">
                    <span className="landing-eyebrow">Getting started</span>
                    <h2>Up and running in three steps</h2>
                </div>

                <div className="landing-steps">

                    {STEPS.map(([number, title, text]) => (

                        <div className="step" key={number}>

                            <span className="step-number">{number}</span>

                            <h3>{title}</h3>

                            <p>{text}</p>

                        </div>

                    ))}

                </div>

            </section>

            {/* CALL TO ACTION */}
            <section className="landing-cta-band">

                <div>
                    <h2>Ready to take control of your store?</h2>
                    <p>
                        {authed
                            ? "Your workspace is ready — jump back in."
                            : "Create your account and start managing in minutes."}
                    </p>
                </div>

                <div className="landing-cta-band-actions">
                    {authed ? (
                        <Link
                            className="btn btn-primary landing-btn"
                            to="/dashboard"
                        >
                            Go to dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                className="btn btn-primary landing-btn"
                                to="/register"
                            >
                                Get started free
                            </Link>
                            <Link
                                className="btn landing-btn landing-btn-ghost"
                                to="/login"
                            >
                                I already have an account
                            </Link>
                        </>
                    )}
                </div>

            </section>

            {/* FOOTER */}
            <footer className="landing-footer">

                <div className="landing-brand landing-footer-brand">
                    <span className="logo-mark">🏗️</span>
                    QUINCAILLERIE
                </div>

                <p>
                    A desktop management system for hardware stores,
                    construction materials and equipment rentals.
                </p>

                <div className="landing-footer-bottom">
                    <span>© {YEAR} Quincaillerie Management System</span>
                    <span className="landing-footer-links">
                        <Link to="/login">Sign in</Link>
                        <Link to="/register">Register</Link>
                    </span>
                </div>

            </footer>

        </div>
    );
}

export default Welcome;
