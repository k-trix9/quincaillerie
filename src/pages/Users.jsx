import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
    fetchUsers,
    createUser,
    updateUser,
    removeUser
} from "../services/db";
import { ROLES, ROLE_LABELS, ADMIN, USER } from "../constants/roles";

const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    password: "",
    role: USER
};

function Users() {

    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        const result = await fetchUsers();

        if (result.ok) {
            setUsers(result.users);
            setError("");
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    useEffect(() => {
        let active = true;

        fetchUsers().then((result) => {
            if (!active) {
                return;
            }

            if (result.ok) {
                setUsers(result.users);
                setError("");
            } else {
                setError(result.error);
            }

            setLoading(false);
        });

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        setError("");
        setNotice("");
        setSaving(true);

        const result = await createUser(form);

        setSaving(false);

        if (!result.ok) {
            setError(result.error);
            return;
        }

        setNotice(`Account created for ${result.user.name}.`);
        setForm(EMPTY_FORM);
        setShowForm(false);
        load();
    };

    const handleRoleChange = async (user, role) => {
        setNotice("");

        if (user.id === currentUser?.id && role !== ADMIN) {
            setError("You cannot revoke your own admin role.");
            return;
        }

        const result = await updateUser({
            id: user.id,
            changes: { role }
        });

        if (!result.ok) {
            setError(result.error);
            return;
        }

        setError("");
        setUsers(users.map((u) => (u.id === user.id ? result.user : u)));
    };

    const handleDelete = async (user) => {
        setNotice("");

        if (!window.confirm(`Delete the account for ${user.name}?`)) {
            return;
        }

        const result = await removeUser(user.id);

        if (!result.ok) {
            setError(result.error);
            return;
        }

        setError("");
        setUsers(users.filter((u) => u.id !== user.id));
        setNotice(`Removed ${user.name}.`);
    };

    return (

        <div className="page">

            <Sidebar />

            <header className="dashboard-header">

                <div>

                    <p>ADMINISTRATION</p>

                    <h1>Users</h1>

                    <p style={{ color: "var(--text-muted)" }}>
                        Create accounts and control who can administer
                        the system.
                    </p>

                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Close" : "＋ New user"}
                </button>

            </header>

            {error && (
                <div className="auth-error">{error}</div>
            )}

            {notice && (
                <div className="auth-success">{notice}</div>
            )}

            {showForm && (

                <form
                    className="user-form"
                    onSubmit={handleCreate}
                >

                    <div className="auth-row">

                        <div>
                            <label htmlFor="u-name">Full name</label>
                            <input
                                id="u-name"
                                name="name"
                                type="text"
                                placeholder="Jane Doe"
                                value={form.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="u-phone">Phone</label>
                            <input
                                id="u-phone"
                                name="phone"
                                type="tel"
                                placeholder="+250 7XX XXX XXX"
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    <label htmlFor="u-email">Email address</label>

                    <input
                        id="u-email"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <div className="auth-row">

                        <div>
                            <label htmlFor="u-password">Temporary password</label>
                            <input
                                id="u-password"
                                name="password"
                                type="text"
                                placeholder="At least 6 characters"
                                value={form.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label>Role</label>

                            <div className="role-picker">

                                {ROLES.map((option) => (

                                    <button
                                        key={option}
                                        type="button"
                                        className={
                                            form.role === option ? "active" : ""
                                        }
                                        onClick={() =>
                                            setForm({
                                                ...form,
                                                role: option
                                            })
                                        }
                                    >
                                        {ROLE_LABELS[option]}
                                    </button>

                                ))}

                            </div>
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ alignSelf: "flex-start", marginTop: "8px" }}
                        disabled={saving}
                    >
                        {saving ? "Creating…" : "Create account"}
                    </button>

                </form>

            )}

            <div className="table-container">

                <table>
                    <thead>

                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>

                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>
                                <td colSpan={5}>Loading users…</td>
                            </tr>

                        ) : users.length === 0 ? (

                            <tr>
                                <td colSpan={5}>No users found.</td>
                            </tr>

                        ) : (

                            users.map((user) => (

                                <tr key={user.id}>

                                    <td>
                                        <strong>{user.name}</strong>
                                    </td>

                                    <td>{user.email}</td>

                                    <td>{user.phone || "—"}</td>

                                    <td>
                                        <span
                                            className={`role-tag ${user.role}`}
                                        >
                                            {ROLE_LABELS[user.role] || user.role}
                                        </span>
                                    </td>

                                    <td className="user-actions">

                                        <select
                                            value={user.role}
                                            onChange={(e) =>
                                                handleRoleChange(
                                                    user,
                                                    e.target.value
                                                )
                                            }
                                            disabled={
                                                user.id === currentUser?.id
                                            }
                                        >
                                            <option value={USER}>User</option>
                                            <option value={ADMIN}>Admin</option>
                                        </select>

                                        <button
                                            className="btn btn-danger"
                                            onClick={() =>
                                                handleDelete(user)
                                            }
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>
                </table>

            </div>

        </div>
    );
}

export default Users;