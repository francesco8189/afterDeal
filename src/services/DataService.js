/**
 * Servizio centralizzato per la gestione dei dati dell'applicazione
 * Include caching e mock data per lo sviluppo
 */
export class DataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minuti
    }

    /**
     * Ottiene i dati della dashboard
     * @param {boolean} forceRefresh - Se true, bypassa la cache
     * @returns {Promise<Object>} Dati della dashboard
     */
    async getDashboardData(forceRefresh = false) {
        const cacheKey = 'dashboard';

        if (!forceRefresh && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        // TODO: In futuro sostituire con: const data = await invoke("get_dashboard_data");
        const data = await this.mockDashboardData();

        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return data;
    }

    /**
     * Dati mock temporanei per la dashboard
     * @private
     */
    async mockDashboardData() {
        // Simula latenza di rete
        await new Promise(resolve => setTimeout(resolve, 100));

        return {
            kpi: {
                contracts: 42,
                deadlines: 7,
                penalties: 12400,
                avoided: 8900,
            },
            timeline: [
                { date: "2025-01-12", label: "Contratto Alfa – Revisione" },
                { date: "2025-01-15", label: "Contratto Beta – Scadenza milestone" },
                { date: "2025-01-20", label: "Contratto Gamma – Rinnovo" },
            ],
            critical: [
                "Contratto Gamma – scade tra 2 giorni",
                "Contratto Delta – milestone non assegnata",
                "Contratto Epsilon – SLA a rischio",
            ],
            tasks: [
                "Mario – Revisione contratto Gamma",
                "Lucia – Aggiornamento SLA Delta",
                "Lucia – Aggiornamento SLA Delta",
                "Mario – Revisione contratto Gamma",
                "Lucia – Aggiornamento SLA Delta",
                "Lucia – Aggiornamento SLA Delta",
                "Mario – Revisione contratto Gamma",
                "Lucia – Aggiornamento SLA Delta",
                "Lucia – Aggiornamento SLA Delta",
            ],
        };
    }

    /**
     * Pulisce tutta la cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Pulisce una specifica entry dalla cache
     * @param {string} key - Chiave della cache da pulire
     */
    clearCacheEntry(key) {
        this.cache.delete(key);
    }

    /**
     * Imposta il timeout della cache
     * @param {number} milliseconds - Timeout in millisecondi
     */
    setCacheTimeout(milliseconds) {
        this.cacheTimeout = milliseconds;
    }
}

// Istanza singleton del servizio dati
export const dataService = new DataService();
