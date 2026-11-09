export const ADMIN = "admin";
export const USER = "user";

export const ROLES = [USER, ADMIN];

export const ROLE_LABELS = {
    [USER]: "User",
    [ADMIN]: "Admin"
};

export const ADMIN_ONLY_PATHS = [
    "/users",
    "/reports",
    "/expenses",
    "/suppliers"
];
