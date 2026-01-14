const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    // Products
    getProducts: () => ipcRenderer.invoke('products:get-all'),
    addProduct: (product) => ipcRenderer.invoke('products:add', product),
    updateProduct: (product) => ipcRenderer.invoke('products:update', product),
    deleteProduct: (id) => ipcRenderer.invoke('products:delete', id),
    
    // Categories
    getCategories: () => ipcRenderer.invoke('categories:get-all'),
    addCategory: (name) => ipcRenderer.invoke('categories:add', name)
})