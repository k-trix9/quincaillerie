const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");

const { app, BrowserWindow, ipcMain } = require("electron");

const { createDatabase } = require("./db.cjs");

const isDev = !app.isPackaged;

const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;
const SESSION_COOKIE = "quincaillerie_sid";
const COOKIE_STORAGE_URL = "http://localhost:5173";

let bridge = null;
let sessionsFile = null;
let sessions = new Map();

function loadSessions(dataDir) {
    sessionsFile = path.join(dataDir, "sessions.json");

    try {
        const raw = JSON.parse(fs.readFileSync(sessionsFile, "utf8"));
        const now = Date.now();

        sessions = new Map(
            Object.entries(raw).filter(([, s]) => s.expiresAt > now)
        );
    } catch {
        sessions = new Map();
    }
}

function saveSessions() {
    try {
        fs.writeFileSync(
            sessionsFile,
            JSON.stringify(Object.fromEntries(sessions))
        );
    } catch {
        // Session persistence is best-effort.
    }
}

function createSession(userId) {
    const sid = crypto.randomBytes(32).toString("hex");

    sessions.set(sid, {
        userId,
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_TTL
    });

    saveSessions();
    return sid;
}

function getSession(sid) {
    const session = sessions.get(sid);

    if (!session) {
        return null;
    }

    if (session.expiresAt < Date.now()) {
        sessions.delete(sid);
        saveSessions();
        return null;
    }

    return session;
}

function destroySession(sid) {
    if (sid && sessions.delete(sid)) {
        saveSessions();
    }
}

function cookieUrlFor(sender) {
    try {
        const url = sender.getURL();

        if (url.startsWith("http://") || url.startsWith("https://")) {
            return new URL(url).origin;
        }
    } catch {
        // fall through to the default storage origin
    }

    return COOKIE_STORAGE_URL;
}

async function setSessionCookie(sender, sid) {
    await sender.session.cookies.set({
        url: cookieUrlFor(sender),
        name: SESSION_COOKIE,
        value: sid,
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        expirationDate: Math.floor((Date.now() + SESSION_TTL) / 1000)
    });
}

async function clearSessionCookie(sender) {
    await sender.session.cookies.remove(
        cookieUrlFor(sender),
        SESSION_COOKIE
    );
}

async function readSessionId(sender) {
    const cookies = await sender.session.cookies.get({
        name: SESSION_COOKIE
    });

    return cookies.length ? cookies[0].value : null;
}

function resolveDataDir() {
    // Portable build: keep data next to the executable so it travels
    // with the app when copied to another drive/computer.
    if (process.env.PORTABLE_EXECUTABLE_DIR) {
        return path.join(
            process.env.PORTABLE_EXECUTABLE_DIR,
            "QuincaillerieData"
        );
    }

    return path.join(app.getPath("userData"), "data");
}

function createWindow() {
    const window = new BrowserWindow({
        width: 1360,
        height: 860,
        minWidth: 1024,
        minHeight: 640,
        backgroundColor: "#0f172a",
        title: "Quincaillerie",
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });

    window.once("ready-to-show", () => window.show());

    const devUrl = process.env.ELECTRON_START_URL;

    if (isDev && devUrl) {
        window.loadURL(devUrl);
        window.webContents.openDevTools({ mode: "detach" });
    } else {
        window.loadFile(
            path.join(__dirname, "..", "dist", "index.html")
        );
    }
}

