/* ========================================
   NeuralPath - Home Page
   ======================================== */

const HomePage = {
    /**
     * Render home page
     */
    async render() {
        const main = document.getElementById('main');
        const stats = State.getStats();
        const recent = Storage.getRecent().slice(0, 5);
        
        // Count total lessons from courses (handling both flat and modular structures)
        const totalLessons = State.data.courses.reduce((sum, course) => {
            // Check for modules with nested lessons
            if (course.modules) {
                return sum + course.modules.reduce((moduleSum, mod) => {
                    return moduleSum + (mod.lessons?.length || 0);
                }, 0);
            }
            // Fallback to root-level lessons or totalLessons property
            return sum + (course.lessons?.length || course.totalLessons || 0);
        }, 0);
        
        main.innerHTML = `
            <!-- Hero Section -->
            <section class="hero">
                <div class="hero-content">
                    <div class="hero-badge">
                        <span class="hero-badge-dot"></span>
                        Your AI Learning Journey Starts Here
                    </div>
                    <h1 class="hero-title">Master Generative AI</h1>
                    <p class="hero-subtitle">
                        From fundamentals to production-ready applications. 
                        Learn at your own pace with interactive courses and hands-on projects.
                    </p>
                    <div class="hero-actions">
                        <a href="#/courses" class="btn btn-primary btn-lg">
                            🚀 Start Learning
                        </a>
                        <a href="#/explore" class="btn btn-secondary btn-lg">
                            🗺️ Explore Map
                        </a>
                    </div>
                </div>
            </section>
            
            <!-- Stats Bar -->
            <section class="stats-bar">
                <div class="stats-container">
                    <div class="stat-item">
                        <span class="stat-icon">📚</span>
                        <span class="stat-number">${stats.courses}</span>
                        <span class="stat-label">Courses</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-icon">📖</span>
                        <span class="stat-number">${totalLessons}</span>
                        <span class="stat-label">Lessons</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-icon">🔧</span>
                        <span class="stat-number">${stats.tools}</span>
                        <span class="stat-label">AI Tools</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-icon">🌐</span>
                        <span class="stat-number">${stats.resources}</span>
                        <span class="stat-label">Resources</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-icon">🗺️</span>
                        <span class="stat-number">${stats.graphs}</span>
                        <span class="stat-label">Knowledge Maps</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-icon">💼</span>
                        <span class="stat-number">${stats.careers}</span>
                        <span class="stat-label">Career Paths</span>
                    </div>
                </div>
            </section>
            
            <!-- Quick Access -->
            <section class="quick-access">
                <a href="pages/journey.html" class="quick-card quick-card-featured">
                    <span class="quick-card-icon">🌲</span>
                    <h3 class="quick-card-title">AI Journey</h3>
                    <p class="quick-card-desc">3D walk through 178 years of AI history</p>
                </a>
                <a href="pages/landscape.html" class="quick-card quick-card-featured">
                    <span class="quick-card-icon">🌌</span>
                    <h3 class="quick-card-title">AI Universe</h3>
                    <p class="quick-card-desc">Explore 1,192 concepts across 47 domains in 3D</p>
                </a>
                <a href="#/explore" class="quick-card">
                    <span class="quick-card-icon">🗺️</span>
                    <h3 class="quick-card-title">Explore</h3>
                    <p class="quick-card-desc">Navigate AI concepts with interactive knowledge maps</p>
                </a>
                <a href="#/courses" class="quick-card">
                    <span class="quick-card-icon">📚</span>
                    <h3 class="quick-card-title">Courses</h3>
                    <p class="quick-card-desc">Structured learning paths from beginner to expert</p>
                </a>
                <a href="#/tools" class="quick-card">
                    <span class="quick-card-icon">🔧</span>
                    <h3 class="quick-card-title">Tools</h3>
                    <p class="quick-card-desc">Discover ${stats.tools}+ AI tools and frameworks</p>
                </a>
                <a href="#/resources" class="quick-card">
                    <span class="quick-card-icon">🌐</span>
                    <h3 class="quick-card-title">Resources</h3>
                    <p class="quick-card-desc">366 curated courses, docs & tutorials</p>
                </a>
                <a href="#/glossary" class="quick-card">
                    <span class="quick-card-icon">📖</span>
                    <h3 class="quick-card-title">Glossary</h3>
                    <p class="quick-card-desc">128 essential AI/ML terms defined</p>
                </a>
                <a href="#/jobs" class="quick-card">
                    <span class="quick-card-icon">💼</span>
                    <h3 class="quick-card-title">Careers</h3>
                    <p class="quick-card-desc">AI/ML career paths, salaries & skills</p>
                </a>
            </section>
            
            <!-- Featured Course -->
            <section class="featured-section">
                ${Components.sectionHeader('Featured Course', 'Continue where you left off')}
                <div class="featured-course">
                    <div class="featured-course-content">
                        <span class="featured-course-badge">🎓 Recommended</span>
                        <h3 class="featured-course-title">Generative AI Applications</h3>
                        <p class="card-description">
                            Build practical applications with LLMs, image generation, 
                            and multi-modal AI systems.
                        </p>
                        <div class="featured-course-progress">
                            ${Components.progressBar(0, 'Progress')}
                        </div>
                    </div>
                    <a href="#/courses/genai-applications" class="btn btn-primary">
                        Start Learning →
                    </a>
                </div>
            </section>
            
            <!-- Knowledge Maps -->
            <section class="featured-section">
                ${Components.sectionHeader(
                    'Knowledge Maps', 
                    'Explore AI concepts visually',
                    '<a href="#/explore" class="btn btn-ghost btn-sm">View all →</a>'
                )}
                <div class="grid grid-auto-fit">
                    ${this.renderGraphCards()}
                </div>
            </section>
            
            <!-- Popular Tools -->
            <section class="featured-section">
                ${Components.sectionHeader(
                    'Popular Tools', 
                    'Most used AI tools',
                    '<a href="#/tools" class="btn btn-ghost btn-sm">View all →</a>'
                )}
                <div class="grid grid-auto-fit">
                    ${this.renderPopularTools()}
                </div>
            </section>
            
            ${recent.length > 0 ? `
                <!-- Recently Viewed -->
                <section class="featured-section">
                    ${Components.sectionHeader('Recently Viewed')}
                    <div class="list">
                        ${this.renderRecentItems(recent)}
                    </div>
                </section>
            ` : ''}
        `;
    },
    
    /**
     * Render graph cards
     */
    renderGraphCards() {
        const graphs = State.data.graphs.slice(0, 4);
        
        if (graphs.length === 0) {
            return Components.skeleton('card', 4);
        }
        
        return graphs.map(graph => Components.graphCard(graph)).join('');
    },
    
    /**
     * Render popular tools
     */
    renderPopularTools() {
        const tools = State.getAllTools().slice(0, 8);
        
        if (tools.length === 0) {
            return Components.skeleton('card', 4);
        }
        
        return tools.map(tool => Components.toolCard(tool)).join('');
    },
    
    /**
     * Render recent items
     */
    renderRecentItems(items) {
        return items.map(item => `
            <div class="list-item">
                <span style="font-size: 1.5rem;">${item.icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 500;">${Helpers.escapeHtml(item.title)}</div>
                    <div class="text-muted text-sm">${item.type} • ${Helpers.formatRelativeTime(item.viewedAt)}</div>
                </div>
                <a href="${item.url}" class="btn btn-ghost btn-sm">View →</a>
            </div>
        `).join('');
    }
};

// Make available globally
window.HomePage = HomePage;
