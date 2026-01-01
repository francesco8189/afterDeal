/**
 * Utility per formattazione di valori comuni
 */

/**
 * Formatta un valore numerico come valuta
 * @param {number} value - Valore da formattare
 * @param {string} currency - Simbolo valuta (default: '€')
 * @returns {string} Valore formattato
 */
export const formatCurrency = (value, currency = '€') => {
    return `${currency} ${value.toLocaleString('it-IT')}`;
};

/**
 * Formatta una stringa data in formato locale italiano
 * @param {string|Date} dateString - Data da formattare
 * @returns {string} Data formattata
 */
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT');
};

/**
 * Formatta una stringa data con ora in formato locale italiano
 * @param {string|Date} dateString - Data da formattare
 * @returns {string} Data e ora formattate
 */
export const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('it-IT');
};

/**
 * Formatta un valore come percentuale
 * @param {number} value - Valore da formattare (0-100)
 * @returns {string} Valore formattato con simbolo %
 */
export const formatPercentage = (value) => {
    return `${value}%`;
};

/**
 * Formatta un numero con separatori di migliaia
 * @param {number} value - Numero da formattare
 * @returns {string} Numero formattato
 */
export const formatNumber = (value) => {
    return value.toLocaleString('it-IT');
};
