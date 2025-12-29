/* ========================================
   NeuralPath - AI Careers Page (India Focus)
   Career paths, salaries, remote opportunities
   ======================================== */

const JobsPage = {
    careersData: null,
    currentTrack: 'all',
    currentView: 'grid',
    selectedRole: null,
    showRemoteOnly: false,
    salaryMode: 'inr', // 'inr' or 'usd'
    searchQuery: '',
    activeSection: 'overview', // for quick nav
    
    /**
     * Load careers data
     */
    async loadData() {
        if (!this.careersData) {
            try {
                const response = await fetch('data/careers.json');
                this.careersData = await response.json();
            } catch (error) {
                console.error('Failed to load careers data:', error);
                this.careersData = { roles: [], skills: {}, tracks: [], marketInsights: {} };
            }
        }
        return this.careersData;
    },
    
    /**
     * Render careers page
     */
    async render() {
        const main = document.getElementById('main');
        await this.loadData();
        
        let filteredRoles = this.careersData.roles;
        
        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredRoles = filteredRoles.filter(r => {
                const skills = r.skills || {};
                const skillBuckets = [skills.required, skills.important, skills.nice]
                    .filter(Array.isArray)
                    .flat();

                return (
                    r.title?.toLowerCase().includes(query) ||
                    r.description?.toLowerCase().includes(query) ||
                    r.track?.toLowerCase().includes(query) ||
                    r.demand?.toLowerCase().includes(query) ||
                    (r.hotCities || []).some(c => c.toLowerCase().includes(query)) ||
                    (r.topHiring || []).some(c => c.toLowerCase().includes(query)) ||
                    skillBuckets.some(s => s.toLowerCase().includes(query))
                );
            });
        }
        
        if (this.currentTrack !== 'all') {
            if (this.currentTrack === 'remote') {
                filteredRoles = filteredRoles.filter(r => r.remoteAvailable);
            } else {
                filteredRoles = filteredRoles.filter(r => r.track === this.currentTrack);
            }
        }
        if (this.showRemoteOnly) {
            filteredRoles = filteredRoles.filter(r => r.remoteAvailable);
        }
        
        const insights = this.careersData.marketInsights;
        const totalRoles = this.careersData.roles.length;

        main.innerHTML = `
            <!-- Sticky Toolbar - Linear/Raycast inspired -->
            <div class="jobs-toolbar">
                <div class="jobs-toolbar-left">
                    <div class="search-wrapper">
                        <span class="search-icon">🔍</span>
                        <input 
                            type="text" 
                            id="jobs-search" 
                            class="search-input" 
                            placeholder="Search ${totalRoles} career paths..." 
                            value="${Helpers.escapeHtml(this.searchQuery)}"
                            oninput="JobsPage.handleSearch(this.value)"
                        />
                        ${this.searchQuery ? `<button class="search-clear" onclick="JobsPage.clearSearch()">✕</button>` : ''}
                    </div>
                </div>
                <div class="jobs-toolbar-right">
                    <div class="toolbar-stats">
                        <span class="stat-badge stat-jobs">📈 ${insights.overview.totalAIJobs}</span>
                        <span class="stat-badge stat-growth">🚀 ${insights.overview.yoyGrowth}</span>
                    </div>
                    <div class="toolbar-divider"></div>
                    <div class="currency-toggle">
                        <button class="salary-toggle ${this.salaryMode === 'inr' ? 'active' : ''}" onclick="JobsPage.toggleSalary('inr')">
                            ₹ INR
                        </button>
                        <button class="salary-toggle ${this.salaryMode === 'usd' ? 'active' : ''}" onclick="JobsPage.toggleSalary('usd')">
                            $ USD
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Quick Navigation Pills -->
            <div class="jobs-quick-nav">
                <div class="quick-nav-scroll">
                    <button class="quick-nav-pill ${this.activeSection === 'overview' ? 'active' : ''}" onclick="JobsPage.scrollToSection('overview')">
                        <span>📊</span> Overview
                    </button>
                    <button class="quick-nav-pill ${this.activeSection === 'roles' ? 'active' : ''}" onclick="JobsPage.scrollToSection('roles')">
                        <span>💼</span> Career Paths
                    </button>
                    <button class="quick-nav-pill ${this.activeSection === 'skills' ? 'active' : ''}" onclick="JobsPage.scrollToSection('skills')">
                        <span>🛠️</span> Skills
                    </button>
                    <button class="quick-nav-pill ${this.activeSection === 'companies' ? 'active' : ''}" onclick="JobsPage.scrollToSection('companies')">
                        <span>🏢</span> Companies
                    </button>
                    <button class="quick-nav-pill ${this.activeSection === 'certs' ? 'active' : ''}" onclick="JobsPage.scrollToSection('certs')">
                        <span>🎓</span> Certifications
                    </button>
                    <button class="quick-nav-pill ${this.activeSection === 'job-boards' ? 'active' : ''}" onclick="JobsPage.scrollToSection('job-boards')">
                        <span>🔗</span> Job Boards
                    </button>
                </div>
            </div>
            
            <!-- Hero Section - Compact -->
            <section id="section-overview" class="jobs-hero">
                <div class="jobs-hero-content">
                    <div class="jobs-hero-badge">
                        <span class="jobs-badge-dot"></span>
                        <span>🇮🇳 India AI Job Market 2025</span>
                    </div>
                    <h1 class="jobs-hero-title">AI Careers in India</h1>
                    <p class="jobs-hero-subtitle">
                        Explore ${totalRoles} career paths, salary benchmarks, and remote opportunities in India's booming AI industry
                    </p>
                    <div class="jobs-hero-cta">
                        <button class="btn btn-primary btn-lg" onclick="JobsPage.scrollToSection('roles')">
                            <span>💼</span> Explore Roles
                        </button>
                        <button class="btn btn-secondary btn-lg" onclick="JobsPage.scrollToSection('job-boards')">
                            <span>🔗</span> Find Jobs
                        </button>
                    </div>
                </div>
            </section>
            
            <!-- Market Insights Stats -->
            <section class="jobs-market-stats">
                <div class="market-stats-grid">
                    <div class="market-stat-card market-stat-primary" onclick="JobsPage.scrollToSection('roles')">
                        <div class="market-stat-icon">📈</div>
                        <div class="market-stat-value">${insights.overview.totalAIJobs}</div>
                        <div class="market-stat-label">AI Jobs in India</div>
                    </div>
                    <div class="market-stat-card market-stat-success">
                        <div class="market-stat-icon">🚀</div>
                        <div class="market-stat-value">${insights.overview.yoyGrowth}</div>
                        <div class="market-stat-label">YoY Growth</div>
                    </div>
                    <div class="market-stat-card market-stat-warning">
                        <div class="market-stat-icon">💰</div>
                        <div class="market-stat-value">${insights.overview.avgSalaryGrowth}</div>
                        <div class="market-stat-label">Salary Growth</div>
                    </div>
                    <div class="market-stat-card market-stat-accent" onclick="JobsPage.setTrack('remote'); JobsPage.scrollToSection('roles');">
                        <div class="market-stat-icon">🌍</div>
                        <div class="market-stat-value">${insights.overview.remoteJobsPercent}</div>
                        <div class="market-stat-label">Remote Jobs</div>
                    </div>
                </div>
            </section>
            
            <!-- Hiring Hotspots -->
            <section class="jobs-section">
                <div class="section-header-row">
                    <h2 class="jobs-section-title">
                        <span class="section-icon">🗺️</span>
                        Hiring Hotspots
                    </h2>
                    <span class="section-subtitle">Top cities for AI/ML roles</span>
                </div>
                <div class="hotspots-grid">
                    ${insights.hotspots.map((city, i) => `
                        <div class="hotspot-card hotspot-rank-${i + 1} hotspot-clickable" 
                             onclick="JobsPage.filterByCity('${city.city}')" 
                             title="View AI jobs in ${city.city}">
                            <div class="hotspot-rank">#${i + 1}</div>
                            <div class="hotspot-icon">${city.icon}</div>
                            <div class="hotspot-info">
                                <div class="hotspot-city">${city.city}</div>
                                <div class="hotspot-nickname">${city.nickname}</div>
                            </div>
                            <div class="hotspot-stats">
                                <div class="hotspot-metric">
                                    <span class="metric-value">${city.jobShare}</span>
                                    <span class="metric-label">Jobs</span>
                                </div>
                                <div class="hotspot-metric">
                                    <span class="metric-value">${city.avgSalary}</span>
                                    <span class="metric-label">Avg</span>
                                </div>
                            </div>
                            <div class="hotspot-action">View Jobs →</div>
                        </div>
                    `).join('')}
                </div>
            </section>
            
            <!-- Hot Skills Demand -->
            <section class="jobs-section">
                <div class="section-header-row">
                    <h2 class="jobs-section-title">
                        <span class="section-icon">🔥</span>
                        In-Demand Skills
                    </h2>
                    <span class="section-subtitle">Fastest growing in 2025</span>
                </div>
                <div class="skills-demand-grid">
                    ${insights.demandTrends.map((skill, i) => `
                        <div class="skill-demand-card skill-demand-${i + 1}">
                            <div class="skill-icon">${skill.icon}</div>
                            <div class="skill-name">${skill.skill}</div>
                            <div class="skill-growth">${skill.growth}</div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Career Roles Section -->
            <section id="section-roles" class="jobs-section">
                <div class="section-header-row">
                    <h2 class="jobs-section-title">
                        <span class="section-icon">💼</span>
                        Career Paths
                    </h2>
                    <div class="jobs-controls">
                        ${Components.viewToggle(this.currentView, 'JobsPage.setView', { views: ['grid', 'list'] })}
                    </div>
                </div>
                
                <!-- Track Filter with scroll indicator -->
                <div class="jobs-filter-wrapper">
                    <div class="filter-scroll-container">
                        <div class="filter-bar jobs-filter" id="track-filters">
                            ${this.renderTrackFilters()}
                        </div>
                    </div>
                </div>
                
                <!-- Remote Toggle & Results Count -->
                <div class="remote-toggle-container">
                    <label class="remote-toggle">
                        <input type="checkbox" ${this.showRemoteOnly ? 'checked' : ''} onchange="JobsPage.toggleRemote(this.checked)">
                        <span class="remote-toggle-slider"></span>
                        <span class="remote-toggle-label">🌍 Remote-friendly only</span>
                    </label>
                    <span class="results-count">
                        <strong>${filteredRoles.length}</strong> ${filteredRoles.length !== totalRoles ? `of ${totalRoles}` : ''} roles
                        ${this.searchQuery ? `matching "${Helpers.escapeHtml(this.searchQuery)}"` : ''}
                    </span>
                </div>
                
                <!-- Career Roles Grid -->
                <div id="roles-container" class="${this.currentView === 'grid' ? 'jobs-grid' : 'jobs-list'}">
                    ${filteredRoles.length > 0 ? 
                        filteredRoles.map(role => this.renderRoleCard(role)).join('') :
                        `<div class="no-results">
                            <div class="no-results-icon">🔍</div>
                            <h3>No roles found</h3>
                            <p>Try adjusting your search or filters</p>
                            <button class="btn btn-secondary" onclick="JobsPage.clearFilters()">Clear Filters</button>
                        </div>`
                    }
                </div>
            </section>
            
            <!-- Skills Section -->
            <section id="section-skills" class="jobs-section">
                <div class="section-header-row">
                    <h2 class="jobs-section-title">
                        <span class="section-icon">🛠️</span>
                        Essential Skills
                    </h2>
                </div>
                <div class="skills-grid">
                    ${this.renderSkillsSection()}
                </div>
            </section>
            
            <!-- Companies Section -->
            <section id="section-companies" class="jobs-section">
                <div class="section-header-row">
                    <h2 class="jobs-section-title">
                        <span class="section-icon">🏢</span>
                        Top Companies Hiring
                    </h2>
                </div>
                ${this.renderCompanies()}
            </section>
            
            <!-- Certifications -->
            <section id="section-certs" class="jobs-section">
                <div class="section-header-row">
                    <h2 class="jobs-section-title">
                        <span class="section-icon">🎓</span>
                        Valuable Certifications
                    </h2>
                </div>
                <div class="certs-grid">
                    ${this.renderCertifications()}
                </div>
            </section>
            
            <!-- Job Boards Section -->
            <section id="section-job-boards" class="jobs-section">
                <div class="section-header-row">
                    <h2 class="jobs-section-title">
                        <span class="section-icon">🔗</span>
                        Find Your Next Role
                    </h2>
                </div>
                ${this.renderJobBoards()}
            </section>
            
            <!-- Role Detail Modal -->
            <div id="role-modal" class="modal" style="display: none;"></div>
        `;
        
        this.addStyles();
    },
    
    /**
     * Toggle salary display mode
     */
    toggleSalary(mode) {
        this.salaryMode = mode;
        this.render();
    },
    
    /**
     * Toggle remote filter
     */
    toggleRemote(checked) {
        this.showRemoteOnly = checked;
        this.render();
    },
    
    /**
     * Handle search input
     */
    handleSearch(value) {
        this.searchQuery = value;
        this.render();
        // Keep focus on search input
        setTimeout(() => {
            const input = document.getElementById('jobs-search');
            if (input) {
                input.focus();
                input.setSelectionRange(value.length, value.length);
            }
        }, 0);
    },
    
    /**
     * Clear search
     */
    clearSearch() {
        this.searchQuery = '';
        this.render();
    },
    
    /**
     * Clear all filters
     */
    clearFilters() {
        this.searchQuery = '';
        this.currentTrack = 'all';
        this.showRemoteOnly = false;
        this.render();
    },

    /**
     * Filter roles by city (from hotspot click)
     */
    filterByCity(cityName) {
        this.searchQuery = cityName;
        this.render();
        // Scroll to roles section after render
        setTimeout(() => {
            this.scrollToSection('roles');
            // Focus the search input and show the city filter
            const searchInput = document.querySelector('.jobs-toolbar .search-input');
            if (searchInput) {
                searchInput.value = cityName;
            }
        }, 100);
    },
    
    /**
     * Scroll to section with smooth animation
     */
    scrollToSection(sectionId) {
        this.activeSection = sectionId;
        const el = document.getElementById(`section-${sectionId}`);
        if (el) {
            const offset = 120; // Account for sticky toolbar
            const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
        // Update active nav pill
        document.querySelectorAll('.quick-nav-pill').forEach(pill => {
            pill.classList.remove('active');
        });
        const activePill = document.querySelector(`.quick-nav-pill[onclick*="${sectionId}"]`);
        if (activePill) activePill.classList.add('active');
    },
    
    /**
     * Render track filters
     */
    renderTrackFilters() {
        const tracks = [
            { id: 'all', label: 'All Roles', icon: '🎯' },
            { id: 'remote', label: 'Remote First', icon: '🌍' },
            ...this.careersData.tracks.filter(t => t.id !== 'remote').map(t => ({ id: t.id, label: t.title.replace(' Track', ''), icon: t.icon }))
        ];
        
        return tracks.map(t => `
            <button class="chip ${this.currentTrack === t.id ? 'chip-active' : ''}" 
                    onclick="JobsPage.setTrack('${t.id}')">
                <span>${t.icon}</span>
                <span>${t.label}</span>
            </button>
        `).join('');
    },
    
    /**
     * Render role card
     */
    renderRoleCard(role) {
        const track = this.careersData.tracks.find(t => t.id === role.track);
        const trackColor = track?.color || '#6366f1';
        const salary = this.salaryMode === 'inr' ? role.salaryRange : role.salaryUSD;
        const currencySymbol = this.salaryMode === 'inr' ? '₹' : '$';
        
        if (this.currentView === 'list') {
            return `
                <div class="jobs-list-item" onclick="JobsPage.showRoleDetail('${role.id}')">
                    <div class="list-item-main">
                        <span class="role-icon">${role.icon}</span>
                        <div class="list-item-info">
                            <h3 class="role-title">${role.title}</h3>
                            <p class="role-desc">${role.description}</p>
                            <div class="role-tags-row">
                                ${role.remoteAvailable ? '<span class="role-tag remote-tag">🌍 Remote</span>' : ''}
                                <span class="role-tag growth-tag">📈 ${role.growthRate}</span>
                                ${role.hotCities?.slice(0,2).map(c => `<span class="role-tag city-tag">📍 ${c}</span>`).join('') || ''}
                            </div>
                        </div>
                    </div>
                    <div class="list-item-metrics">
                        <div class="metric-block">
                            <div class="metric-label">Senior Salary</div>
                            <div class="metric-value salary-value">${salary.senior}</div>
                        </div>
                        <div class="metric-block">
                            <div class="metric-label">Demand</div>
                            <span class="demand-badge demand-${role.demand.toLowerCase().replace(' ', '-')}">${role.demand}</span>
                        </div>
                        <span class="view-arrow">→</span>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="jobs-role-card" onclick="JobsPage.showRoleDetail('${role.id}')" style="--track-color: ${trackColor}">
                <div class="role-card-header">
                    <span class="role-icon-large">${role.icon}</span>
                    <div class="role-badges">
                        ${role.remoteAvailable ? '<span class="remote-badge">🌍</span>' : ''}
                        <span class="track-badge" style="--badge-color: ${trackColor}">${track?.title.replace(' Track', '') || role.track}</span>
                    </div>
                </div>
                <h3 class="role-card-title">${role.title}</h3>
                <p class="role-card-desc">${role.description}</p>
                
                <div class="role-salary-grid">
                    <div class="salary-block">
                        <span class="salary-label">Entry</span>
                        <span class="salary-value">${salary.entry}</span>
                    </div>
                    <div class="salary-block">
                        <span class="salary-label">Senior</span>
                        <span class="salary-value salary-highlight">${salary.senior}</span>
                    </div>
                </div>
                
                <div class="role-card-footer">
                    <div class="role-growth">
                        <span class="growth-icon">📈</span>
                        <span class="growth-value">${role.growthRate}</span>
                    </div>
                    <span class="demand-badge demand-${role.demand.toLowerCase().replace(' ', '-')}">${role.demand}</span>
                </div>
                
                <div class="role-cities">
                    ${role.hotCities?.slice(0,3).map(c => `<span class="city-chip">📍 ${c}</span>`).join('') || ''}
                </div>
                
                <div class="role-card-cta">View Details →</div>
            </div>
        `;
    },
    
    /**
     * Get demand color - returns CSS variable references for theme compatibility
     */
    getDemandColor(demand) {
        const colors = {
            'Very High': 'var(--color-success)',
            'High': 'var(--color-accent-primary)',
            'Growing': 'var(--color-warning)',
            'Moderate': 'var(--color-text-muted)'
        };
        return colors[demand] || 'var(--color-text-muted)';
    },
    
    /**
     * Show role detail modal
     */
    showRoleDetail(roleId) {
        const role = this.careersData.roles.find(r => r.id === roleId);
        if (!role) return;
        
        this.selectedRole = roleId; // Track selected role for salary toggle
        
        const track = this.careersData.tracks.find(t => t.id === role.track);
        const trackColor = track?.color || '#6366f1';
        const salary = this.salaryMode === 'inr' ? role.salaryRange : role.salaryUSD;
        
        // Generate learning resources based on role skills
        const learningResources = this.getLearningResourcesForRole(role);
        const interviewTopics = this.getInterviewTopicsForRole(role);
        const jobSearchLinks = this.getJobSearchLinksForRole(role);
        
        const modal = document.getElementById('role-modal');
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="JobsPage.closeModal()"></div>
            <div class="modal-content role-modal-content">
                <button class="modal-close" onclick="JobsPage.closeModal()">×</button>
                
                <!-- Header -->
                <div class="modal-header-row">
                    <span class="modal-icon">${role.icon}</span>
                    <div class="modal-header-info">
                        <h2 class="modal-title">${role.title}</h2>
                        <p class="modal-subtitle">${role.description}</p>
                        <div class="modal-badges">
                            <span class="track-badge" style="--badge-color: ${trackColor}">${track?.title || role.track}</span>
                            ${role.remoteAvailable ? '<span class="remote-badge-lg">🌍 Remote Available</span>' : ''}
                            <span class="growth-badge">📈 ${role.growthRate} growth</span>
                            <span class="demand-badge demand-${role.demand.toLowerCase().replace(' ', '-')}">${role.demand} Demand</span>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions Bar -->
                <div class="modal-actions-bar">
                    <a href="${jobSearchLinks.linkedin}" target="_blank" rel="noopener" class="action-btn action-primary">
                        <span>🔍</span> Find Jobs on LinkedIn
                    </a>
                    <a href="${jobSearchLinks.naukri}" target="_blank" rel="noopener" class="action-btn action-secondary">
                        <span>💼</span> Jobs on Naukri
                    </a>
                    <button class="action-btn action-outline" onclick="JobsPage.scrollToModalSection('learn-section')">
                        <span>📚</span> Learn Skills
                    </button>
                    <button class="action-btn action-outline" onclick="JobsPage.scrollToModalSection('interview-section')">
                        <span>🎯</span> Interview Prep
                    </button>
                </div>
                
                <!-- Salary Section -->
                <div class="modal-section salary-section">
                    <div class="section-header-with-toggle">
                        <h4 class="modal-section-title">💰 Salary Ranges</h4>
                        <div class="salary-region-toggle">
                            <button class="region-btn ${this.salaryMode === 'inr' ? 'active' : ''}" onclick="JobsPage.toggleModalSalary('inr')">🇮🇳 India</button>
                            <button class="region-btn ${this.salaryMode === 'usd' ? 'active' : ''}" onclick="JobsPage.toggleModalSalary('usd')">🇺🇸 US</button>
                        </div>
                    </div>
                    <div class="salary-cards" id="modal-salary-cards">
                        ${this.renderSalaryCards(role)}
                    </div>
                    <div class="salary-source">
                        <span class="source-icon">ℹ️</span>
                        <span>Based on data from Glassdoor, Levels.fyi, AmbitionBox & LinkedIn Salary Insights (Dec 2025)</span>
                    </div>
                </div>
                
                <!-- Day in the Life -->
                <div class="modal-section day-section">
                    <h4 class="modal-section-title">📅 What You'll Do Daily</h4>
                    <div class="day-activities">
                        ${this.getDayInTheLife(role).map(activity => `
                            <div class="activity-item">
                                <span class="activity-icon">${activity.icon}</span>
                                <div class="activity-info">
                                    <div class="activity-title">${activity.title}</div>
                                    <div class="activity-time">${activity.time}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Top Hiring -->
                ${role.topHiring ? `
                <div class="modal-section">
                    <h4 class="modal-section-title">🏢 Top Companies Hiring</h4>
                    <div class="hiring-companies">
                        ${role.topHiring.map(c => `
                            <a href="https://www.linkedin.com/company/${c.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}/jobs/" 
                               target="_blank" rel="noopener" class="company-chip company-chip-link">
                                ${c} <span class="chip-arrow">↗</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Hot Cities -->
                ${role.hotCities ? `
                <div class="modal-section">
                    <h4 class="modal-section-title">📍 Hot Locations</h4>
                    <div class="hot-cities">
                        ${role.hotCities.map(c => `
                            <a href="https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role.title)}&location=${encodeURIComponent(c + ', India')}" 
                               target="_blank" rel="noopener" class="city-chip-lg city-chip-link">
                                📍 ${c} <span class="chip-arrow">↗</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Skills -->
                <div class="modal-section" id="skills-section">
                    <h4 class="modal-section-title">🛠️ Required Skills</h4>
                    <div class="skills-breakdown">
                        <div class="skill-category">
                            <span class="skill-cat-label">🔴 Essential (Must Have)</span>
                            <div class="skill-tags">
                                ${role.skills.required.map(s => `
                                    <a href="https://www.google.com/search?q=${encodeURIComponent(s + ' tutorial')}" 
                                       target="_blank" rel="noopener" class="skill-tag skill-essential skill-link">
                                        ${s}
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                        <div class="skill-category">
                            <span class="skill-cat-label">🟡 Important (Good to Have)</span>
                            <div class="skill-tags">
                                ${role.skills.important.map(s => `
                                    <a href="https://www.google.com/search?q=${encodeURIComponent(s + ' tutorial')}" 
                                       target="_blank" rel="noopener" class="skill-tag skill-important skill-link">
                                        ${s}
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                        <div class="skill-category">
                            <span class="skill-cat-label">🟢 Nice to Have (Bonus)</span>
                            <div class="skill-tags">
                                ${role.skills.nice.map(s => `
                                    <a href="https://www.google.com/search?q=${encodeURIComponent(s + ' tutorial')}" 
                                       target="_blank" rel="noopener" class="skill-tag skill-nice skill-link">
                                        ${s}
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Learning Resources -->
                <div class="modal-section learning-section" id="learn-section">
                    <h4 class="modal-section-title">📚 Learning Roadmap</h4>
                    <div class="learning-resources">
                        ${learningResources.map(res => `
                            <a href="${res.url}" target="_blank" rel="noopener" class="learning-card">
                                <div class="learning-icon">${res.icon}</div>
                                <div class="learning-info">
                                    <div class="learning-title">${res.title}</div>
                                    <div class="learning-platform">${res.platform}</div>
                                </div>
                                <div class="learning-meta">
                                    <span class="learning-type ${res.type}">${res.typeLabel}</span>
                                    <span class="learning-arrow">→</span>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                    <a href="#/courses" class="see-all-link" onclick="JobsPage.closeModal()">
                        See all courses →
                    </a>
                </div>
                
                <!-- Interview Prep -->
                <div class="modal-section interview-section" id="interview-section">
                    <h4 class="modal-section-title">🎯 Interview Preparation</h4>
                    <div class="interview-topics">
                        <div class="interview-category">
                            <h5 class="interview-cat-title">💻 Technical Topics</h5>
                            <div class="topic-chips">
                                ${interviewTopics.technical.map(t => `
                                    <a href="https://www.google.com/search?q=${encodeURIComponent(t + ' interview questions')}" 
                                       target="_blank" rel="noopener" class="topic-chip">${t}</a>
                                `).join('')}
                            </div>
                        </div>
                        <div class="interview-category">
                            <h5 class="interview-cat-title">🧩 System Design</h5>
                            <div class="topic-chips">
                                ${interviewTopics.systemDesign.map(t => `
                                    <a href="https://www.google.com/search?q=${encodeURIComponent('ML system design ' + t)}" 
                                       target="_blank" rel="noopener" class="topic-chip">${t}</a>
                                `).join('')}
                            </div>
                        </div>
                        <div class="interview-category">
                            <h5 class="interview-cat-title">🎤 Behavioral</h5>
                            <div class="topic-chips">
                                ${interviewTopics.behavioral.map(t => `<span class="topic-chip topic-behavioral">${t}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="interview-resources">
                        <a href="https://leetcode.com/problemset/all/?topicSlugs=machine-learning" target="_blank" rel="noopener" class="interview-link">
                            <span>🔷</span> LeetCode ML Problems
                        </a>
                        <a href="https://www.interviewquery.com/" target="_blank" rel="noopener" class="interview-link">
                            <span>🎯</span> Interview Query
                        </a>
                        <a href="https://github.com/khangich/machine-learning-interview" target="_blank" rel="noopener" class="interview-link">
                            <span>📖</span> ML Interview Guide (GitHub)
                        </a>
                    </div>
                </div>
                
                <!-- Responsibilities -->
                <div class="modal-section">
                    <h4 class="modal-section-title">📋 Key Responsibilities</h4>
                    <ul class="responsibilities-list">
                        ${role.responsibilities.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
                
                <!-- Career Pathway -->
                <div class="modal-section career-section">
                    <h4 class="modal-section-title">🚀 Career Pathway</h4>
                    <p class="pathway-intro">Typical progression from entry to leadership roles</p>
                    <div class="career-pathway-modern">
                        ${this.renderCareerPathway(role)}
                    </div>
                    <div class="pathway-tips">
                        <div class="tip-card">
                            <span class="tip-icon">💡</span>
                            <div class="tip-content">
                                <strong>Pro Tip:</strong> Focus on depth over breadth in early career. Specialization opens more doors than generalization.
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Data Sources -->
                <div class="modal-section sources-section">
                    <h4 class="modal-section-title">📊 Data Sources & Methodology</h4>
                    <div class="sources-grid">
                        <div class="source-card">
                            <div class="source-icon">💰</div>
                            <div class="source-title">Salary Data</div>
                            <div class="source-links">
                                <a href="https://www.levels.fyi/t/${role.id.replace('-', '-')}" target="_blank">Levels.fyi</a>
                                <a href="https://www.glassdoor.co.in/Salaries/${role.title.replace(/\s+/g, '-').toLowerCase()}-salary-SRCH_KO0,${role.title.length}.htm" target="_blank">Glassdoor</a>
                                <a href="https://www.ambitionbox.com/salaries/${role.title.replace(/\s+/g, '-').toLowerCase()}-salary" target="_blank">AmbitionBox</a>
                            </div>
                        </div>
                        <div class="source-card">
                            <div class="source-icon">📈</div>
                            <div class="source-title">Market Trends</div>
                            <div class="source-links">
                                <a href="https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role.title)}&location=India" target="_blank">LinkedIn Jobs</a>
                                <a href="https://trends.google.com/trends/explore?q=${encodeURIComponent(role.title)}" target="_blank">Google Trends</a>
                            </div>
                        </div>
                        <div class="source-card">
                            <div class="source-icon">🎓</div>
                            <div class="source-title">Skills & Courses</div>
                            <div class="source-links">
                                <a href="https://roadmap.sh/" target="_blank">roadmap.sh</a>
                                <a href="https://www.coursera.org/search?query=${encodeURIComponent(role.title)}" target="_blank">Coursera</a>
                            </div>
                        </div>
                        <div class="source-card">
                            <div class="source-icon">🏢</div>
                            <div class="source-title">Company Data</div>
                            <div class="source-links">
                                <a href="https://www.linkedin.com/company/" target="_blank">LinkedIn</a>
                                <a href="https://www.glassdoor.co.in/" target="_blank">Glassdoor Reviews</a>
                            </div>
                        </div>
                    </div>
                    <div class="sources-note">
                        <span class="note-icon">📅</span>
                        <span>Last updated: December 2025. Data aggregated from multiple sources and may vary by company and experience.</span>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },
    
    /**
     * Render salary cards for modal
     */
    renderSalaryCards(role) {
        const salary = this.salaryMode === 'inr' ? role.salaryRange : role.salaryUSD;
        return `
            <div class="salary-card">
                <div class="salary-level">Entry</div>
                <div class="salary-amount">${salary.entry}</div>
                <div class="salary-exp">0-2 years</div>
            </div>
            <div class="salary-card">
                <div class="salary-level">Mid</div>
                <div class="salary-amount">${salary.mid}</div>
                <div class="salary-exp">2-5 years</div>
            </div>
            <div class="salary-card salary-card-highlight">
                <div class="salary-level">Senior</div>
                <div class="salary-amount">${salary.senior}</div>
                <div class="salary-exp">5-8 years</div>
            </div>
            <div class="salary-card">
                <div class="salary-level">Lead</div>
                <div class="salary-amount">${salary.lead}</div>
                <div class="salary-exp">8+ years</div>
            </div>
        `;
    },
    
    /**
     * Toggle salary in modal
     */
    toggleModalSalary(mode) {
        this.salaryMode = mode;
        const role = this.careersData.roles.find(r => r.id === this.selectedRole);
        if (role) {
            document.getElementById('modal-salary-cards').innerHTML = this.renderSalaryCards(role);
            // Update active button
            document.querySelectorAll('.region-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.region-btn[onclick*="${mode}"]`).classList.add('active');
        }
    },
    
    /**
     * Scroll to section within modal
     */
    scrollToModalSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    
    /**
     * Get learning resources for role
     */
    getLearningResourcesForRole(role) {
        const roleKeywords = role.title.toLowerCase();
        const resources = [];
        
        // Add role-specific courses
        if (roleKeywords.includes('machine learning') || roleKeywords.includes('ml')) {
            resources.push(
                { icon: '🎓', title: 'Machine Learning Specialization', platform: 'Coursera (Stanford)', url: 'https://www.coursera.org/specializations/machine-learning-introduction', type: 'course', typeLabel: 'Course' },
                { icon: '📘', title: 'Hands-On Machine Learning', platform: 'O\'Reilly Book', url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/', type: 'book', typeLabel: 'Book' }
            );
        }
        if (roleKeywords.includes('data scientist')) {
            resources.push(
                { icon: '🎓', title: 'IBM Data Science Professional', platform: 'Coursera', url: 'https://www.coursera.org/professional-certificates/ibm-data-science', type: 'course', typeLabel: 'Course' },
                { icon: '📊', title: 'Python for Data Analysis', platform: 'O\'Reilly Book', url: 'https://wesmckinney.com/book/', type: 'book', typeLabel: 'Book' }
            );
        }
        if (roleKeywords.includes('llm') || roleKeywords.includes('genai')) {
            resources.push(
                { icon: '🤖', title: 'LangChain for LLM Apps', platform: 'DeepLearning.AI', url: 'https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/', type: 'course', typeLabel: 'Free' },
                { icon: '📖', title: 'Prompt Engineering Guide', platform: 'DAIR.AI', url: 'https://www.promptingguide.ai/', type: 'free', typeLabel: 'Free' }
            );
        }
        if (roleKeywords.includes('mlops')) {
            resources.push(
                { icon: '⚙️', title: 'MLOps Specialization', platform: 'Coursera (DeepLearning.AI)', url: 'https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops', type: 'course', typeLabel: 'Course' },
                { icon: '🔧', title: 'Made With ML - MLOps', platform: 'Free Guide', url: 'https://madewithml.com/', type: 'free', typeLabel: 'Free' }
            );
        }
        if (roleKeywords.includes('ethicist') || roleKeywords.includes('policy')) {
            resources.push(
                { icon: '⚖️', title: 'Practical AI Ethics', platform: 'Coursera', url: 'https://www.coursera.org/learn/practical-ai-ethics', type: 'course', typeLabel: 'Course' },
                { icon: '📘', title: 'Weapons of Math Destruction', platform: 'Book', url: 'https://en.wikipedia.org/wiki/Weapons_of_Math_Destruction', type: 'book', typeLabel: 'Book' }
            );
        }
        
        // Add common resources
        resources.push(
            { icon: '🗺️', title: `${role.title} Roadmap`, platform: 'roadmap.sh', url: `https://roadmap.sh/ai-data-scientist`, type: 'roadmap', typeLabel: 'Roadmap' },
            { icon: '💻', title: 'Practice Coding', platform: 'LeetCode', url: 'https://leetcode.com/', type: 'practice', typeLabel: 'Practice' }
        );
        
        return resources.slice(0, 6); // Return top 6
    },
    
    /**
     * Get interview topics for role
     */
    getInterviewTopicsForRole(role) {
        const common = {
            technical: role.skills.required.slice(0, 5),
            systemDesign: ['Recommendation System', 'Real-time Inference', 'Feature Store', 'Model Serving'],
            behavioral: ['Tell me about yourself', 'Challenging project', 'Team conflict', 'Failure & learning']
        };
        
        // Add role-specific topics
        if (role.id.includes('ml-engineer')) {
            common.systemDesign = ['ML Pipeline Design', 'Real-time vs Batch', 'A/B Testing', 'Model Monitoring'];
        } else if (role.id.includes('data-scientist')) {
            common.systemDesign = ['Experiment Design', 'Metrics Selection', 'Causal Inference', 'Data Pipeline'];
        } else if (role.id.includes('llm') || role.id.includes('genai')) {
            common.systemDesign = ['RAG Architecture', 'Prompt Engineering', 'Fine-tuning Strategy', 'Token Optimization'];
            common.technical = ['LangChain', 'Vector DBs', 'Transformers', 'Prompt Design', 'RAG'];
        } else if (role.id.includes('ethicist') || role.id.includes('policy')) {
            common.systemDesign = ['Bias Audit Pipeline', 'Fairness Metrics', 'Human-in-the-loop', 'Explainability'];
            common.technical = ['Fairness Metrics', 'Explainable AI', 'GDPR/EU AI Act', 'Bias Mitigation', 'Red Teaming'];
        }
        
        return common;
    },
    
    /**
     * Get job search links for role
     */
    getJobSearchLinksForRole(role) {
        const encodedTitle = encodeURIComponent(role.title);
        return {
            linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}&location=India`,
            naukri: `https://www.naukri.com/${role.title.toLowerCase().replace(/\s+/g, '-')}-jobs`,
            indeed: `https://www.indeed.co.in/jobs?q=${encodedTitle}`,
            glassdoor: `https://www.glassdoor.co.in/Job/india-${role.title.toLowerCase().replace(/\s+/g, '-')}-jobs-SRCH_IL.0,5_IN115_KO6,${role.title.length + 6}.htm`
        };
    },
    
    /**
     * Get day in the life activities for role
     */
    getDayInTheLife(role) {
        const activities = {
            'ml-engineer': [
                { icon: '☕', title: 'Stand-up & code review', time: '30 min' },
                { icon: '💻', title: 'Feature development & model training', time: '3 hrs' },
                { icon: '🔧', title: 'Debug & optimize pipelines', time: '2 hrs' },
                { icon: '📊', title: 'Analyze experiment results', time: '1 hr' },
                { icon: '🤝', title: 'Cross-team collaboration', time: '1.5 hrs' }
            ],
            'data-scientist': [
                { icon: '📈', title: 'Data exploration & analysis', time: '2.5 hrs' },
                { icon: '🧪', title: 'Experiment design & A/B tests', time: '2 hrs' },
                { icon: '📊', title: 'Build dashboards & reports', time: '1.5 hrs' },
                { icon: '🤖', title: 'Model development', time: '1.5 hrs' },
                { icon: '🎯', title: 'Stakeholder presentations', time: '1 hr' }
            ],
            'default': [
                { icon: '☕', title: 'Morning sync & planning', time: '30 min' },
                { icon: '💻', title: 'Core development work', time: '4 hrs' },
                { icon: '🤝', title: 'Meetings & collaboration', time: '2 hrs' },
                { icon: '📚', title: 'Learning & documentation', time: '1 hr' },
                { icon: '📋', title: 'Code review & planning', time: '1 hr' }
            ]
        };
        
        return activities[role.id] || activities['default'];
    },
    
    /**
     * Render career pathway with enhanced visuals
     */
    renderCareerPathway(role) {
        const salaryINR = role.salaryRange;
        const salaryUSD = role.salaryUSD;
        const salary = this.salaryMode === 'inr' ? salaryINR : salaryUSD;
        
        // Career progression data with realistic info
        const pathwayData = [
            { 
                title: role.pathway[0] || 'Junior',
                level: 'Entry',
                years: '0-2',
                salary: salary.entry,
                focus: 'Learn & Execute',
                desc: 'Build foundations, learn from seniors',
                skills: role.skills.required.slice(0, 3)
            },
            { 
                title: role.pathway[1] || role.title,
                level: 'Mid',
                years: '2-4',
                salary: salary.mid,
                focus: 'Own & Deliver',
                desc: 'Own projects end-to-end',
                skills: role.skills.required.slice(0, 4),
                current: true
            },
            { 
                title: role.pathway[2] || 'Senior ' + role.title,
                level: 'Senior',
                years: '4-7',
                salary: salary.senior,
                focus: 'Lead & Mentor',
                desc: 'Technical leadership, mentor juniors',
                skills: [...role.skills.required.slice(0, 3), ...role.skills.important.slice(0, 2)]
            },
            { 
                title: role.pathway[3] || 'Staff',
                level: 'Staff/Lead',
                years: '7-10',
                salary: salary.lead,
                focus: 'Architect & Influence',
                desc: 'Cross-team impact, architecture decisions',
                skills: ['System Design', 'Leadership', ...role.skills.important.slice(0, 2)]
            },
            { 
                title: role.pathway[4] || 'Principal',
                level: 'Principal+',
                years: '10+',
                salary: salary.lead,
                focus: 'Vision & Strategy',
                desc: 'Org-wide technical direction',
                skills: ['Strategy', 'Influence', 'Innovation']
            }
        ].slice(0, role.pathway.length);
        
        return `
            <div class="pathway-timeline">
                ${pathwayData.map((step, i) => `
                    <div class="pathway-item ${step.current ? 'pathway-item-current' : ''}" data-level="${i + 1}">
                        <div class="pathway-marker">
                            <div class="marker-dot"></div>
                            ${i < pathwayData.length - 1 ? '<div class="marker-line"></div>' : ''}
                        </div>
                        <div class="pathway-content">
                            <div class="pathway-header">
                                <div class="pathway-title-group">
                                    <span class="pathway-level-badge">${step.level}</span>
                                    <h4 class="pathway-title">${step.title}</h4>
                                </div>
                                <div class="pathway-salary-pill">${step.salary}</div>
                            </div>
                            <div class="pathway-meta">
                                <span class="pathway-years"><span class="meta-icon">⏱</span> ${step.years} years</span>
                                <span class="pathway-focus"><span class="meta-icon">🎯</span> ${step.focus}</span>
                            </div>
                            <p class="pathway-desc">${step.desc}</p>
                            <div class="pathway-skills">
                                ${step.skills.map(s => `<span class="pathway-skill">${s}</span>`).join('')}
                            </div>
                            ${step.current ? '<div class="current-indicator">← Typical entry for this role</div>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('role-modal').style.display = 'none';
        document.body.style.overflow = '';
    },
    
    /**
     * Render skills section
     */
    renderSkillsSection() {
        const sections = [
            { key: 'programming', title: 'Programming', icon: '💻' },
            { key: 'frameworks', title: 'Frameworks', icon: '📦' },
            { key: 'concepts', title: 'Concepts', icon: '🧠' },
            { key: 'tools', title: 'Tools', icon: '🛠️' }
        ];
        
        return sections.map(section => `
            <div class="skill-section-card">
                <div class="skill-section-header">
                    <span class="skill-section-icon">${section.icon}</span>
                    <h4>${section.title}</h4>
                </div>
                <div class="skill-items">
                    ${this.careersData.skills[section.key].slice(0, 5).map(skill => {
                        const learnUrl = this.getSkillLearnUrl(skill.name);
                        return learnUrl 
                            ? `<a href="${learnUrl}" target="_blank" rel="noopener" class="skill-item skill-item-link" title="Learn ${skill.name}">
                                <span class="skill-name">${skill.name}</span>
                                <span class="skill-importance importance-${skill.importance.toLowerCase()}">${skill.importance}</span>
                                <span class="skill-learn-icon">📚</span>
                               </a>`
                            : `<div class="skill-item">
                                <span class="skill-name">${skill.name}</span>
                                <span class="skill-importance importance-${skill.importance.toLowerCase()}">${skill.importance}</span>
                               </div>`;
                    }).join('')}
                </div>
            </div>
        `).join('');
    },

    /**
     * Get skill learning resource URL
     */
    getSkillLearnUrl(skillName) {
        const skillUrls = {
            // Programming
            'Python': 'https://www.python.org/about/gettingstarted/',
            'SQL': 'https://mode.com/sql-tutorial/',
            'R': 'https://www.r-project.org/about.html',
            'C++': 'https://www.learncpp.com/',
            'JavaScript': 'https://javascript.info/',
            // Frameworks
            'PyTorch': 'https://pytorch.org/tutorials/',
            'TensorFlow': 'https://www.tensorflow.org/learn',
            'Hugging Face': 'https://huggingface.co/learn',
            'scikit-learn': 'https://scikit-learn.org/stable/tutorial/',
            'LangChain': 'https://python.langchain.com/docs/get_started/introduction',
            // Concepts
            'Deep Learning': 'https://www.deeplearning.ai/',
            'Statistics': 'https://www.khanacademy.org/math/statistics-probability',
            'Linear Algebra': 'https://www.khanacademy.org/math/linear-algebra',
            'NLP': 'https://huggingface.co/learn/nlp-course/',
            'Computer Vision': 'https://www.pyimagesearch.com/',
            // Tools
            'Git': 'https://git-scm.com/book/en/v2',
            'Docker': 'https://docs.docker.com/get-started/',
            'Kubernetes': 'https://kubernetes.io/docs/tutorials/',
            'AWS/GCP/Azure': 'https://aws.amazon.com/free/',
            'MLflow': 'https://mlflow.org/docs/latest/tutorials-and-examples/index.html'
        };
        return skillUrls[skillName] || null;
    },
    
    /**
     * Render certifications
     */
    renderCertifications() {
        return this.careersData.certifications.map(cert => {
            const examUrl = this.getCertificationUrl(cert.name);
            return `
                <div class="cert-card">
                    <div class="cert-provider">${cert.provider}</div>
                    <div class="cert-name">${cert.name}</div>
                    <div class="cert-meta">
                        <span class="cert-level">${cert.level}</span>
                        <span class="cert-cost">${cert.indiaCost}</span>
                    </div>
                    <div class="cert-footer">
                        <div class="cert-value value-${cert.value.toLowerCase()}">${cert.value} Value</div>
                        ${examUrl ? `<a href="${examUrl}" target="_blank" rel="noopener" class="cert-exam-btn">Get Certified ↗</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Get certification exam URL
     */
    getCertificationUrl(certName) {
        const certUrls = {
            'AWS ML Specialty': 'https://aws.amazon.com/certification/certified-machine-learning-specialty/',
            'Google ML Engineer': 'https://cloud.google.com/learn/certification/machine-learning-engineer',
            'Azure AI Engineer': 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/',
            'TensorFlow Developer': 'https://www.tensorflow.org/certificate',
            'Deep Learning Specialization': 'https://www.deeplearning.ai/courses/deep-learning-specialization/',
            'Machine Learning Specialization': 'https://www.coursera.org/specializations/machine-learning-introduction'
        };
        return certUrls[certName] || null;
    },
    
    /**
     * Get importance color
     */
    getImportanceColor(importance) {
        const colors = {
            'Essential': '#22c55e',
            'Important': '#3b82f6',
            'Useful': '#f59e0b',
            'Specialized': '#8b5cf6',
            'Emerging': '#ec4899'
        };
        return colors[importance] || '#6b7280';
    },
    
    /**
     * Render companies section
     */
    renderCompanies() {
        const companies = this.careersData.companies;
        const sections = [
            { key: 'bigTech', title: 'Big Tech', icon: '🏢', color: '#6366f1' },
            { key: 'indianUnicorns', title: 'Indian Unicorns', icon: '🦄', color: '#ec4899' },
            { key: 'indianAIStartups', title: 'AI Startups', icon: '🚀', color: '#10b981' },
            { key: 'aiFirst', title: 'AI-First Companies', icon: '🤖', color: '#8b5cf6' },
            { key: 'itServices', title: 'IT Services', icon: '💼', color: '#f59e0b' },
            { key: 'research', title: 'Research Labs', icon: '🔬', color: '#3b82f6' },
            { key: 'remoteFirst', title: 'Remote-First', icon: '🌍', color: '#06b6d4' }
        ];
        
        return `
            <div class="companies-grid">
                ${sections.map(s => `
                    <div class="company-section-card" style="--section-color: ${s.color}">
                        <h4 class="company-section-title">${s.icon} ${s.title}</h4>
                        <div class="company-chips">
                            ${companies[s.key]?.map(c => {
                                const url = this.getCompanyCareerUrl(c);
                                return url 
                                    ? `<a href="${url}" target="_blank" rel="noopener" class="company-chip company-chip-link" title="View ${c} careers">${c}<span class="chip-arrow">↗</span></a>`
                                    : `<span class="company-chip">${c}</span>`;
                            }).join('') || ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Get company career page URL
     */
    getCompanyCareerUrl(company) {
        const careerUrls = {
            // Big Tech
            'Google India': 'https://careers.google.com/jobs/results/?location=India&q=machine%20learning',
            'Microsoft India': 'https://careers.microsoft.com/professionals/us/en/l-india',
            'Amazon India': 'https://www.amazon.jobs/en/locations/india',
            'Meta': 'https://www.metacareers.com/jobs?offices[0]=India',
            'Apple': 'https://jobs.apple.com/en-in/search?location=india-INDM',
            'NVIDIA': 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite?locations=5c3768efc91e01ef4d2e83e0073eaaa0',
            // AI-First
            'OpenAI': 'https://openai.com/careers',
            'Anthropic': 'https://www.anthropic.com/careers',
            'Hugging Face': 'https://huggingface.co/jobs',
            'Cohere': 'https://cohere.com/careers',
            'Scale AI': 'https://scale.com/careers',
            'Databricks': 'https://www.databricks.com/company/careers',
            // Indian Unicorns
            'Flipkart': 'https://www.flipkartcareers.com/',
            'Swiggy': 'https://careers.swiggy.com/',
            'Zomato': 'https://www.zomato.com/careers',
            'PhonePe': 'https://www.phonepe.com/careers/',
            'CRED': 'https://careers.cred.club/',
            'Razorpay': 'https://razorpay.com/jobs/',
            'Meesho': 'https://careers.meesho.com/',
            'Zerodha': 'https://zerodha.com/careers/',
            // AI Startups
            'Haptik': 'https://haptik.ai/careers',
            'Yellow.ai': 'https://yellow.ai/careers/',
            'Vernacular.ai': 'https://vernacular.ai/careers',
            'Sprinklr': 'https://www.sprinklr.com/careers/',
            'Freshworks': 'https://www.freshworks.com/company/careers/',
            'Postman': 'https://www.postman.com/company/careers/',
            'Observe.AI': 'https://www.observe.ai/careers',
            // IT Services
            'TCS AI Labs': 'https://www.tcs.com/careers',
            'Infosys Applied AI': 'https://www.infosys.com/careers/',
            'Wipro Holmes': 'https://careers.wipro.com/',
            'Tech Mahindra': 'https://careers.techmahindra.com/',
            'HCL': 'https://www.hcltech.com/careers',
            // Research Labs
            'Microsoft Research India': 'https://www.microsoft.com/en-us/research/lab/microsoft-research-india/',
            'Google Research India': 'https://research.google/careers/',
            'IBM Research': 'https://research.ibm.com/careers',
            'Samsung R&D': 'https://research.samsung.com/careers',
            'Adobe Research': 'https://research.adobe.com/careers/',
            // Remote-First
            'GitLab': 'https://about.gitlab.com/jobs/',
            'Automattic': 'https://automattic.com/work-with-us/',
            'Zapier': 'https://zapier.com/jobs',
            'Notion': 'https://www.notion.so/careers',
            'Figma': 'https://www.figma.com/careers/',
            'Stripe': 'https://stripe.com/jobs',
            'Shopify': 'https://www.shopify.com/careers'
        };
        return careerUrls[company] || null;
    },
    
    /**
     * Render job boards section
     */
    renderJobBoards() {
        const boards = this.careersData.jobBoards;
        
        return `
            <div class="job-boards-container">
                <div class="job-board-section">
                    <h4 class="board-section-title">🇮🇳 India Job Portals</h4>
                    <div class="board-cards">
                        ${boards.india.map(b => this.renderBoardCard(b)).join('')}
                    </div>
                </div>
                <div class="job-board-section">
                    <h4 class="board-section-title">🌍 Remote Job Boards</h4>
                    <div class="board-cards">
                        ${boards.remote.map(b => this.renderBoardCard(b)).join('')}
                    </div>
                </div>
                <div class="job-board-section">
                    <h4 class="board-section-title">🌐 Global Platforms</h4>
                    <div class="board-cards">
                        ${boards.global.map(b => this.renderBoardCard(b)).join('')}
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Render single job board card
     */
    renderBoardCard(board) {
        return `
            <a href="${board.url}" target="_blank" rel="noopener" class="job-board-card">
                <span class="board-icon">${board.icon}</span>
                <div class="board-info">
                    <div class="board-name">${board.name}</div>
                    <div class="board-desc">${board.desc}</div>
                </div>
                <span class="board-arrow">↗</span>
            </a>
        `;
    },
    
    /**
     * Render job search resources (legacy - kept for compatibility)
     */
    renderJobResources() {
        return this.renderJobBoards();
    },
    
    /**
     * Add custom styles
     */
    addStyles() {
        if (document.getElementById('careers-styles')) return;
        const style = document.createElement('style');
        style.id = 'careers-styles';
        style.textContent = `
            /* ===== Jobs Toolbar (Linear/Raycast inspired) ===== */
            .jobs-toolbar {
                position: sticky;
                top: 0;
                z-index: 100;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: var(--space-4);
                padding: var(--space-3) var(--space-4);
                margin-bottom: var(--space-3);
                background: color-mix(in srgb, var(--color-bg-primary) 85%, transparent);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-xl);
            }
            .jobs-toolbar-left {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                flex: 1;
                min-width: 0;
            }
            .jobs-toolbar-right {
                display: flex;
                align-items: center;
                gap: var(--space-3);
            }
            .jobs-toolbar .search-wrapper {
                position: relative;
                flex: 1;
                max-width: 400px;
            }
            .jobs-toolbar .search-icon {
                position: absolute;
                left: var(--space-3);
                top: 50%;
                transform: translateY(-50%);
                color: var(--color-text-muted);
                font-size: var(--text-sm);
                pointer-events: none;
            }
            .jobs-toolbar .search-input {
                width: 100%;
                padding: var(--space-2) var(--space-10);
                background: var(--color-bg-tertiary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                font-size: var(--text-sm);
                color: var(--color-text-primary);
                transition: all var(--transition-fast);
            }
            .jobs-toolbar .search-input:focus {
                outline: none;
                border-color: var(--color-accent-primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
            }
            .jobs-toolbar .search-clear {
                position: absolute;
                right: var(--space-2);
                top: 50%;
                transform: translateY(-50%);
                background: var(--color-bg-hover);
                border: none;
                width: 20px;
                height: 20px;
                border-radius: var(--radius-full);
                font-size: 10px;
                color: var(--color-text-muted);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .jobs-toolbar .stat-badge {
                display: inline-flex;
                align-items: center;
                gap: var(--space-1);
                padding: var(--space-1) var(--space-2);
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-md);
                font-size: var(--text-xs);
                font-weight: 500;
                color: var(--color-text-secondary);
            }
            .jobs-toolbar .stat-badge.stat-growth {
                color: var(--color-success);
            }
            .jobs-toolbar .toolbar-divider {
                width: 1px;
                height: 24px;
                background: var(--color-border);
            }
            .jobs-toolbar .currency-toggle {
                display: flex;
                gap: var(--space-1);
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-lg);
                padding: 2px;
            }
            .jobs-toolbar .currency-toggle .salary-toggle {
                padding: var(--space-1) var(--space-2);
                font-size: var(--text-xs);
                border-radius: var(--radius-md);
            }
            
            /* ===== Quick Navigation Pills ===== */
            .jobs-quick-nav {
                position: sticky;
                top: 60px;
                z-index: 99;
                margin-bottom: var(--space-4);
                padding: var(--space-2) 0;
                background: var(--color-bg-primary);
            }
            .quick-nav-scroll {
                display: flex;
                gap: var(--space-2);
                overflow-x: auto;
                padding-bottom: var(--space-2);
                scrollbar-width: none;
                -ms-overflow-style: none;
                mask-image: linear-gradient(to right, black 90%, transparent 100%);
                -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);
            }
            .quick-nav-scroll::-webkit-scrollbar {
                display: none;
            }
            .quick-nav-pill {
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-2) var(--space-4);
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-full);
                font-size: var(--text-sm);
                font-weight: 500;
                color: var(--color-text-secondary);
                cursor: pointer;
                white-space: nowrap;
                transition: all var(--transition-fast);
            }
            .quick-nav-pill:hover {
                background: var(--color-bg-tertiary);
                border-color: var(--color-border-hover);
                color: var(--color-text-primary);
            }
            .quick-nav-pill.active {
                background: var(--color-accent-primary);
                border-color: var(--color-accent-primary);
                color: white;
            }
            
            /* ===== Filter Scroll Container ===== */
            .jobs-filter-wrapper {
                margin-bottom: var(--space-4);
            }
            .filter-scroll-container {
                position: relative;
                overflow: hidden;
            }
            .filter-scroll-container::after {
                content: '›';
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                width: 40px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                background: linear-gradient(to right, transparent, var(--color-bg-primary) 70%);
                color: var(--color-text-muted);
                font-size: 1.5rem;
                pointer-events: none;
                padding-right: var(--space-2);
            }
            .jobs-filter {
                display: flex;
                gap: var(--space-2);
                overflow-x: auto;
                padding-bottom: var(--space-2);
                padding-right: 40px;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            .jobs-filter::-webkit-scrollbar {
                display: none;
            }
            
            /* ===== No Results State ===== */
            .no-results {
                grid-column: 1 / -1;
                text-align: center;
                padding: var(--space-12) var(--space-6);
                background: var(--color-bg-secondary);
                border: 1px dashed var(--color-border);
                border-radius: var(--radius-xl);
            }
            .no-results-icon {
                font-size: 3rem;
                margin-bottom: var(--space-4);
                opacity: 0.5;
            }
            .no-results h3 {
                margin: 0 0 var(--space-2);
                color: var(--color-text-primary);
            }
            .no-results p {
                margin: 0 0 var(--space-4);
                color: var(--color-text-muted);
            }
            
            /* ===== Jobs Page Hero ===== */
            .jobs-hero {
                position: relative;
                text-align: center;
                padding: var(--space-12) var(--space-6) var(--space-10);
                margin-bottom: var(--space-6);
                background: var(--gradient-hero);
                border-radius: var(--radius-2xl);
                border: 1px solid var(--color-border);
                overflow: hidden;
            }
            .jobs-hero::before {
                content: '';
                position: absolute;
                top: -50%;
                left: 20%;
                width: 800px;
                height: 800px;
                background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 60%);
                animation: pulse 10s ease-in-out infinite;
                pointer-events: none;
            }
            .jobs-hero::after {
                content: '';
                position: absolute;
                bottom: -30%;
                right: 10%;
                width: 600px;
                height: 600px;
                background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 60%);
                animation: pulse 8s ease-in-out infinite reverse;
                pointer-events: none;
            }
            .jobs-hero-content {
                position: relative;
                z-index: 1;
            }
            .jobs-hero-badge {
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-2) var(--space-4);
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.25);
                border-radius: var(--radius-full);
                font-size: var(--text-sm);
                font-weight: var(--font-medium);
                color: var(--color-success);
                margin-bottom: var(--space-6);
                animation: fadeInUp 0.6s ease-out;
            }
            .jobs-badge-dot {
                width: 8px;
                height: 8px;
                background: var(--color-success);
                border-radius: 50%;
                animation: blink 2s ease-in-out infinite;
            }
            .jobs-hero-title {
                font-size: clamp(2.5rem, 5vw, 3.5rem);
                font-weight: 800;
                margin-bottom: var(--space-4);
                background: linear-gradient(135deg, #10b981 0%, #6366f1 50%, #8b5cf6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                letter-spacing: -0.03em;
                animation: fadeInUp 0.6s ease-out 0.1s backwards;
            }
            .jobs-hero-subtitle {
                font-size: var(--text-lg);
                color: var(--color-text-secondary);
                max-width: 650px;
                margin: 0 auto var(--space-6);
                line-height: var(--leading-relaxed);
                animation: fadeInUp 0.6s ease-out 0.2s backwards;
            }
            .jobs-hero-cta {
                display: flex;
                gap: var(--space-4);
                justify-content: center;
                flex-wrap: wrap;
                animation: fadeInUp 0.6s ease-out 0.3s backwards;
            }
            
            /* ===== Market Stats ===== */
            .jobs-market-stats {
                margin-bottom: var(--space-8);
            }
            .market-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--space-4);
            }
            .market-stat-card {
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-xl);
                padding: var(--space-5);
                text-align: center;
                transition: all var(--transition-normal);
                position: relative;
                overflow: hidden;
            }
            .market-stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
            }
            .market-stat-primary::before { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
            .market-stat-success::before { background: linear-gradient(90deg, #10b981, #06b6d4); }
            .market-stat-warning::before { background: linear-gradient(90deg, #f59e0b, #ef4444); }
            .market-stat-accent::before { background: linear-gradient(90deg, #ec4899, #8b5cf6); }
            .market-stat-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-lg);
            }
            .market-stat-icon {
                font-size: 2rem;
                margin-bottom: var(--space-2);
            }
            .market-stat-value {
                font-size: 2rem;
                font-weight: 800;
                background: var(--gradient-aurora);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .market-stat-label {
                font-size: var(--text-sm);
                color: var(--color-text-muted);
                margin-top: var(--space-1);
            }
            
            /* ===== Section Styles ===== */
            .jobs-section {
                margin-bottom: var(--space-10);
            }
            .section-header-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--space-5);
                flex-wrap: wrap;
                gap: var(--space-3);
            }
            .jobs-section-title {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                font-size: var(--text-2xl);
                font-weight: 700;
                margin: 0;
            }
            .section-icon {
                font-size: 1.5rem;
            }
            .section-subtitle {
                color: var(--color-text-muted);
                font-size: var(--text-sm);
            }
            
            /* ===== Hotspots Grid ===== */
            .hotspots-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: var(--space-4);
            }
            .hotspot-card {
                display: flex;
                align-items: center;
                gap: var(--space-4);
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--space-4);
                transition: all var(--transition-normal);
                position: relative;
            }
            .hotspot-card:hover {
                transform: translateY(-3px);
                box-shadow: var(--shadow-md);
                border-color: var(--color-border-hover);
            }
            .hotspot-rank-1 { border-left: 3px solid #fbbf24; }
            .hotspot-rank-2 { border-left: 3px solid #94a3b8; }
            .hotspot-rank-3 { border-left: 3px solid #cd7c32; }
            .hotspot-rank {
                position: absolute;
                top: -8px;
                left: 10px;
                background: var(--color-bg-tertiary);
                padding: 2px 8px;
                border-radius: var(--radius-sm);
                font-size: var(--text-xs);
                font-weight: 700;
                color: var(--color-text-muted);
            }
            .hotspot-icon {
                font-size: 2rem;
            }
            .hotspot-info {
                flex: 1;
            }
            .hotspot-city {
                font-weight: 600;
                font-size: var(--text-lg);
            }
            .hotspot-nickname {
                font-size: var(--text-sm);
                color: var(--color-text-muted);
            }
            .hotspot-stats {
                display: flex;
                gap: var(--space-4);
            }
            .hotspot-metric {
                text-align: center;
            }
            .hotspot-metric .metric-value {
                font-weight: 700;
                color: var(--color-accent-primary);
            }
            .hotspot-metric .metric-label {
                font-size: var(--text-xs);
                color: var(--color-text-muted);
            }
            .hotspot-clickable {
                cursor: pointer;
            }
            .hotspot-clickable:hover {
                border-color: var(--color-accent-primary);
            }
            .hotspot-action {
                position: absolute;
                bottom: var(--space-2);
                right: var(--space-3);
                font-size: var(--text-xs);
                color: var(--color-accent-primary);
                opacity: 0;
                transform: translateX(-10px);
                transition: all var(--transition-fast);
                font-weight: 600;
            }
            .hotspot-clickable:hover .hotspot-action {
                opacity: 1;
                transform: translateX(0);
            }
            
            /* ===== Skills Demand ===== */
            .skills-demand-grid {
                display: flex;
                gap: var(--space-4);
                flex-wrap: wrap;
            }
            .skill-demand-card {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--space-3) var(--space-4);
                transition: all var(--transition-normal);
            }
            .skill-demand-card:hover {
                transform: scale(1.02);
                box-shadow: var(--shadow-sm);
            }
            .skill-demand-1 { border-color: rgba(236, 72, 153, 0.4); }
            .skill-demand-2 { border-color: rgba(139, 92, 246, 0.4); }
            .skill-demand-3 { border-color: rgba(99, 102, 241, 0.4); }
            .skill-demand-4 { border-color: rgba(6, 182, 212, 0.4); }
            .skill-demand-5 { border-color: rgba(16, 185, 129, 0.4); }
            .skill-icon {
                font-size: 1.5rem;
            }
            .skill-name {
                font-weight: 600;
            }
            .skill-growth {
                color: var(--color-success);
                font-weight: 700;
                font-size: var(--text-sm);
            }
            
            /* ===== Jobs Controls ===== */
            .jobs-controls {
                display: flex;
                align-items: center;
                gap: var(--space-3);
            }
            .salary-toggle {
                padding: var(--space-2) var(--space-3);
                background: var(--color-bg-tertiary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                font-size: var(--text-sm);
                cursor: pointer;
                transition: all var(--transition-fast);
                color: var(--color-text-secondary);
            }
            .salary-toggle:hover {
                background: var(--color-bg-hover);
            }
            .salary-toggle.active {
                background: var(--color-accent-primary);
                color: white;
                border-color: var(--color-accent-primary);
            }
            
            /* ===== Filter Bar ===== */
            .jobs-filter {
                margin-bottom: var(--space-4);
            }
            
            /* ===== Remote Toggle ===== */
            .remote-toggle-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--space-5);
                padding: var(--space-3) var(--space-4);
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
            }
            .remote-toggle {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                cursor: pointer;
            }
            .remote-toggle input {
                display: none;
            }
            .remote-toggle-slider {
                width: 44px;
                height: 24px;
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-full);
                position: relative;
                transition: all var(--transition-fast);
            }
            .remote-toggle-slider::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: var(--color-text-muted);
                border-radius: 50%;
                transition: all var(--transition-fast);
            }
            .remote-toggle input:checked + .remote-toggle-slider {
                background: var(--color-success);
            }
            .remote-toggle input:checked + .remote-toggle-slider::after {
                left: 22px;
                background: white;
            }
            .remote-toggle-label {
                font-size: var(--text-sm);
                color: var(--color-text-secondary);
            }
            .results-count {
                font-size: var(--text-sm);
                color: var(--color-text-muted);
            }
            
            /* ===== Jobs Grid/List ===== */
            .jobs-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
                gap: var(--space-5);
            }
            .jobs-list {
                display: flex;
                flex-direction: column;
                gap: var(--space-3);
            }
            
            /* ===== Role Card (Grid) ===== */
            .jobs-role-card {
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-xl);
                padding: var(--space-5);
                cursor: pointer;
                transition: all var(--transition-normal);
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            .jobs-role-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--track-color);
                opacity: 0.8;
                transition: opacity var(--transition-fast);
            }
            .jobs-role-card::after {
                content: 'View Details →';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: var(--space-3);
                text-align: center;
                font-size: var(--text-sm);
                font-weight: 500;
                color: var(--color-accent-primary);
                background: linear-gradient(to top, var(--color-bg-secondary) 80%, transparent);
                opacity: 0;
                transform: translateY(100%);
                transition: all var(--transition-normal);
            }
            .jobs-role-card:hover {
                transform: translateY(-6px);
                box-shadow: var(--shadow-lg);
                border-color: var(--track-color);
            }
            .jobs-role-card:hover::before {
                opacity: 1;
            }
            .jobs-role-card:hover::after {
                opacity: 1;
                transform: translateY(0);
            }
            .role-card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: var(--space-3);
            }
            .role-icon-large {
                font-size: 2.5rem;
            }
            .role-badges {
                display: flex;
                gap: var(--space-2);
                align-items: center;
            }
            .remote-badge {
                font-size: 1.2rem;
            }
            .track-badge {
                padding: var(--space-1) var(--space-2);
                background: color-mix(in srgb, var(--badge-color) 15%, transparent);
                color: var(--badge-color);
                border-radius: var(--radius-md);
                font-size: var(--text-xs);
                font-weight: 600;
            }
            .role-card-title {
                font-size: var(--text-lg);
                font-weight: 700;
                margin-bottom: var(--space-2);
            }
            .role-card-desc {
                color: var(--color-text-secondary);
                font-size: var(--text-sm);
                margin-bottom: var(--space-4);
                line-height: var(--leading-normal);
            }
            .role-salary-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--space-3);
                margin-bottom: var(--space-4);
                padding: var(--space-3);
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-md);
            }
            .salary-block {
                text-align: center;
            }
            .salary-label {
                font-size: var(--text-xs);
                color: var(--color-text-muted);
                display: block;
            }
            .salary-value {
                font-weight: 600;
                color: var(--color-success);
            }
            .salary-highlight {
                font-size: var(--text-lg);
            }
            .role-card-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--space-3);
            }
            .role-growth {
                display: flex;
                align-items: center;
                gap: var(--space-1);
            }
            .growth-icon {
                font-size: 1rem;
            }
            .growth-value {
                font-weight: 600;
                color: var(--color-accent-primary);
            }
            .demand-badge {
                padding: var(--space-1) var(--space-2);
                border-radius: var(--radius-md);
                font-size: var(--text-xs);
                font-weight: 600;
            }
            .demand-very-high {
                background: rgba(16, 185, 129, 0.15);
                color: var(--color-success);
            }
            .demand-high {
                background: rgba(99, 102, 241, 0.15);
                color: var(--color-accent-primary);
            }
            .demand-growing {
                background: rgba(245, 158, 11, 0.15);
                color: var(--color-warning);
            }
            .demand-moderate {
                background: var(--color-bg-tertiary);
                color: var(--color-text-muted);
            }
            .role-cities {
                display: flex;
                gap: var(--space-2);
                flex-wrap: wrap;
                margin-bottom: var(--space-3);
            }
            .city-chip {
                font-size: var(--text-xs);
                color: var(--color-text-muted);
                background: var(--color-bg-tertiary);
                padding: 2px 8px;
                border-radius: var(--radius-sm);
            }
            .role-card-cta {
                text-align: center;
                color: var(--color-accent-primary);
                font-size: var(--text-sm);
                font-weight: 500;
            }
            
            /* ===== Role Card (List) ===== */
            .jobs-list-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: var(--space-4);
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--space-4);
                cursor: pointer;
                transition: all var(--transition-normal);
            }
            .jobs-list-item:hover {
                background: var(--color-bg-tertiary);
                transform: translateX(4px);
            }
            .list-item-main {
                display: flex;
                gap: var(--space-4);
                align-items: center;
                flex: 1;
            }
            .role-icon {
                font-size: 2rem;
            }
            .list-item-info {
                flex: 1;
            }
            .role-title {
                font-weight: 600;
                margin-bottom: var(--space-1);
            }
            .role-desc {
                color: var(--color-text-muted);
                font-size: var(--text-sm);
                margin-bottom: var(--space-2);
            }
            .role-tags-row {
                display: flex;
                gap: var(--space-2);
                flex-wrap: wrap;
            }
            .role-tag {
                font-size: var(--text-xs);
                padding: 2px 8px;
                border-radius: var(--radius-sm);
                background: var(--color-bg-tertiary);
                color: var(--color-text-muted);
            }
            .remote-tag {
                background: rgba(16, 185, 129, 0.15);
                color: var(--color-success);
            }
            .growth-tag {
                background: rgba(99, 102, 241, 0.15);
                color: var(--color-accent-primary);
            }
            .list-item-metrics {
                display: flex;
                align-items: center;
                gap: var(--space-5);
            }
            .metric-block {
                text-align: center;
            }
            .metric-label {
                font-size: var(--text-xs);
                color: var(--color-text-muted);
            }
            .metric-value {
                font-weight: 600;
            }
            .metric-value.salary-value {
                color: var(--color-success);
            }
            .view-arrow {
                color: var(--color-text-muted);
                font-size: var(--text-lg);
            }
            
            /* ===== Skills Section ===== */
            .skills-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                gap: var(--space-4);
            }
            .skill-section-card {
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--space-4);
            }
            .skill-section-header {
                display: flex;
                align-items: center;
                gap: var(--space-2);
                margin-bottom: var(--space-4);
            }
            .skill-section-icon {
                font-size: 1.25rem;
            }
            .skill-section-header h4 {
                margin: 0;
                font-weight: 600;
            }
            .skill-items {
                display: flex;
                flex-direction: column;
                gap: var(--space-2);
            }
            .skill-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-2);
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-md);
                transition: all var(--transition-fast);
            }
            .skill-item-link {
                text-decoration: none;
                cursor: pointer;
                border: 1px solid transparent;
            }
            .skill-item-link:hover {
                background: var(--color-bg-hover);
                border-color: var(--color-accent-primary);
                transform: translateX(4px);
            }
            .skill-item-link .skill-learn-icon {
                font-size: 12px;
                opacity: 0;
                transition: opacity var(--transition-fast);
            }
            .skill-item-link:hover .skill-learn-icon {
                opacity: 1;
            }
            .skill-item .skill-name {
                font-weight: 500;
            }
            .skill-importance {
                font-size: var(--text-xs);
                padding: 2px 8px;
                border-radius: var(--radius-sm);
                font-weight: 500;
            }
            .importance-essential {
                background: rgba(16, 185, 129, 0.15);
                color: var(--color-success);
            }
            .importance-important {
                background: rgba(59, 130, 246, 0.15);
                color: #3b82f6;
            }
            .importance-useful {
                background: rgba(245, 158, 11, 0.15);
                color: var(--color-warning);
            }
            .importance-specialized {
                background: rgba(139, 92, 246, 0.15);
                color: #8b5cf6;
            }
            .importance-emerging {
                background: rgba(236, 72, 153, 0.15);
                color: #ec4899;
            }
            
            /* ===== Certifications ===== */
            .certs-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: var(--space-4);
            }
            .cert-card {
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--space-4);
                transition: all var(--transition-normal);
            }
            .cert-card:hover {
                transform: translateY(-3px);
                box-shadow: var(--shadow-md);
            }
            .cert-provider {
                font-size: var(--text-xs);
                color: var(--color-text-muted);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: var(--space-1);
            }
            .cert-name {
                font-weight: 600;
                margin-bottom: var(--space-3);
            }
            .cert-meta {
                display: flex;
                justify-content: space-between;
                margin-bottom: var(--space-2);
                font-size: var(--text-sm);
            }
            .cert-level {
                color: var(--color-text-muted);
            }
            .cert-cost {
                color: var(--color-accent-primary);
                font-weight: 500;
            }
            .cert-value {
                display: inline-block;
                padding: var(--space-1) var(--space-2);
                border-radius: var(--radius-sm);
                font-size: var(--text-xs);
                font-weight: 600;
            }
            .value-high {
                background: rgba(16, 185, 129, 0.15);
                color: var(--color-success);
            }
            .value-medium {
                background: rgba(245, 158, 11, 0.15);
                color: var(--color-warning);
            }
            .cert-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--space-2);
                margin-top: var(--space-2);
            }
            .cert-exam-btn {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: var(--space-1) var(--space-3);
                background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
                color: white;
                border-radius: var(--radius-md);
                font-size: var(--text-xs);
                font-weight: 600;
                text-decoration: none;
                transition: all var(--transition-fast);
            }
            .cert-exam-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }
            
            /* ===== Companies ===== */
            .companies-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: var(--space-4);
            }
            .company-section-card {
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--space-4);
                border-top: 3px solid var(--section-color);
            }
            .company-section-title {
                margin: 0 0 var(--space-3);
                font-size: var(--text-base);
                font-weight: 600;
            }
            .company-chips {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-2);
            }
            .company-chip {
                padding: var(--space-1) var(--space-2);
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-md);
                font-size: var(--text-sm);
                color: var(--color-text-secondary);
                transition: all var(--transition-fast);
            }
            .company-chip:hover {
                background: var(--color-bg-hover);
                color: var(--color-text-primary);
            }
            .company-chip-link {
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
                border: 1px solid transparent;
            }
            .company-chip-link:hover {
                background: var(--section-color, var(--color-accent));
                color: white;
                border-color: var(--section-color, var(--color-accent));
                transform: translateY(-1px);
            }
            .company-chip-link .chip-arrow {
                font-size: 10px;
                opacity: 0;
                transition: opacity var(--transition-fast);
            }
            .company-chip-link:hover .chip-arrow {
                opacity: 1;
            }
            
            /* ===== Job Boards ===== */
            .job-boards-container {
                display: flex;
                flex-direction: column;
                gap: var(--space-6);
            }
            .job-board-section {
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-xl);
                padding: var(--space-5);
            }
            .board-section-title {
                margin: 0 0 var(--space-4);
                font-size: var(--text-lg);
                font-weight: 600;
            }
            .board-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: var(--space-3);
            }
            .job-board-card {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                padding: var(--space-3);
                background: var(--color-bg-tertiary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                text-decoration: none;
                color: inherit;
                transition: all var(--transition-normal);
            }
            .job-board-card:hover {
                background: var(--color-bg-hover);
                transform: translateY(-2px);
                box-shadow: var(--shadow-sm);
            }
            .board-icon {
                font-size: 1.5rem;
            }
            .board-info {
                flex: 1;
            }
            .board-name {
                font-weight: 600;
                font-size: var(--text-sm);
            }
            .board-desc {
                font-size: var(--text-xs);
                color: var(--color-text-muted);
            }
            .board-arrow {
                color: var(--color-text-muted);
            }
            
            /* ===== Modal ===== */
            .modal {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: var(--space-4);
            }
            .modal-backdrop {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.75);
                backdrop-filter: blur(4px);
            }
            .role-modal-content {
                position: relative;
                background: var(--color-bg-secondary);
                border-radius: var(--radius-xl);
                padding: var(--space-6);
                max-width: 750px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid var(--color-border);
                animation: modalSlideIn 0.3s ease-out;
            }
            @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .modal-close {
                position: absolute;
                top: var(--space-4);
                right: var(--space-4);
                background: none;
                border: none;
                font-size: 2rem;
                color: var(--color-text-muted);
                cursor: pointer;
                line-height: 1;
                padding: 0;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--radius-full);
                transition: all var(--transition-fast);
            }
            .modal-close:hover {
                background: var(--color-bg-tertiary);
                color: var(--color-text-primary);
            }
            .modal-header-row {
                display: flex;
                gap: var(--space-4);
                margin-bottom: var(--space-6);
            }
            .modal-icon {
                font-size: 3.5rem;
            }
            .modal-header-info {
                flex: 1;
            }
            .modal-title {
                font-size: var(--text-2xl);
                font-weight: 700;
                margin-bottom: var(--space-2);
            }
            .modal-subtitle {
                color: var(--color-text-secondary);
                margin-bottom: var(--space-3);
            }
            .modal-badges {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-2);
            }
            .remote-badge-lg {
                padding: var(--space-1) var(--space-3);
                background: rgba(16, 185, 129, 0.15);
                color: var(--color-success);
                border-radius: var(--radius-md);
                font-size: var(--text-sm);
                font-weight: 500;
            }
            .growth-badge {
                padding: var(--space-1) var(--space-3);
                background: rgba(99, 102, 241, 0.15);
                color: var(--color-accent-primary);
                border-radius: var(--radius-md);
                font-size: var(--text-sm);
                font-weight: 500;
            }
            .modal-section {
                margin-bottom: var(--space-5);
            }
            .modal-section-title {
                font-size: var(--text-base);
                font-weight: 600;
                margin-bottom: var(--space-3);
            }
            
            /* Salary Cards in Modal */
            .salary-section {
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-lg);
                padding: var(--space-4);
            }
            .salary-cards {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: var(--space-3);
            }
            .salary-card {
                text-align: center;
                padding: var(--space-3);
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
            }
            .salary-card-highlight {
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15));
                border: 1px solid rgba(16, 185, 129, 0.3);
            }
            .salary-card .salary-level {
                font-size: var(--text-xs);
                color: var(--color-text-muted);
                margin-bottom: var(--space-1);
            }
            .salary-card .salary-amount {
                font-weight: 700;
                color: var(--color-success);
                font-size: var(--text-lg);
            }
            .salary-card .salary-exp {
                font-size: var(--text-xs);
                color: var(--color-text-muted);
                margin-top: var(--space-1);
            }
            
            /* Hiring Companies */
            .hiring-companies, .hot-cities {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-2);
            }
            .city-chip-lg {
                padding: var(--space-2) var(--space-3);
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-md);
                font-size: var(--text-sm);
            }
            
            /* Skills Breakdown */
            .skills-breakdown {
                display: flex;
                flex-direction: column;
                gap: var(--space-3);
            }
            .skill-category {
                display: flex;
                flex-direction: column;
                gap: var(--space-2);
            }
            .skill-cat-label {
                font-size: var(--text-sm);
                color: var(--color-text-muted);
                font-weight: 500;
            }
            .skill-tags {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-2);
            }
            .skill-tag {
                padding: var(--space-1) var(--space-2);
                border-radius: var(--radius-md);
                font-size: var(--text-sm);
            }
            .skill-essential {
                background: rgba(16, 185, 129, 0.15);
                color: var(--color-success);
            }
            .skill-important {
                background: rgba(59, 130, 246, 0.15);
                color: #3b82f6;
            }
            .skill-nice {
                background: var(--color-bg-tertiary);
                color: var(--color-text-secondary);
            }
            
            /* Responsibilities */
            .responsibilities-list {
                margin: 0;
                padding-left: var(--space-5);
                color: var(--color-text-secondary);
            }
            .responsibilities-list li {
                margin-bottom: var(--space-2);
            }
            
            /* Career Pathway */
            .career-pathway {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: var(--space-1);
            }
            .pathway-step {
                display: flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-2) var(--space-3);
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-md);
            }
            .pathway-current {
                background: var(--color-accent-primary);
                color: white;
            }
            .pathway-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: currentColor;
                opacity: 0.5;
            }
            .pathway-current .pathway-dot {
                background: white;
            }
            .pathway-label {
                font-size: var(--text-sm);
                font-weight: 500;
            }
            .pathway-connector {
                width: 20px;
                height: 2px;
                background: var(--color-border);
            }
            
            /* ===== Enhanced Modal Styles ===== */
            
            /* Quick Actions Bar */
            .modal-actions-bar {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-2);
                margin-bottom: var(--space-5);
                padding: var(--space-3);
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-lg);
            }
            .action-btn {
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-2) var(--space-4);
                border-radius: var(--radius-md);
                font-size: var(--text-sm);
                font-weight: 500;
                cursor: pointer;
                transition: all var(--transition-fast);
                text-decoration: none;
                border: 1px solid transparent;
            }
            .action-primary {
                background: var(--color-accent-primary);
                color: white;
            }
            .action-primary:hover {
                background: var(--color-accent-hover);
                transform: translateY(-1px);
            }
            .action-secondary {
                background: rgba(16, 185, 129, 0.15);
                color: var(--color-success);
                border-color: rgba(16, 185, 129, 0.3);
            }
            .action-secondary:hover {
                background: rgba(16, 185, 129, 0.25);
            }
            .action-outline {
                background: transparent;
                color: var(--color-text-secondary);
                border-color: var(--color-border);
            }
            .action-outline:hover {
                background: var(--color-bg-hover);
                color: var(--color-text-primary);
            }
            
            /* Salary Section Enhanced */
            .section-header-with-toggle {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--space-3);
            }
            .section-header-with-toggle .modal-section-title {
                margin-bottom: 0;
            }
            .salary-region-toggle {
                display: flex;
                gap: 2px;
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
                padding: 2px;
            }
            .region-btn {
                padding: var(--space-1) var(--space-3);
                border: none;
                background: transparent;
                color: var(--color-text-muted);
                font-size: var(--text-xs);
                font-weight: 500;
                border-radius: var(--radius-sm);
                cursor: pointer;
                transition: all var(--transition-fast);
            }
            .region-btn.active {
                background: var(--color-accent-primary);
                color: white;
            }
            .salary-source {
                display: flex;
                align-items: center;
                gap: var(--space-2);
                margin-top: var(--space-3);
                padding: var(--space-2);
                background: var(--color-bg-secondary);
                border-radius: var(--radius-sm);
                font-size: var(--text-xs);
                color: var(--color-text-muted);
            }
            .source-icon {
                font-size: var(--text-sm);
            }
            
            /* Day in the Life */
            .day-activities {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: var(--space-3);
            }
            .activity-item {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                padding: var(--space-3);
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
            }
            .activity-icon {
                font-size: 1.5rem;
            }
            .activity-title {
                font-weight: 500;
                font-size: var(--text-sm);
            }
            .activity-time {
                font-size: var(--text-xs);
                color: var(--color-text-muted);
            }
            
            /* Company/City Chips with Links */
            .company-chip-link, .city-chip-link {
                display: inline-flex;
                align-items: center;
                gap: var(--space-1);
                text-decoration: none;
                color: inherit;
                transition: all var(--transition-fast);
            }
            .company-chip-link:hover, .city-chip-link:hover {
                background: var(--color-bg-hover);
                transform: translateY(-1px);
            }
            .chip-arrow {
                font-size: var(--text-xs);
                opacity: 0.5;
            }
            .company-chip-link:hover .chip-arrow,
            .city-chip-link:hover .chip-arrow {
                opacity: 1;
            }
            
            /* Skill Links */
            .skill-link {
                text-decoration: none;
                cursor: pointer;
                transition: all var(--transition-fast);
            }
            .skill-link:hover {
                transform: translateY(-1px);
                box-shadow: var(--shadow-sm);
            }
            
            /* Learning Resources */
            .learning-resources {
                display: flex;
                flex-direction: column;
                gap: var(--space-2);
            }
            .learning-card {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                padding: var(--space-3);
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                text-decoration: none;
                color: inherit;
                transition: all var(--transition-fast);
            }
            .learning-card:hover {
                background: var(--color-bg-tertiary);
                border-color: var(--color-border-hover);
                transform: translateX(4px);
            }
            .learning-icon {
                font-size: 1.5rem;
                width: 40px;
                text-align: center;
            }
            .learning-info {
                flex: 1;
            }
            .learning-title {
                font-weight: 500;
                margin-bottom: 2px;
            }
            .learning-platform {
                font-size: var(--text-xs);
                color: var(--color-text-muted);
            }
            .learning-meta {
                display: flex;
                align-items: center;
                gap: var(--space-2);
            }
            .learning-type {
                padding: 2px 8px;
                border-radius: var(--radius-sm);
                font-size: var(--text-xs);
                font-weight: 500;
            }
            .learning-type.course {
                background: rgba(99, 102, 241, 0.15);
                color: var(--color-accent-primary);
            }
            .learning-type.free {
                background: rgba(16, 185, 129, 0.15);
                color: var(--color-success);
            }
            .learning-type.book {
                background: rgba(245, 158, 11, 0.15);
                color: var(--color-warning);
            }
            .learning-type.roadmap {
                background: rgba(236, 72, 153, 0.15);
                color: #ec4899;
            }
            .learning-type.practice {
                background: rgba(139, 92, 246, 0.15);
                color: #8b5cf6;
            }
            .learning-arrow {
                color: var(--color-text-muted);
            }
            .see-all-link {
                display: inline-block;
                margin-top: var(--space-3);
                color: var(--color-accent-primary);
                text-decoration: none;
                font-size: var(--text-sm);
                font-weight: 500;
            }
            .see-all-link:hover {
                text-decoration: underline;
            }
            
            /* Interview Section */
            .interview-topics {
                display: flex;
                flex-direction: column;
                gap: var(--space-4);
            }
            .interview-category {
                padding: var(--space-3);
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
            }
            .interview-cat-title {
                margin: 0 0 var(--space-2);
                font-size: var(--text-sm);
                font-weight: 600;
            }
            .topic-chips {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-2);
            }
            .topic-chip {
                padding: var(--space-1) var(--space-2);
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-md);
                font-size: var(--text-xs);
                color: var(--color-text-secondary);
                text-decoration: none;
                transition: all var(--transition-fast);
            }
            .topic-chip:hover {
                background: var(--color-bg-hover);
                color: var(--color-text-primary);
            }
            .topic-behavioral {
                background: rgba(139, 92, 246, 0.1);
                color: #8b5cf6;
            }
            .interview-resources {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-2);
                margin-top: var(--space-4);
                padding-top: var(--space-4);
                border-top: 1px solid var(--color-border);
            }
            .interview-link {
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-2) var(--space-3);
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                font-size: var(--text-sm);
                color: var(--color-text-secondary);
                text-decoration: none;
                transition: all var(--transition-fast);
            }
            .interview-link:hover {
                background: var(--color-bg-tertiary);
                color: var(--color-accent-primary);
                border-color: var(--color-accent-primary);
            }
            
            /* Career Pathway Enhancement */
            .pathway-you {
                font-size: var(--text-xs);
                color: rgba(255,255,255,0.8);
                margin-left: var(--space-1);
            }
            
            /* ===== Modern Career Pathway - Timeline Style ===== */
            .career-section {
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-xl);
                padding: var(--space-5);
            }
            .pathway-intro {
                color: var(--color-text-muted);
                font-size: var(--text-sm);
                margin-bottom: var(--space-5);
            }
            
            /* Timeline Container */
            .pathway-timeline {
                display: flex;
                flex-direction: column;
                gap: 0;
            }
            
            /* Timeline Item */
            .pathway-item {
                display: flex;
                gap: var(--space-4);
                position: relative;
            }
            
            /* Timeline Marker (left side) */
            .pathway-marker {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex-shrink: 0;
                width: 20px;
            }
            .marker-dot {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: var(--color-bg-secondary);
                border: 3px solid var(--color-border);
                z-index: 2;
                transition: all var(--transition-fast);
            }
            .pathway-item:hover .marker-dot {
                border-color: var(--color-accent-primary);
                transform: scale(1.2);
            }
            .pathway-item-current .marker-dot {
                background: var(--color-accent-primary);
                border-color: var(--color-accent-primary);
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
            }
            .marker-line {
                width: 2px;
                flex: 1;
                min-height: 20px;
                background: linear-gradient(180deg, var(--color-border) 0%, var(--color-border) 100%);
            }
            .pathway-item-current .marker-line {
                background: linear-gradient(180deg, var(--color-accent-primary) 0%, var(--color-border) 100%);
            }
            
            /* Timeline Content (right side) */
            .pathway-content {
                flex: 1;
                padding-bottom: var(--space-5);
                transition: all var(--transition-fast);
            }
            .pathway-item:last-child .pathway-content {
                padding-bottom: 0;
            }
            .pathway-item:hover .pathway-content {
                transform: translateX(4px);
            }
            
            /* Header with Title + Salary */
            .pathway-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: var(--space-3);
                margin-bottom: var(--space-2);
                flex-wrap: wrap;
            }
            .pathway-title-group {
                display: flex;
                flex-direction: column;
                gap: var(--space-1);
            }
            .pathway-level-badge {
                display: inline-block;
                padding: 2px 8px;
                background: var(--color-bg-hover);
                border-radius: var(--radius-sm);
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--color-text-muted);
                width: fit-content;
            }
            .pathway-item[data-level="1"] .pathway-level-badge { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
            .pathway-item[data-level="2"] .pathway-level-badge { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
            .pathway-item[data-level="3"] .pathway-level-badge { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
            .pathway-item[data-level="4"] .pathway-level-badge { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
            .pathway-item[data-level="5"] .pathway-level-badge { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
            
            .pathway-title {
                margin: 0;
                font-size: var(--text-base);
                font-weight: 600;
                color: var(--color-text-primary);
            }
            .pathway-item-current .pathway-title {
                color: var(--color-accent-primary);
            }
            
            /* Salary Pill - Most Important */
            .pathway-salary-pill {
                padding: var(--space-1) var(--space-3);
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1));
                border: 1px solid rgba(16, 185, 129, 0.3);
                border-radius: var(--radius-full);
                font-size: var(--text-sm);
                font-weight: 700;
                color: var(--color-success);
                white-space: nowrap;
            }
            
            /* Meta info */
            .pathway-meta {
                display: flex;
                gap: var(--space-4);
                margin-bottom: var(--space-2);
            }
            .pathway-years, .pathway-focus {
                display: flex;
                align-items: center;
                gap: var(--space-1);
                font-size: var(--text-xs);
                color: var(--color-text-muted);
            }
            .meta-icon {
                font-size: 0.75rem;
            }
            
            /* Description */
            .pathway-desc {
                margin: 0 0 var(--space-2);
                font-size: var(--text-sm);
                color: var(--color-text-secondary);
                line-height: var(--leading-relaxed);
            }
            
            /* Skills needed at this level */
            .pathway-skills {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-1);
            }
            .pathway-skill {
                padding: 2px 8px;
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-sm);
                font-size: 10px;
                color: var(--color-text-muted);
            }
            
            /* Current indicator */
            .current-indicator {
                display: inline-flex;
                align-items: center;
                margin-top: var(--space-2);
                padding: var(--space-1) var(--space-2);
                background: rgba(99, 102, 241, 0.1);
                border: 1px dashed rgba(99, 102, 241, 0.4);
                border-radius: var(--radius-md);
                font-size: var(--text-xs);
                color: var(--color-accent-primary);
                font-weight: 500;
            }
            
            /* Tips section */
            .pathway-tips {
                margin-top: var(--space-5);
            }
            .tip-card {
                display: flex;
                align-items: flex-start;
                gap: var(--space-3);
                padding: var(--space-3);
                background: rgba(245, 158, 11, 0.08);
                border: 1px solid rgba(245, 158, 11, 0.2);
                border-radius: var(--radius-lg);
            }
            .tip-icon {
                font-size: 1.25rem;
                flex-shrink: 0;
            }
            .tip-content {
                font-size: var(--text-sm);
                color: var(--color-text-secondary);
                line-height: var(--leading-relaxed);
            }
            .tip-content strong {
                color: var(--color-warning);
            }
            
            /* Data Sources Section */
            .sources-section {
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-lg);
                padding: var(--space-4);
                margin-top: var(--space-6);
            }
            .sources-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: var(--space-3);
            }
            .source-card {
                padding: var(--space-3);
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
                text-align: center;
            }
            .source-card .source-icon {
                font-size: 1.5rem;
                margin-bottom: var(--space-2);
            }
            .source-card .source-title {
                font-size: var(--text-xs);
                font-weight: 600;
                margin-bottom: var(--space-2);
                color: var(--color-text-secondary);
            }
            .source-card .source-links {
                display: flex;
                flex-direction: column;
                gap: var(--space-1);
            }
            .source-card .source-links a {
                font-size: var(--text-xs);
                color: var(--color-accent-primary);
                text-decoration: none;
            }
            .source-card .source-links a:hover {
                text-decoration: underline;
            }
            .sources-note {
                display: flex;
                align-items: flex-start;
                gap: var(--space-2);
                margin-top: var(--space-4);
                padding: var(--space-3);
                background: var(--color-bg-secondary);
                border-radius: var(--radius-md);
                font-size: var(--text-xs);
                color: var(--color-text-muted);
            }
            .sources-note .note-icon {
                flex-shrink: 0;
            }
            
            /* ===== Responsive ===== */
            @media (max-width: 768px) {
                /* Toolbar mobile */
                .jobs-toolbar {
                    flex-direction: column;
                    gap: var(--space-3);
                    padding: var(--space-3);
                    top: 0;
                }
                .jobs-toolbar-left {
                    width: 100%;
                }
                .jobs-toolbar .search-wrapper {
                    max-width: 100%;
                }
                .jobs-toolbar-right {
                    width: 100%;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: var(--space-2);
                }
                .jobs-toolbar .toolbar-stats {
                    display: none;
                }
                .jobs-toolbar .toolbar-divider {
                    display: none;
                }
                
                /* Quick nav mobile */
                .jobs-quick-nav {
                    top: 110px;
                    padding: var(--space-2);
                    margin: 0 calc(-1 * var(--space-4));
                    padding-left: var(--space-4);
                    padding-right: var(--space-4);
                }
                .quick-nav-pill {
                    padding: var(--space-2) var(--space-3);
                    font-size: var(--text-xs);
                }
                .quick-nav-pill span:first-child {
                    display: none;
                }
                
                /* Hero mobile */
                .jobs-hero {
                    padding: var(--space-8) var(--space-4);
                    margin-bottom: var(--space-4);
                }
                .jobs-hero-title {
                    font-size: 1.75rem;
                }
                .jobs-hero-subtitle {
                    font-size: var(--text-base);
                }
                .jobs-hero-cta {
                    flex-direction: column;
                    gap: var(--space-2);
                }
                .jobs-hero-cta .btn {
                    width: 100%;
                }
                
                /* Stats mobile */
                .market-stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-3);
                }
                .market-stat-card {
                    padding: var(--space-4);
                }
                .market-stat-value {
                    font-size: 1.5rem;
                }
                
                /* Roles grid mobile */
                .jobs-grid {
                    grid-template-columns: 1fr;
                    gap: var(--space-4);
                }
                .jobs-role-card::after {
                    display: none;
                }
                
                /* Hotspots mobile */
                .hotspots-grid {
                    grid-template-columns: 1fr;
                }
                
                /* Skills demand mobile */
                .skills-demand-grid {
                    flex-direction: column;
                }
                .skill-demand-card {
                    width: 100%;
                }
                
                /* Remote toggle mobile */
                .remote-toggle-container {
                    flex-direction: column;
                    gap: var(--space-3);
                    align-items: flex-start;
                }
                
                /* Section headers mobile */
                .section-header-row {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: var(--space-2);
                }
                .jobs-controls {
                    width: 100%;
                    justify-content: flex-start;
                }
                
                /* List view mobile */
                .list-item-metrics {
                    display: none;
                }
                
                /* Modal mobile */
                .salary-cards {
                    grid-template-columns: repeat(2, 1fr);
                }
                .modal-header-row {
                    flex-direction: column;
                    text-align: center;
                }
                .modal-badges {
                    justify-content: center;
                }
                .career-pathway {
                    flex-direction: column;
                    align-items: stretch;
                }
                .pathway-connector {
                    width: 2px;
                    height: 20px;
                    margin: 0 auto;
                }
                
                /* Career Pathway Mobile */
                .pathway-header {
                    flex-direction: column;
                    gap: var(--space-2);
                }
                .pathway-salary-pill {
                    align-self: flex-start;
                }
                .pathway-meta {
                    flex-direction: column;
                    gap: var(--space-1);
                }
                .pathway-marker {
                    width: 16px;
                }
                .marker-dot {
                    width: 12px;
                    height: 12px;
                }
                .modal-actions-bar {
                    flex-direction: column;
                }
                .action-btn {
                    width: 100%;
                    justify-content: center;
                }
                .section-header-with-toggle {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: var(--space-2);
                }
                .day-activities {
                    grid-template-columns: 1fr;
                }
                .sources-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                .interview-resources {
                    flex-direction: column;
                }
                .interview-link {
                    width: 100%;
                    justify-content: center;
                }
                
                /* Companies mobile */
                .companies-grid {
                    grid-template-columns: 1fr;
                }
                
                /* Certs mobile */
                .certs-grid {
                    grid-template-columns: 1fr;
                }
                
                /* Job boards mobile */
                .board-cards {
                    grid-template-columns: 1fr;
                }
            }
            
            /* Small mobile */
            @media (max-width: 480px) {
                .jobs-toolbar {
                    border-radius: 0;
                    margin: 0 calc(-1 * var(--space-4));
                    width: calc(100% + var(--space-8));
                }
                .quick-nav-scroll {
                    gap: var(--space-1);
                }
                .market-stats-grid {
                    grid-template-columns: 1fr 1fr;
                }
                .market-stat-icon {
                    font-size: 1.5rem;
                }
                .market-stat-value {
                    font-size: 1.25rem;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    /**
     * Set track filter
     */
    setTrack(track) {
        this.currentTrack = track;
        this.render();
    },
    
    /**
     * Set view mode
     */
    setView(view) {
        this.currentView = view;
        Storage.setViewMode('jobs', view);
        this.render();
    }
};

// Make available globally
window.JobsPage = JobsPage;
