/**
 * Sistema di routing centralizzato per gestire la navigazione nell'app
 */
export class Router {
    constructor() {
        this.routes = new Map();
        this.beforeNavigateHooks = [];
        this.afterNavigateHooks = [];
    }

    /**
     * Registra una route
     * @param {string} section - Sezione dell'app (es. 'dashboard', 'contracts')
     * @param {string} action - Azione da eseguire (es. 'riskoverview', 'newcontract')
     * @param {Function} handler - Funzione da eseguire quando la route viene attivata
     */
    register(section, action, handler) {
        const key = `${section}:${action}`;
        this.routes.set(key, handler);
    }

    /**
     * Registra multiple routes in una volta
     * @param {Object} routes - Oggetto con chiavi 'section:action' e valori handler
     */
    registerMultiple(routes) {
        Object.entries(routes).forEach(([key, handler]) => {
            this.routes.set(key, handler);
        });
    }

    /**
     * Naviga a una specifica route
     * @param {string} section - Sezione dell'app
     * @param {string} action - Azione da eseguire
     * @param {Object} data - Dati aggiuntivi da passare all'handler
     * @returns {boolean} True se la route esiste ed è stata eseguita
     */
    navigate(section, action, data = {}) {
        const key = `${section}:${action}`;
        const handler = this.routes.get(key);

        if (!handler) {
            console.warn(`No route found for ${section}:${action}`);
            return false;
        }

        // Esegui hooks before navigate
        for (const hook of this.beforeNavigateHooks) {
            hook({ section, action, data });
        }

        // Esegui handler
        try {
            handler(data);

            // Esegui hooks after navigate
            for (const hook of this.afterNavigateHooks) {
                hook({ section, action, data });
            }

            return true;
        } catch (error) {
            console.error(`Error executing route ${key}:`, error);
            return false;
        }
    }

    /**
     * Aggiunge un hook da eseguire prima della navigazione
     * @param {Function} hook - Funzione hook
     */
    beforeNavigate(hook) {
        this.beforeNavigateHooks.push(hook);
    }

    /**
     * Aggiunge un hook da eseguire dopo la navigazione
     * @param {Function} hook - Funzione hook
     */
    afterNavigate(hook) {
        this.afterNavigateHooks.push(hook);
    }

    /**
     * Rimuove una route
     * @param {string} section - Sezione dell'app
     * @param {string} action - Azione
     */
    unregister(section, action) {
        const key = `${section}:${action}`;
        this.routes.delete(key);
    }

    /**
     * Verifica se una route esiste
     * @param {string} section - Sezione dell'app
     * @param {string} action - Azione
     * @returns {boolean}
     */
    hasRoute(section, action) {
        const key = `${section}:${action}`;
        return this.routes.has(key);
    }

    /**
     * Ottiene tutte le routes registrate
     * @returns {Array<string>} Array di chiavi route
     */
    getAllRoutes() {
        return Array.from(this.routes.keys());
    }
}

// Istanza singleton del router
export const router = new Router();
