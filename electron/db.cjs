const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");

const Datastore = require("@seald-io/nedb");

const seedProducts = require("./seeds/products.json");

const SEED_ADMIN = {
    name: "Administrator",
    email: "isano@gmail.com",
    phone: "+250 788 000 000",
    role: "admin",
    password: "nick@2026"
};

const LEGACY_ADMIN_EMAIL = "admin@quincaillerie.rw";

const ROLES = ["admin", "user"];

function normalizeRole(role) {
    return ROLES.includes(role) ? role : "user";
}

const wrap = (store) => ({
    list: () =>
        new Promise((resolve, reject) =>
            store
                .find({})
                .sort({ id: 1 })
                .exec((err, docs) => (err ? reject(err) : resolve(docs)))
        ),
    findOne: (query) =>
        new Promise((resolve, reject) =>
            store.findOne(query, (err, doc) =>
                err ? reject(err) : resolve(doc)
            )
        ),
    insert: (doc) =>
        new Promise((resolve, reject) =>
            store.insert(doc, (err, newDoc) =>
                err ? reject(err) : resolve(newDoc)
            )
        ),
    updateById: (id, changes) =>
        new Promise((resolve, reject) =>
            store.update(
                { _id: id },
                { $set: changes },
                { returnUpdatedDocs: true },
                (err, count, doc) =>
                    err ? reject(err) : resolve(doc)
            )
        ),
    removeById: (id) =>
        new Promise((resolve, reject) =>
            store.remove({ _id: id }, {}, (err, count) =>
                err ? reject(err) : resolve(count)
            )
        )
});

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const derived = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
    if (!stored || !stored.includes(":")) {
        return false;
    }

    const [salt, derived] = stored.split(":");

    const expected = Buffer.from(derived, "hex");
    const actual = crypto.scryptSync(password, salt, 64);

    return (
        expected.length === actual.length &&
        crypto.timingSafeEqual(expected, actual)
    );
}

function publicUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: normalizeRole(user.role)
    };
}

async function createDatabase(baseDir) {
    fs.mkdirSync(baseDir, { recursive: true });

    const make = (name) =>
        new Datastore({
            filename: path.join(baseDir, `${name}.db`),
            autoload: true
        });

    const db = {
        products: wrap(make("products")),
        users: wrap(make("users")),
        sales: wrap(make("sales"))
    };

    const existingProducts = await db.products.list();

    if (existingProducts.length === 0) {
        for (const product of seedProducts) {
            await db.products.insert({ ...product });
        }
    }

    let existingAdmin = await db.users.findOne({
        email: SEED_ADMIN.email
    });

    if (!existingAdmin) {
        // Migrate an administrator created by an earlier seed so the
        // new credentials take effect on existing installations.
        const legacyAdmin = await db.users.findOne({
            email: LEGACY_ADMIN_EMAIL
        });

        if (legacyAdmin) {
            const { password, ...rest } = SEED_ADMIN;

            existingAdmin = await db.users.updateById(legacyAdmin._id, {
                ...rest,
                role: normalizeRole(rest.role),
                passwordHash: hashPassword(password),
                seedPassword: SEED_ADMIN.password
            });
        }
    }

    if (!existingAdmin) {
        const { password, ...rest } = SEED_ADMIN;

        existingAdmin = await db.users.insert({
            ...rest,
            role: normalizeRole(rest.role),
            passwordHash: hashPassword(password),
            seedPassword: SEED_ADMIN.password,
            createdAt: Date.now()
        });
    }

    // Apply the configured seed credentials once. The `seedPassword`
    // marker records which seed password was last applied, so a manually
    // changed password is never overwritten on later launches.
    if (
        existingAdmin.role !== SEED_ADMIN.role ||
        existingAdmin.seedPassword !== SEED_ADMIN.password
    ) {
        await db.users.updateById(existingAdmin._id, {
            role: SEED_ADMIN.role,
            passwordHash: hashPassword(SEED_ADMIN.password),
            seedPassword: SEED_ADMIN.password
        });
    }

    return {
        db,
        hashPassword,
        verifyPassword,
        publicUser,
        normalizeRole,
        seedAdminEmail: SEED_ADMIN.email
    };
}

module.exports = { createDatabase };
