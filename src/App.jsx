import {
    HashRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Sales from "./pages/Sales";
import Rentals from "./pages/Rentals";
import Returns from "./pages/Returns";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import CashRegister from "./pages/CashRegister";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {
    ProtectedRoute,
    PublicRoute
} from "./components/RouteGuards";

const protect = (element, adminOnly = false) => (
    <ProtectedRoute adminOnly={adminOnly}>
        {element}
    </ProtectedRoute>
);

function App() {

    return (

        <HashRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Welcome />}
                />

                <Route
                    path="/dashboard"
                    element={protect(<Dashboard />)}
                />

                <Route
                    path="/users"
                    element={protect(<Users />, true)}
                />

                <Route
                    path="/products"
                    element={protect(<Products />)}
                />

                <Route
                    path="/stock"
                    element={protect(<Stock />)}
                />

                <Route
                    path="/sales"
                    element={protect(<Sales />)}
                />

                <Route
                    path="/rentals"
                    element={protect(<Rentals />)}
                />

                <Route
                    path="/returns"
                    element={protect(<Returns />)}
                />

                <Route
                    path="/customers"
                    element={protect(<Customers />)}
                />

                <Route
                    path="/suppliers"
                    element={protect(<Suppliers />, true)}
                />

                <Route
                    path="/expenses"
                    element={protect(<Expenses />, true)}
                />

                <Route
                    path="/reports"
                    element={protect(<Reports />, true)}
                />

                <Route
                    path="/cash-register"
                    element={protect(<CashRegister />)}
                />

                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>

        </HashRouter>
    );
}

export default App;
