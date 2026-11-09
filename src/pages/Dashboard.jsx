import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

const TODAY = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long"
});

function Dashboard() {

    return (

        <div className="dashboard-layout">

            <Sidebar />

            <main className="dashboard-content">

                <header className="dashboard-header">

                    <div>
                        <p>QUINCAILLERIE MANAGEMENT</p>

                        <h1>Dashboard</h1>
                    </div>

                    <div className="date-pill">
                        📅 {TODAY}
                    </div>

                </header>

                <section className="stats-grid">

                    <StatCard
                        title="Stock Value"
                        value="15,240,000 RWF"
                        icon="📦"
                        description="Current inventory value"
                    />

                    <StatCard
                        title="Sales Today"
                        value="850,000 RWF"
                        icon="💰"
                        description="Today's sales"
                    />

                    <StatCard
                        title="Rental Income"
                        value="320,000 RWF"
                        icon="🏗️"
                        description="Today's rental income"
                    />

                    <StatCard
                        title="Active Rentals"
                        value="18"
                        icon="🔄"
                        description="Equipment currently out"
                    />

                </section>

                <section className="dashboard-grid">

                    <div className="dashboard-card">

                        <h2>
                            Stock Overview
                        </h2>

                        <p>
                            Stock IN: 125 items
                        </p>

                        <p>
                            Stock OUT: 74 items
                        </p>

                    </div>

                    <div className="dashboard-card">

                        <h2>
                            Low Stock
                        </h2>

                        <p>
                            Cement — 8 bags ⚠️
                        </p>

                        <p>
                            Nails — 3 boxes 🔴
                        </p>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;