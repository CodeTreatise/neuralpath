/* ========================================
   NeuralPath - Main Application
   ======================================== */

const App = {
    /**
     * Initialize the application
     */
    async init() {
        console.log('🧠 NeuralPath initializing...');
        
        // Initialize theme
        this.initTheme();
        
        // Initialize routes
        this.initRoutes();
        
        // Initialize global search
        Search.init();
        
        // Load initial data
        await this.loadData();
        
        // Handle initial route
        Router.start();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ NeuralPath ready!');
    },
    
    /**
     * Initialize theme from storage
     */
    initTheme() {
        const theme = Storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeToggle(theme);
    },
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const current = Storage.getTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        Storage.setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        this.updateThemeToggle(next);
        
        // Update graph colors if on explore page with active graph
        if (typeof ExplorePage !== 'undefined' && ExplorePage.updateThemeColors) {
            ExplorePage.updateThemeColors();
        }
        
        Components.toast(`Switched to ${next} mode`, 'success');
    },
    
    /**
     * Update theme toggle button
     */
    updateThemeToggle(theme) {
        const btn = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        if (btn) {
            const nextMode = theme === 'dark' ? 'light' : 'dark';
            btn.setAttribute('aria-label', `Switch to ${nextMode} mode`);
            btn.title = `Switch to ${nextMode} mode`;
        }
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    },
    
    /**
     * Initialize routes
     */
    initRoutes() {
        // Home
        Router.register('/', async () => {
            await HomePage.render();
        });
        
        // Explore / Knowledge Maps
        Router.register('/explore', async () => {
            await ExplorePage.render();
        });
        
        Router.register('/explore/:graphId', async (params) => {
            await ExplorePage.renderGraph(params.graphId);
        });
        
        // Courses
        Router.register('/courses', async () => {
            await CoursesPage.render();
        });
        
        Router.register('/courses/:courseId', async (params) => {
            await CoursesPage.renderCourse(params.courseId);
        });
        
        Router.register('/courses/:courseId/:moduleIndex/:lessonIndex', async (params) => {
            await CoursesPage.renderLesson(
                params.courseId, 
                parseInt(params.moduleIndex), 
                parseInt(params.lessonIndex)
            );
        });
        
        // Tools
        Router.register('/tools', async () => {
            await ToolsPage.render();
        });
        
        Router.register('/tools/:toolId', async (params) => {
            await ToolsPage.renderTool(params.toolId);
        });
        
        // Resources
        Router.register('/resources', async () => {
            await ResourcesPage.render();
        });
        
        // Jobs
        Router.register('/jobs', async () => {
            await JobsPage.render();
        });
        
        // Periodic Table
        Router.register('/periodic-table', async () => {
            await PeriodicTablePage.render();
        });
        
        // Learning Paths
        Router.register('/learning-paths', async () => {
            await LearningPathsPage.render();
        });
        
        Router.register('/learning-paths/:pathId', async (params) => {
            await LearningPathsPage.renderPathPage(params.pathId);
        });
        
        // 404 handler
        Router.setNotFound(() => {
            const main = document.getElementById('main');
            main.innerHTML = Components.emptyState(
                '404',
                'Page Not Found',
                "The page you're looking for doesn't exist.",
                '<a href="#/" class="btn btn-primary">Go Home</a>'
            );
        });
    },
    
    /**
     * Load initial data
     */
    async loadData() {
        try {
            await Promise.all([
                State.loadTools(),
                State.loadCourses(),
                State.loadGraphs()
            ]);
            // Build search index after data is loaded
            State.buildSearchIndex();
            console.log('📦 Data loaded:', {
                tools: State.data.tools.length,
                courses: State.data.courses.length,
                graphs: State.data.graphs.length,
                searchIndex: State.data.searchIndex.length
            });
        } catch (error) {
            console.error('Failed to load data:', error);
            // Continue with empty data
        }
    },
    
    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Theme toggle
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggleTheme());
        }
        
        // Search trigger
        const searchBtn = document.getElementById('search-trigger');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => Search.open());
        }
        
        // Update active nav on route change
        window.addEventListener('hashchange', () => {
            this.updateActiveNav();
        });
        this.updateActiveNav();
        
        // Handle visibility changes for background updates
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Could refresh data here if needed
            }
        });
    },
    
    /**
     * Update active navigation item
     */
    updateActiveNav() {
        const hash = window.location.hash || '#/';
        const path = hash.replace('#', '').split('?')[0];
        
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            const linkPath = href?.replace('#', '') || '/';
            
            // Check if current path starts with link path
            const isActive = linkPath === '/' 
                ? path === '/' 
                : path.startsWith(linkPath);
            
            link.classList.toggle('active', isActive);
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    // DOM already loaded, init immediately
    App.init();
}

// Make available globally
window.App = App;
