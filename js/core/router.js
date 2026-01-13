/* ========================================
   NeuralPath - Router
   ======================================== */

const Router = {
    routes: {},
    currentRoute: null,
    currentParams: {},

    /**
     * Initialize router
     */
    init() {
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());

        // Handle initial route
        this.handleRoute();

        // Handle clicks on links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#/"]');
            if (link) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    },

    /**
     * Register a route
     */
    register(path, handler) {
        this.routes[path] = handler;
    },

    /**
     * Navigate to a route
     */
    navigate(path, replace = false) {
        if (replace) {
            window.location.replace(path);
        } else {
            window.location.hash = path.startsWith('#') ? path.slice(1) : path;
        }
    },

    /**
     * Handle current route
     */
    async handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const [path, queryString] = hash.split('?');
        const query = queryString ? Helpers.parseQuery(queryString) : {};

        // Find matching route
        const { handler, params } = this.matchRoute(path);

        if (handler) {
            this.currentRoute = path;
            this.currentParams = { ...params, ...query };

            // Update active nav link
            this.updateActiveNav(path);

            // Show loading
            this.showLoading();

            try {
                // Execute route handler
                await handler(this.currentParams);
            } catch (error) {
                console.error('Route error:', error);
                this.showError(error);
            }
        } else {
            // 404 - Route not found
            this.show404();
        }
    },

    /**
     * Match route with params
     */
    matchRoute(path) {
        // Exact match
        if (this.routes[path]) {
            return { handler: this.routes[path], params: {} };
        }

        // Pattern match (e.g., /courses/:id)
        for (const [pattern, handler] of Object.entries(this.routes)) {
            const params = this.matchPattern(pattern, path);
            if (params) {
                return { handler, params };
            }
        }

        return { handler: null, params: {} };
    },

    /**
     * Match URL pattern with params
     */
    matchPattern(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');

        if (patternParts.length !== pathParts.length) return null;

        const params = {};

        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];

            if (patternPart.startsWith(':')) {
                // Dynamic param
                params[patternPart.slice(1)] = pathPart;
            } else if (patternPart !== pathPart) {
                return null;
            }
        }

        return params;
    },

    /**
     * Update active navigation link
     */
    updateActiveNav(path) {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const route = link.getAttribute('data-route');
            const isActive = path.startsWith('/' + route) ||
                (route === '' && path === '/');
            link.classList.toggle('active', isActive);
        });
    },

    /**
     * Show loading state
     */
    showLoading() {
        const main = document.getElementById('main');
        main.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    },

    /**
     * Show error state
     */
    showError(error) {
        const main = document.getElementById('main');
        main.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h2 class="empty-state-title">Something went wrong</h2>
                <p class="empty-state-description">${Helpers.escapeHtml(error.message)}</p>
                <button class="btn btn-secondary" onclick="Router.navigate('#/')">
                    Go Home
                </button>
            </div>
        `;
    },

    /**
     * Show 404 state
     */
    show404() {
        const main = document.getElementById('main');
        main.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h2 class="empty-state-title">Page Not Found</h2>
                <p class="empty-state-description">The page you're looking for doesn't exist.</p>
                <button class="btn btn-primary" onclick="Router.navigate('#/')">
                    Go Home
                </button>
            </div>
        `;

        // Call custom handler if set
        if (this.notFoundHandler) {
            this.notFoundHandler();
        }
    },

    /**
     * Set custom 404 handler
     */
    setNotFound(handler) {
        this.notFoundHandler = handler;
    },

    /**
     * Get current route info
     */
    getCurrent() {
        return {
            route: this.currentRoute,
            params: this.currentParams
        };
    },

    /**
     * Go back
     */
    back() {
        window.history.back();
    },

    /**
     * Go forward
     */
    forward() {
        window.history.forward();
    },

    /**
     * Start the router (alias for init)
     */
    start() {
        this.init();
    }
};

// Make available globally
window.Router = Router;
