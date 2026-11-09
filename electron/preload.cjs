const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    isDesktop: true,

    products: {
        list: () => ipcRenderer.invoke("products:list"),
        create: (product) => ipcRenderer.invoke("products:create", product),
        update: (product) => ipcRenderer.invoke("products:update", product),
        remove: (id) => ipcRenderer.invoke("products:remove", id)
    },

    sales: {
        list: () => ipcRenderer.invoke("sales:list"),
        create: (sale) => ipcRenderer.invoke("sales:create", sale)
    },

    auth: {
        login: (credentials) => ipcRenderer.invoke("auth:login", credentials),
        register: (payload) => ipcRenderer.invoke("auth:register", payload),
        me: () => ipcRenderer.invoke("auth:me"),
        logout: () => ipcRenderer.invoke("auth:logout")
    },

    users: {
        list: () => ipcRenderer.invoke("users:list"),
        create: (payload) => ipcRenderer.invoke("users:create", payload),
        update: (payload) => ipcRenderer.invoke("users:update", payload),
        remove: (payload) => ipcRenderer.invoke("users:remove", payload)
    }
});
