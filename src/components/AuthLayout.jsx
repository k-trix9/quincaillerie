const YEAR = new Date().getFullYear();

const FEATURES = [
    ["📦", "Track stock, sales and rentals in real time"],
    ["🧾", "Point-of-sale and invoicing built in"],
    ["📈", "Daily, weekly and monthly reports"],
    ["👥", "Manage customers, suppliers and staff"]
];

function AuthLayout({
    title,
    subtitle,
    asideHeading,
    asideText,
    children
}) {

    return (

        <div className="auth-page">

            <aside className="auth-aside">

                <div className="auth-brand">
                    <span className="logo-mark">🏗️</span>
                    QUINCAILLERIE
                </div>

                <div className="auth-aside-body">

                    <h2>{asideHeading}</h2>

                    <p>{asideText}</p>

                    <ul className="auth-features">

                        {FEATURES.map(([icon, text]) => (

                            <li key={text}>
                                <span>{icon}</span>
                                {text}
                            </li>

                        ))}

                    </ul>

                </div>

                <div className="auth-aside-foot">
                    © {YEAR} Quincaillerie Management System
                </div>

            </aside>

            <main className="auth-main">

                <div className="auth-card">

                    <h1>{title}</h1>
                    <p>{subtitle}</p>

                    {children}

                </div>

            </main>

        </div>
    );
}

export default AuthLayout;
