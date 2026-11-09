import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { USER } from "../constants/roles";

function Register() {

    const navigate = useNavigate();
    const { register } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirm: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [agree, setAgree] = useState(false);
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

        if (!form.name || !form.email || !form.password) {
            setError("Please fill in your name, email and password.");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (form.password !== form.confirm) {
            setError("Passwords do not match.");
            return;
        }

        if (!agree) {
            setError("Please accept the terms to continue.");
            return;
        }

        setError("");
        setLoading(true);

        const result = await register({
            name: form.name,
            email: form.email,
            phone: form.phone,
            role: USER,
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
            title="Create your account"
            subtitle="Set up your access to the management system."
            asideHeading="Everything your store needs, in one place."
            asideText="Join the platform trusted to manage construction materials, tools and equipment rentals."
        >

            <form
                className="auth-form"
                onSubmit={handleSubmit}
                noValidate
            >

                <div className="auth-row">

                    <div>
                        <label htmlFor="name">Full name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            placeholder="Jean Bosco"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="phone">Phone</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            placeholder="+250 7XX XXX XXX"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>

                </div>

                <label htmlFor="reg-email">Email address</label>

                <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={handleChange}
                />

                <p className="register-note">
                    New accounts are created as standard{" "}
                    <strong>Users</strong>. An administrator can promote
                    you to <strong>Admin</strong> later.
                </p>

                <label htmlFor="reg-password">Password</label>

                <div className="input-group">

                    <input
                        id="reg-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
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

                <label htmlFor="confirm">Confirm password</label>

                <input
                    id="confirm"
                    name="confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={form.confirm}
                    onChange={handleChange}
                />

                <div className="auth-options">

                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={agree}
                            onChange={(e) =>
                                setAgree(e.target.checked)
                            }
                        />
                        I agree to the terms &amp; privacy policy
                    </label>

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
                    {loading
                        ? "Creating account…"
                        : "Create account"}
                </button>

            </form>

            <p className="auth-switch">
                Already have an account?{" "}
                <Link className="auth-link" to="/login">
                    Sign in
                </Link>
            </p>

        </AuthLayout>
    );
}

export default Register;
