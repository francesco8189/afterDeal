/**
 * Gestisce l'overlay scuro dell'applicazione
 */
export class OverlayManager {
    /**
     * @param {string} overlayId - ID dell'elemento overlay nel DOM
     */
    constructor(overlayId = 'app-dim') {
        this.overlay = document.getElementById(overlayId);

        if (!this.overlay) {
            console.warn(`Overlay element with id "${overlayId}" not found`);
        }
    }

    /**
     * Mostra l'overlay
     */
    show() {
        this.overlay?.classList.add('is-on');
    }

    /**
     * Nasconde l'overlay
     */
    hide() {
        this.overlay?.classList.remove('is-on');
    }

    /**
     * Toggle dell'overlay
     * @param {boolean} visible - Se true mostra, se false nasconde
     */
    toggle(visible) {
        this.overlay?.classList.toggle('is-on', visible);
    }

    /**
     * Verifica se l'overlay è visibile
     * @returns {boolean}
     */
    isVisible() {
        return this.overlay?.classList.contains('is-on') ?? false;
    }
}

// Istanza singleton
export const overlay = new OverlayManager();