function registerIpc() {
    const {
        db,
        hashPassword,
        verifyPassword,
        publicUser,
        normalizeRole,
        seedAdminEmail
    } = bridge;

    const authenticate = async (event) => {
        const sid = await readSessionId(event.sender);
        const session = getSession(sid);

        if (!session) {
            return {
                ok: false,
                error: "Your session has expired. Please sign in again."
            };
        }

        const account = await db.users.findOne({ _id: session.userId });

        if (!account) {
            destroySession(sid);
            return { ok: false, error: "This account no longer exists." };
        }

        return { ok: true, account, user: publicUser(account) };
    };

    const requireAdmin = async (event) => {
        const auth = await authenticate(event);

        if (!auth.ok) {
            return auth;
        }

        if (normalizeRole(auth.account.role) !== "admin") {
            return {
                ok: false,
                error: "Only administrators can perform this action."
            };
        }

        return auth;
    };

    /* ---------------- PRODUCTS ---------------- */

    ipcMain.handle("products:list", () => db.products.list());

    ipcMain.handle("products:create", (_event, product) =>
        db.products.insert({
            ...product,
            id: product.id || Date.now()
        })
    );

    ipcMain.handle("products:update", (_event, product) => {
        const { _id, ...changes } = product;

        if (!_id) {
            return product;
        }

        return db.products.updateById(_id, changes);
    });

    ipcMain.handle("products:remove", (_event, id) =>
        db.products.removeById(id)
    );

    /* ---------------- SALES ---------------- */

    ipcMain.handle("sales:list", () => db.sales.list());

    ipcMain.handle("sales:create", (_event, sale) =>
        db.sales.insert({ ...sale, createdAt: Date.now() })
    );

    /* ---------------- AUTH ---------------- */

    ipcMain.handle("auth:login", async (event, credentials) => {
        const email = String(credentials.email || "").toLowerCase();

        const user = await db.users.findOne({ email });

        if (!user || !verifyPassword(credentials.password, user.passwordHash)) {
            return { ok: false, error: "Invalid email or password." };
        }

        const sid = createSession(user._id);
        await setSessionCookie(event.sender, sid);

        return {
            ok: true,
            user: publicUser(user)
        };
    });

    ipcMain.handle("auth:register", async (event, payload) => {
        const email = String(payload.email || "").toLowerCase();
        const name = String(payload.name || "").trim();
        const phone = String(payload.phone || "").trim();
        const password = String(payload.password || "");

        if (!name || !email || !password) {
            return {
                ok: false,
                error: "Name, email and password are required."
            };
        }

        if (password.length < 6) {
            return {
                ok: false,
                error: "Password must be at least 6 characters."
            };
        }

        const existing = await db.users.findOne({ email });

        if (existing) {
            return {
                ok: false,
                error: "An account with this email already exists."
            };
        }

        // Public sign-ups are always standard users. Only an administrator
        // can create or promote additional administrators.
        const created = await db.users.insert({
            name,
            phone,
            email,
            role: "user",
            passwordHash: hashPassword(password),
            createdAt: Date.now()
        });

        const sid = createSession(created._id);
        await setSessionCookie(event.sender, sid);

        return {
            ok: true,
            user: publicUser(created)
        };
    });

    ipcMain.handle("auth:me", async (event) => {
        const auth = await authenticate(event);

        if (!auth.ok) {
            return { ok: false };
        }

        return { ok: true, user: auth.user };
    });

    ipcMain.handle("auth:logout", async (event) => {
        const sid = await readSessionId(event.sender);

        destroySession(sid);
        await clearSessionCookie(event.sender);

        return { ok: true };
    });

    /* ---------------- USERS (ADMIN ONLY) ---------------- */

    ipcMain.handle("users:list", async (event) => {
        const auth = await requireAdmin(event);

        if (!auth.ok) {
            return auth;
        }

        const users = await db.users.list();

        return { ok: true, users: users.map(publicUser) };
    });

    ipcMain.handle("users:create", async (event, request) => {
        const auth = await requireAdmin(event);

        if (!auth.ok) {
            return auth;
        }

        const email = String(request.email || "").toLowerCase();
        const name = String(request.name || "").trim();
        const phone = String(request.phone || "").trim();
        const password = String(request.password || "");

        if (!name || !email || !password) {
            return {
                ok: false,
                error: "Name, email and password are required."
            };
        }

        if (password.length < 6) {
            return {
                ok: false,
                error: "Password must be at least 6 characters."
            };
        }

        const existing = await db.users.findOne({ email });

        if (existing) {
            return {
                ok: false,
                error: "An account with this email already exists."
            };
        }

        const created = await db.users.insert({
            name,
            phone,
            email,
            role: normalizeRole(request.role),
            passwordHash: hashPassword(password),
            createdAt: Date.now()
        });

        return { ok: true, user: publicUser(created) };
    });

    ipcMain.handle("users:update", async (event, request) => {
        const auth = await requireAdmin(event);

        if (!auth.ok) {
            return auth;
        }

        if (!request.id) {
            return { ok: false, error: "Missing user id." };
        }

        const changes = request.changes || {};
        const patch = {};

        if (changes.name !== undefined) {
            patch.name = String(changes.name).trim();
        }

        if (changes.phone !== undefined) {
            patch.phone = String(changes.phone).trim();
        }

        if (changes.role !== undefined) {
            patch.role = normalizeRole(changes.role);
        }

        if (changes.password) {
            const password = String(changes.password);

            if (password.length < 6) {
                return {
                    ok: false,
                    error: "Password must be at least 6 characters."
                };
            }

            patch.passwordHash = hashPassword(password);
        }

        const updated = await db.users.updateById(request.id, patch);

        return { ok: true, user: publicUser(updated) };
    });

    ipcMain.handle("users:remove", async (event, request) => {
        const auth = await requireAdmin(event);

        if (!auth.ok) {
            return auth;
        }

        if (!request.id) {
            return { ok: false, error: "Missing user id." };
        }

        if (auth.account._id === request.id) {
            return {
                ok: false,
                error: "You cannot delete your own account."
            };
        }

        const target = await db.users.findOne({ _id: request.id });

        if (target && target.email === seedAdminEmail) {
            return {
                ok: false,
                error: "The default administrator cannot be deleted."
            };
        }

        await db.users.removeById(request.id);

        return { ok: true, id: request.id };
    });
}

app.whenReady().then(async () => {
    const dataDir = resolveDataDir();

    loadSessions(dataDir);
    bridge = await createDatabase(dataDir);

    registerIpc();
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
