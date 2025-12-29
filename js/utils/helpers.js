/* ========================================
   NeuralPath - Helper Utilities
   ======================================== */

const Helpers = {
    /**
     * Debounce function calls
     */
    debounce(fn, delay = 300) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    },
    
    /**
     * Throttle function calls
     */
    throttle(fn, limit = 100) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Generate unique ID
     */
    generateId() {
        return Math.random().toString(36).substring(2, 11);
    },
    
    /**
     * Format date
     */
    formatDate(date, format = 'short') {
        const d = new Date(date);
        const options = format === 'short' 
            ? { month: 'short', day: 'numeric' }
            : { year: 'numeric', month: 'long', day: 'numeric' };
        return d.toLocaleDateString('en-US', options);
    },
    
    /**
     * Format relative time
     */
    formatRelativeTime(date) {
        const now = Date.now();
        const diff = now - new Date(date).getTime();
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return this.formatDate(date);
    },
    
    /**
     * Truncate text
     */
    truncate(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    },
    
    /**
     * Slugify string
     */
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },
    
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Escape HTML for use in attributes (handles newlines)
     */
    escapeHtmlAttr(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '&#10;')
            .replace(/\r/g, '&#13;');
    },
    
    /**
     * Parse query string
     */
    parseQuery(queryString) {
        const params = new URLSearchParams(queryString);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },
    
    /**
     * Build query string
     */
    buildQuery(params) {
        return Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
    },
    
    /**
     * Deep clone object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * Group array by key
     */
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const value = typeof key === 'function' ? key(item) : item[key];
            (groups[value] = groups[value] || []).push(item);
            return groups;
        }, {});
    },
    
    /**
     * Sort array by key
     */
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = typeof key === 'function' ? key(a) : a[key];
            const bVal = typeof key === 'function' ? key(b) : b[key];
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },
    
    /**
     * Filter array by search term
     */
    filterBySearch(array, searchTerm, keys) {
        if (!searchTerm) return array;
        const term = searchTerm.toLowerCase();
        
        return array.filter(item => {
            return keys.some(key => {
                const value = item[key];
                if (!value) return false;
                return value.toString().toLowerCase().includes(term);
            });
        });
    },
    
    /**
     * Fuzzy match score
     */
    fuzzyMatch(text, query) {
        text = text.toLowerCase();
        query = query.toLowerCase();
        
        let score = 0;
        let textIndex = 0;
        
        for (let i = 0; i < query.length; i++) {
            const char = query[i];
            const foundIndex = text.indexOf(char, textIndex);
            
            if (foundIndex === -1) return 0;
            
            // Bonus for consecutive matches
            if (foundIndex === textIndex) score += 2;
            // Bonus for match at start
            if (foundIndex === 0) score += 3;
            // Base score
            score += 1;
            
            textIndex = foundIndex + 1;
        }
        
        return score;
    },
    
    /**
     * Copy to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    },
    
    /**
     * Download file
     */
    downloadFile(content, filename, type = 'application/json') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    /**
     * Animate element
     */
    animate(element, keyframes, options = {}) {
        const defaults = {
            duration: 300,
            easing: 'ease',
            fill: 'forwards'
        };
        return element.animate(keyframes, { ...defaults, ...options });
    },
    
    /**
     * Wait for element
     */
    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) return resolve(element);
            
            const observer = new MutationObserver((mutations, obs) => {
                const el = document.querySelector(selector);
                if (el) {
                    obs.disconnect();
                    resolve(el);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found`));
            }, timeout);
        });
    },
    
    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    },
    
    /**
     * Get contrast color (black or white)
     */
    getContrastColor(hexColor) {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    },
    
    /**
     * Capitalize first letter
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
};

// Make available globally
window.Helpers = Helpers;
