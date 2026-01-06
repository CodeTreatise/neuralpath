/* ========================================
   NeuralPath - Resources Page
   Curated external learning resources - Tools page inspired design
   ======================================== */

const ResourcesPage = {
    resources: null,
    activeCategory: 'all',
    searchQuery: '',
    currentView: 'grid',
    
    /**
     * Render resources page
     */
    async render() {
        const main = document.getElementById('main');
        this.currentView = Storage.getViewMode('resources') || 'grid';
        
        // Load resources data
        try {
            const response = await fetch('data/resources.json');
            if (!response.ok) throw new Error('Failed to fetch');
            this.resources = await response.json();
        } catch (error) {
            console.error('Error loading resources:', error);
            main.innerHTML = Components.emptyState(
                '😕',
                'Failed to load resources',
                'Please try refreshing the page.'
            );
            return;
        }

        const totalResources = this.resources.categories.reduce((sum, cat) => sum + cat.items.length, 0);
        const filteredCount = this.getFilteredCount();
        
        main.innerHTML = `
            <!-- Tools-style toolbar -->
            <div class="tools-toolbar">
                <div class="tools-toolbar-left">
                    <div class="search-wrapper">
                        <span class="search-icon">🔍</span>
                        <input 
                            type="text" 
                            id="resource-search" 
                            class="search-input"
                            placeholder="Search ${totalResources} resources..."
                            value="${Helpers.escapeHtml(this.searchQuery)}"
                            oninput="ResourcesPage.handleSearch(this.value)"
                        >
                        ${this.searchQuery ? `<button class="search-clear" onclick="ResourcesPage.clearSearch()">✕</button>` : ''}
                    </div>
                </div>
                <div class="tools-toolbar-right">
                    <div class="toolbar-stats">
                        <span class="stat-badge">${filteredCount === totalResources ? `<strong>${totalResources}</strong> resources` : `<strong>${filteredCount}</strong> of ${totalResources}`}</span>
                    </div>
                    <div class="toolbar-divider"></div>
                    ${Components.viewToggle(this.currentView, 'ResourcesPage.setView', { views: ['grid', 'list'] })}
                </div>
            </div>
            
            <!-- Filter pills - horizontal scroll -->
            <div class="tools-filters">
                <div class="filter-section">
                    <div class="filter-scroll" id="category-filters">
                        ${this.renderCategoryPills()}
                    </div>
                </div>
                ${!this.searchQuery && this.resources?.quickLinks?.length ? `
                <div class="filter-section filter-section-secondary">
                    <span class="filter-section-label">⚡ Quick Links</span>
                    <div class="filter-group quick-links-inline">
                        ${this.renderQuickLinkPills()}
                    </div>
                </div>
                ` : ''}
                ${this.hasActiveFilters() ? `
                <div class="filter-section filter-section-active">
                    <button class="filter-clear" onclick="ResourcesPage.clearFilters()">
                        Clear filters
                    </button>
                </div>
                ` : ''}
            </div>
            
            <div id="resources-container" class="${this.currentView === 'grid' ? 'tools-grid' : 'tools-list'}">
                ${this.renderResourcesContent()}
            </div>
        `;
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.route === 'resources');
        });

        // Scroll active pill into view
        const activePill = document.querySelector('.filter-scroll .pill-active');
        if (activePill) {
            activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    },
    
    /**
     * Get filtered resources count
     */
    getFilteredCount() {
        if (!this.resources) return 0;
        
        let count = 0;
        this.resources.categories.forEach(cat => {
            if (this.activeCategory !== 'all' && cat.id !== this.activeCategory) return;
            
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                count += cat.items.filter(item => 
                    item.title.toLowerCase().includes(query) ||
                    (item.description && item.description.toLowerCase().includes(query)) ||
                    (item.author && item.author.toLowerCase().includes(query)) ||
                    (item.provider && item.provider.toLowerCase().includes(query)) ||
                    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
                ).length;
            } else {
                count += cat.items.length;
            }
        });
        return count;
    },
    
    /**
     * Check if filters are active
     */
    hasActiveFilters() {
        return this.activeCategory !== 'all' || this.searchQuery !== '';
    },
    
    /**
     * Clear all filters
     */
    clearFilters() {
        this.activeCategory = 'all';
        this.searchQuery = '';
        this.render();
    },
    
    /**
     * Set view mode
     */
    setView(view) {
        this.currentView = view;
        Storage.setViewMode('resources', view);
        this.render();
    },
    
    /**
     * Render category filter pills (Tools-style)
     */
    renderCategoryPills() {
        if (!this.resources) return '';
        
        const pills = this.resources.categories.map(cat => `
            <button 
                class="pill ${this.activeCategory === cat.id ? 'pill-active' : ''}" 
                data-category="${cat.id}"
                onclick="ResourcesPage.setCategory('${cat.id}')"
            >
                <span class="pill-icon">${cat.icon}</span>
                <span class="pill-label">${cat.title}</span>
            </button>
        `).join('');
        
        return `
            <button 
                class="pill ${this.activeCategory === 'all' ? 'pill-active' : ''}" 
                data-category="all"
                onclick="ResourcesPage.setCategory('all')"
            >
                <span class="pill-icon">✨</span>
                <span class="pill-label">All</span>
            </button>
            ${pills}
        `;
    },
    
    /**
     * Render quick links as pills
     */
    renderQuickLinkPills() {
        if (!this.resources?.quickLinks) return '';
        
        return this.resources.quickLinks.map(link => `
            <a href="${link.url}" target="_blank" rel="noopener" class="pill pill-link">
                <span class="pill-icon">${link.icon}</span>
                <span class="pill-label">${Helpers.escapeHtml(link.title)}</span>
            </a>
        `).join('');
    },
    
    /**
     * Render main resources content
     */
    renderResourcesContent() {
        if (!this.resources) return '';
        
        let categories = [...this.resources.categories];
        
        // Filter by category
        if (this.activeCategory !== 'all') {
            categories = categories.filter(cat => cat.id === this.activeCategory);
        }
        
        // Filter by search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            categories = categories.map(cat => ({
                ...cat,
                items: cat.items.filter(item => 
                    item.title.toLowerCase().includes(query) ||
                    (item.description && item.description.toLowerCase().includes(query)) ||
                    (item.author && item.author.toLowerCase().includes(query)) ||
                    (item.provider && item.provider.toLowerCase().includes(query)) ||
                    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
                )
            })).filter(cat => cat.items.length > 0);
        }
        
        if (categories.length === 0) {
            return Components.emptyState(
                '🔍',
                'No resources found',
                'Try adjusting your search or category filter.',
                `<button class="btn btn-primary" onclick="ResourcesPage.clearFilters()">Clear Filters</button>`
            );
        }
        
        // Flat render all items directly (Tools-style)
        const allItems = [];
        categories.forEach(category => {
            category.items.forEach(item => {
                allItems.push({ ...item, _categoryId: category.id, _categoryIcon: category.icon });
            });
        });
        
        if (this.currentView === 'grid') {
            return allItems.map(item => this.renderToolStyleCard(item)).join('');
        } else {
            return allItems.map(item => this.renderToolStyleListItem(item)).join('');
        }
    },
    
    /**
     * Render resource as tool-style card (grid view)
     */
    renderToolStyleCard(item) {
        const categoryId = item._categoryId;
        const icon = this.getItemIcon(item, categoryId);
        const badge = this.getItemBadge(item, categoryId);
        const meta = this.getItemMeta(item, categoryId);
        const tags = item.tags || [];
        const visibleTags = tags.slice(0, 3);
        const remainingCount = tags.length - visibleTags.length;
        
        return `
            <a href="${item.url}" target="_blank" rel="noopener" class="tool-card ${item.featured ? 'tool-card-featured' : ''}">
                <div class="tool-card-icon">${icon}</div>
                <div class="tool-card-content">
                    <div class="tool-card-title">${Helpers.escapeHtml(item.title)}</div>
                    <div class="tool-card-desc">${Helpers.escapeHtml(item.description || '')}</div>
                    <div class="tool-card-tags">
                        ${visibleTags.map(tag => 
                            `<span class="tool-tag">${tag}</span>`
                        ).join('')}
                        ${remainingCount > 0 ? `<span class="tool-tag tool-tag-more">+${remainingCount}</span>` : ''}
                    </div>
                </div>
                <div class="tool-card-actions">
                    ${badge}
                    ${meta}
                </div>
            </a>
        `;
    },
    
    /**
     * Render resource as tool-style list item
     */
    renderToolStyleListItem(item) {
        const categoryId = item._categoryId;
        const icon = this.getItemIcon(item, categoryId);
        const badge = this.getItemBadge(item, categoryId);
        
        return `
            <a href="${item.url}" target="_blank" rel="noopener" class="tool-card tool-card-list ${item.featured ? 'tool-card-featured' : ''}">
                <div class="tool-card-icon">${icon}</div>
                <div class="tool-card-content">
                    <div class="tool-card-header">
                        <span class="tool-card-title">${Helpers.escapeHtml(item.title)}</span>
                        ${badge}
                    </div>
                    <div class="tool-card-desc">${Helpers.escapeHtml((item.description || '').substring(0, 120))}</div>
                    <div class="tool-card-tags">
                        ${(item.tags || []).slice(0, 4).map(tag => 
                            `<span class="tool-tag">${tag}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="tool-card-actions">
                    <span class="action-btn action-btn-primary">Open ↗</span>
                </div>
            </a>
        `;
    },
    
    /**
     * Get icon for item based on category
     */
    getItemIcon(item, categoryId) {
        const icons = {
            'courses': '📚',
            'youtube': '▶️',
            'papers': '📄',
            'documentation': '📖',
            'practice': '💪',
            'books': '📕',
            'newsletters': '📧',
            'podcasts': '🎙️',
            'github-repos': '🐙',
            'ai-agents': '🤖',
            'ai-coding': '💻',
            'local-llm': '🏠',
            'llm-devtools': '🧰',
            'gen-ai-apps': '🎨',
            'api-providers': '🔌'
        };
        return icons[categoryId] || '📌';
    },
    
    /**
     * Get badge for item
     */
    getItemBadge(item, categoryId) {
        // Featured badge
        if (item.featured) {
            return '<span class="pricing-badge pricing-featured">⭐ Featured</span>';
        }
        
        // Free badge
        if (item.free === true) {
            return '<span class="pricing-badge pricing-free">Free</span>';
        }
        
        // Provider badge
        if (item.provider) {
            return `<span class="pricing-badge pricing-freemium">${Helpers.escapeHtml(item.provider)}</span>`;
        }
        
        // Level badge
        if (item.level) {
            const levelClasses = {
                'beginner': 'pricing-free',
                'intermediate': 'pricing-freemium',
                'advanced': 'pricing-paid'
            };
            return `<span class="pricing-badge ${levelClasses[item.level] || 'pricing-freemium'}">${this.capitalize(item.level)}</span>`;
        }
        
        // Year badge for papers
        if (item.year) {
            return `<span class="pricing-badge pricing-freemium">${item.year}</span>`;
        }
        
        return '';
    },
    
    /**
     * Get meta info for item
     */
    getItemMeta(item, categoryId) {
        const metas = [];
        
        if (item.duration) metas.push(`⏱️ ${item.duration}`);
        if (item.rating) metas.push(`⭐ ${item.rating}`);
        if (item.citations) metas.push(`📚 ${item.citations}`);
        if (item.subscribers) metas.push(`👥 ${item.subscribers}`);
        if (item.stars) metas.push(`⭐ ${item.stars}`);
        
        if (metas.length === 0) return '';
        
        return `<span class="tool-card-meta">${metas[0]}</span>`;
    },
    
    /**
     * Handle search input
     */
    handleSearch: Helpers.debounce(function(query) {
        ResourcesPage.searchQuery = query;
        ResourcesPage.render();
    }, 300),
    
    /**
     * Clear search
     */
    clearSearch() {
        this.searchQuery = '';
        this.render();
    },
    
    /**
     * Set active category
     */
    setCategory(category) {
        this.activeCategory = category;
        this.render();
    },
    
    /**
     * Update resources display
     */
    updateResourcesDisplay() {
        const container = document.getElementById('resources-container');
        if (container) {
            container.innerHTML = this.renderResourcesContent();
        }
        
        // Update stats
        const totalResources = this.resources?.categories.reduce((sum, cat) => sum + cat.items.length, 0) || 0;
        const filteredCount = this.getFilteredCount();
        const statBadge = document.querySelector('.stat-badge');
        if (statBadge) {
            statBadge.innerHTML = filteredCount === totalResources 
                ? `<strong>${totalResources}</strong> resources` 
                : `<strong>${filteredCount}</strong> of ${totalResources}`;
        }
    },
    
    /**
     * Capitalize first letter
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};
