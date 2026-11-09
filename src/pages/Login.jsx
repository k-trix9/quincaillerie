import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [remember, setRemember] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            setError("Please enter your email and password.");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setError("");
        setLoading(true);

        const result = await login({
            email: form.email,
            password: form.password
        });

        if (!result.ok) {
            setError(result.error);
            setLoading(false);
            return;
        }

        navigate("/dashboard");
    };

    return (

        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to continue to your dashboard."
            asideHeading="Run your hardware store with confidence."
            asideText="One platform for stock, sales, equipment rentals and reporting — built for construction businesses."
        >

            <form
                className="auth-form"
                onSubmit={handleSubmit}
                noValidate
            >

                <label htmlFor="email">Email address</label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={handleChange}
                />

                <label htmlFor="password">Password</label>

                <div className="input-group">

                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <button
                        type="button"
                        className="input-toggle"
                        onClick={() =>
                            setShowPassword(!showPassword)
                        }
                        aria-label={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                        }
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>

                </div>

                <div className="auth-options">

                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) =>
                                setRemember(e.target.checked)
                            }
                        />
                        Remember me
                    </label>

                    <a href="#">Forgot password?</a>

                </div>

                {error && (
                    <div className="auth-error">{error}</div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                    style={{
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? "wait" : "pointer"
                    }}
                >
                    {loading ? "Signing in…" : "Sign in →"}
                </button>

            </form>

            <p className="auth-switch">
                Don&apos;t have an account?{" "}
                <Link className="auth-link" to="/register">
                    Create one
                </Link>
            </p>

        </AuthLayout>
    );
}

export default Login;
