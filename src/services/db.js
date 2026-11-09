import staticProducts from "../data/products";
import { loginRequest, registerRequest } from "./api";

const bridge =
    typeof window !== "undefined" ? window.electronAPI : undefined;

export const isDesktop = Boolean(bridge && bridge.isDesktop);

/* ---------------- PRODUCTS ---------------- */

export async function fetchProducts() {
    if (isDesktop) {
        return bridge.products.list();
    }

    return staticProducts;
}

export async function saveProduct(product) {
    if (isDesktop) {
        return bridge.products.update(product);
    }

    return product;
}

export async function createProduct(product) {
    if (isDesktop) {
        return bridge.products.create(product);
    }

    return product;
}

export async function removeProduct(id) {
    if (isDesktop) {
        return bridge.products.remove(id);
    }

    return id;
}

/* ---------------- SALES ---------------- */

export async function fetchSales() {
    if (isDesktop) {
        return bridge.sales.list();
    }

    return [];
}

export async function createSale(sale) {
    if (isDesktop) {
        return bridge.sales.create(sale);
    }

    return sale;
}

/* ---------------- AUTH ---------------- */

export async function authLogin(credentials) {
    if (isDesktop) {
        return bridge.auth.login(credentials);
    }

    return loginRequest(credentials);
}

export async function authRegister(payload) {
    if (isDesktop) {
        return bridge.auth.register(payload);
    }

    return registerRequest(payload);
}

export async function authMe() {
    if (isDesktop) {
        return bridge.auth.me();
    }

    return { ok: false };
}

export async function authLogout() {
    if (isDesktop) {
        return bridge.auth.logout();
    }

    return { ok: true };
}

/* ---------------- USERS (ADMIN) ---------------- */

const DESKTOP_ONLY = {
    ok: false,
    error: "User management is only available in the desktop app."
};

export async function fetchUsers() {
    if (isDesktop) {
        return bridge.users.list();
    }

    return DESKTOP_ONLY;
}

export async function createUser(payload) {
    if (isDesktop) {
        return bridge.users.create(payload);
    }

    return DESKTOP_ONLY;
}

export async function updateUser(payload) {
    if (isDesktop) {
        return bridge.users.update(payload);
    }

    return DESKTOP_ONLY;
}

export async function removeUser(id) {
    if (isDesktop) {
        return bridge.users.remove({ id });
    }

    return DESKTOP_ONLY;
}
