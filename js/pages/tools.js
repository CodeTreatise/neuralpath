/* ========================================
   NeuralPath - Tools Page
   ======================================== */

const ToolsPage = {
    currentView: 'grid',
    currentCategory: 'all',
    currentPricing: 'all',
    currentTag: '',
    currentSort: 'name',
    searchQuery: '',
    
    /**
     * Render tools index page
     */
    async render() {
        const main = document.getElementById('main');
        this.currentView = Storage.getViewMode('tools') || 'grid';
        
        const tools = State.data.tools;
        const categories = this.getCategories(tools);
        
        main.innerHTML = `
            <!-- Linear/Raycast inspired header -->
            <div class="tools-toolbar">
                <div class="tools-toolbar-left">
                    <div class="search-wrapper">
                        <span class="search-icon">⌘</span>
                        <input 
                            type="text" 
                            id="tools-search" 
                            class="search-input" 
                            placeholder="Search ${State.data.tools?.length || 0} tools..." 
                            value="${Helpers.escapeHtml(this.searchQuery)}"
                            oninput="ToolsPage.handleSearch(this.value)"
                        />
                        ${this.searchQuery ? `<button class="search-clear" onclick="ToolsPage.clearSearch()">✕</button>` : ''}
                    </div>
                </div>
                <div class="tools-toolbar-right">
                    <div class="toolbar-stats">
                        <span class="stat-badge">${this.renderResultsCount()}</span>
                    </div>
                    <div class="toolbar-divider"></div>
                    ${Components.viewToggle(this.currentView, 'ToolsPage.setView', { views: ['grid', 'list'] })}
                </div>
            </div>
            
            <!-- Filter pills - horizontal scroll on mobile -->
            <div class="tools-filters">
                <div class="filter-section">
                    <div class="filter-scroll" id="category-filters">
                        ${this.renderCategoryTabs(categories)}
                    </div>
                </div>
                <div class="filter-section filter-section-secondary">
                    <div class="filter-group" id="pricing-filters">
                        ${this.renderPricingFilters()}
                    </div>
                    ${this.currentTag ? `
                        <span class="active-filter" onclick="ToolsPage.clearTag()">
                            <span class="active-filter-label">Tag:</span> ${Helpers.escapeHtml(this.currentTag)}
                            <span class="active-filter-remove">✕</span>
                        </span>
                    ` : ''}
                    ${this.hasActiveFilters() ? `
                        <button class="filter-clear" onclick="ToolsPage.clearFilters()">
                            Clear filters
                        </button>
                    ` : ''}
                </div>
            </div>
            
            <div id="tools-container" class="${this.currentView === 'grid' ? 'tools-grid' : 'tools-list'}">
                ${this.renderTools()}
            </div>
        `;
    },
    
    /**
     * Get unique categories from tools
     */
    getCategories(tools) {
        const cats = new Set(['all']);
        tools.forEach(tool => {
            if (tool.category) cats.add(tool.category);
        });
        return Array.from(cats);
    },
    
    /**
     * Check if any filters are active
     */
    hasActiveFilters() {
        return this.currentCategory !== 'all' || 
               this.currentPricing !== 'all' || 
               this.currentTag !== '' || 
               this.searchQuery !== '';
    },
    
    /**
     * Render results count
     */
    renderResultsCount() {
        const filtered = this.getFilteredTools();
        const total = State.data.tools?.length || 0;
        if (filtered.length === total) {
            return `<strong>${total}</strong> tools`;
        }
        return `<strong>${filtered.length}</strong> of ${total}`;
    },
    
    /**
     * Clear search
     */
    clearSearch() {
        this.searchQuery = '';
        this.render();
    },
    
    /**
     * Render pricing filter chips
     */
    renderPricingFilters() {
        const pricings = ['all', 'free', 'freemium', 'paid'];
        const labels = { all: 'All', free: 'Free', freemium: 'Freemium', paid: 'Paid' };
        
        return pricings.map(p => `
            <button 
                class="pill ${this.currentPricing === p ? 'pill-active' : ''}"
                data-pricing="${p}"
                onclick="ToolsPage.setPricing('${p}')"
            >
                ${labels[p]}
            </button>
        `).join('');
    },
    
    /**
     * Render category tabs
     */
    renderCategoryTabs(categories) {
        const icons = {
            'all': '✨',
            'chatbots': '💬',
            'image-gen': '🎨',
            'video-gen': '🎬',
            'audio-music': '🎵',
            'code-dev': '💻',
            'writing': '✍️',
            'productivity': '⚡',
            'research': '🔬',
            'dev-platforms': '🔧',
            'local-opensource': '🏠',
            'search': '🔍',
            'agents': '🤖',
            'marketing': '📈',
            'data': '📊',
            'design': '🎭',
            '3d-spatial': '🎮',
            'transcription': '📝',
            'enterprise': '💼',
            'education': '🎓',
            'healthcare': '🏥'
        };
        
        const labels = {
            'all': 'All',
            'chatbots': 'Assistants',
            'image-gen': 'Image',
            'video-gen': 'Video',
            'audio-music': 'Audio',
            'code-dev': 'Code',
            'writing': 'Writing',
            'productivity': 'Productivity',
            'research': 'Research',
            'dev-platforms': 'APIs',
            'local-opensource': 'Local',
            'search': 'Search',
            'agents': 'Agents',
            'marketing': 'Marketing',
            'data': 'Data',
            'design': 'Design',
            '3d-spatial': '3D',
            'transcription': 'Transcription',
            'enterprise': 'Enterprise',
            'education': 'Education',
            'healthcare': 'Health'
        };
        
        return categories.map(cat => `
            <button 
                class="pill ${this.currentCategory === cat ? 'pill-active' : ''}"
                data-category="${cat}"
                onclick="ToolsPage.setCategory('${cat}')"
            >
                <span class="pill-icon">${icons[cat] || '📦'}</span>
                <span class="pill-label">${labels[cat] || cat}</span>
            </button>
        `).join('');
    },
    
    /**
     * Get filtered tools based on all current filters
     */
    getFilteredTools() {
        let tools = [...(State.data.tools || [])];
        
        // Apply category filter
        if (this.currentCategory !== 'all') {
            tools = tools.filter(t => t.category === this.currentCategory);
        }
        
        // Apply pricing filter
        if (this.currentPricing !== 'all') {
            tools = tools.filter(t => (t.pricing || 'free').toLowerCase() === this.currentPricing);
        }
        
        // Apply tag filter
        if (this.currentTag) {
            tools = tools.filter(t => t.tags?.some(tag => tag.toLowerCase() === this.currentTag.toLowerCase()));
        }
        
        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            tools = tools.filter(t => 
                t.name?.toLowerCase().includes(query) ||
                t.description?.toLowerCase().includes(query) ||
                t.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }
        
        // Apply sort
        tools.sort((a, b) => {
            switch(this.currentSort) {
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'name-desc':
                    return (b.name || '').localeCompare(a.name || '');
                case 'category':
                    return (a.category || '').localeCompare(b.category || '');
                default:
                    return 0;
            }
        });
        
        return tools;
    },
    
    /**
     * Render tools list
     */
    renderTools() {
        const tools = this.getFilteredTools();
        
        if (tools.length === 0) {
            return Components.emptyState(
                '🔍',
                'No tools found',
                this.hasActiveFilters() ? 'Try adjusting your filters' : 'No tools available yet',
                `<button class="btn btn-primary" onclick="ToolsPage.clearFilters()">Clear Filters</button>`
            );
        }
        
        if (this.currentView === 'grid') {
            return tools.map(tool => this.renderToolCard(tool)).join('');
        } else {
            return tools.map(tool => this.renderToolListItem(tool)).join('');
        }
    },
    
    /**
     * Render tool card (grid view) with tags
     */
    renderToolCard(tool) {
        const pricingClass = {
            'free': 'pricing-free',
            'freemium': 'pricing-freemium', 
            'paid': 'pricing-paid'
        }[(tool.pricing || 'free').toLowerCase()] || 'pricing-free';
        
        return `
            <a href="${tool.url}" target="_blank" rel="noopener" class="tool-card">
                <div class="tool-card-icon">${tool.icon || '🔧'}</div>
                <div class="tool-card-content">
                    <div class="tool-card-title">${Helpers.escapeHtml(tool.name)}</div>
                    <div class="tool-card-desc">${Helpers.escapeHtml(tool.description || '')}</div>
                    <div class="tool-card-tags">
                        ${(tool.tags || []).slice(0, 3).map(tag => 
                            `<span class="tool-tag" onclick="event.preventDefault(); event.stopPropagation(); ToolsPage.filterByTag('${Helpers.escapeHtml(tag)}')">${tag}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="tool-card-actions">
                    <span class="pricing-badge ${pricingClass}">${tool.pricing || 'Free'}</span>
                </div>
            </a>
        `;
    },
    
    /**
     * Render tool as list item
     */
    renderToolListItem(tool) {
        const isBookmarked = Storage.isBookmarked(`tool-${tool.id}`);
        const pricingClass = {
            'free': 'pricing-free',
            'freemium': 'pricing-freemium', 
            'paid': 'pricing-paid'
        }[(tool.pricing || 'free').toLowerCase()] || 'pricing-free';
        
        return `
            <div class="tool-card tool-card-list">
                <div class="tool-card-icon">${tool.icon || '🤖'}</div>
                <div class="tool-card-content">
                    <div class="tool-card-header">
                        <span class="tool-card-title">${Helpers.escapeHtml(tool.name)}</span>
                        <span class="pricing-badge ${pricingClass}">${tool.pricing || 'Free'}</span>
                    </div>
                    <div class="tool-card-desc">${Helpers.escapeHtml(tool.description?.substring(0, 120) || '')}</div>
                    <div class="tool-card-tags">
                        ${(tool.tags || []).slice(0, 4).map(tag => 
                            `<span class="tool-tag" onclick="ToolsPage.filterByTag('${Helpers.escapeHtml(tag)}')">${tag}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="tool-card-actions">
                    <button 
                        class="action-btn"
                        onclick="ToolsPage.toggleBookmark(${JSON.stringify(tool).replace(/"/g, '&quot;')})"
                        title="${isBookmarked ? 'Remove bookmark' : 'Bookmark'}"
                    >
                        ${isBookmarked ? '★' : '☆'}
                    </button>
                    <a href="${tool.url}" target="_blank" class="action-btn action-btn-primary">
                        Open ↗
                    </a>
                </div>
            </div>
        `;
    },
    
    /**
     * Handle search input
     */
    handleSearch: Helpers.debounce(function(query) {
        ToolsPage.searchQuery = query;
        ToolsPage.updateToolsDisplay();
    }, 300),
    
    /**
     * Update tools display and result count
     */
    updateToolsDisplay() {
        const container = document.getElementById('tools-container');
        const countEl = document.querySelector('.stat-badge');
        if (container) {
            container.innerHTML = this.renderTools();
        }
        if (countEl) {
            countEl.innerHTML = this.renderResultsCount();
        }
    },
    
    /**
     * Set view mode
     */
    setView(view) {
        this.currentView = view;
        Storage.setViewMode('tools', view);
        this.render();
    },
    
    /**
     * Set sort order
     */
    setSort(sort) {
        this.currentSort = sort;
        this.updateToolsDisplay();
    },
    
    /**
     * Set category filter
     */
    setCategory(category) {
        this.currentCategory = category;
        this.updateToolsDisplay();
        // Update button states using data attributes
        document.querySelectorAll('#category-filters .pill').forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('pill-active');
            } else {
                btn.classList.remove('pill-active');
            }
        });
    },
    
    /**
     * Set pricing filter
     */
    setPricing(pricing) {
        this.currentPricing = pricing;
        this.updateToolsDisplay();
        // Update button states using data attributes
        document.querySelectorAll('#pricing-filters .pill').forEach(btn => {
            if (btn.dataset.pricing === pricing) {
                btn.classList.add('pill-active');
            } else {
                btn.classList.remove('pill-active');
            }
        });
    },
    
    /**
     * Filter by tag (clicking on a tag)
     */
    filterByTag(tag) {
        this.currentTag = tag;
        this.render(); // Full re-render to show tag badge
    },
    
    /**
     * Clear tag filter
     */
    clearTag() {
        this.currentTag = '';
        this.render();
    },
    
    /**
     * Clear all filters
     */
    clearFilters() {
        this.searchQuery = '';
        this.currentCategory = 'all';
        this.currentPricing = 'all';
        this.currentTag = '';
        this.currentSort = 'name';
        this.render();
    },
    
    /**
     * Toggle tool bookmark
     */
    toggleBookmark(tool) {
        const id = `tool-${tool.id}`;
        const isBookmarked = Storage.isBookmarked(id);
        
        if (isBookmarked) {
            Storage.removeBookmark(id);
            Components.toast('Bookmark removed', 'info');
        } else {
            Storage.addBookmark({
                id: id,
                type: 'tool',
                title: tool.name,
                icon: tool.icon || '🛠️',
                url: tool.url
            });
            Components.toast('Tool bookmarked! ⭐', 'success');
        }
        
        // Re-render tools
        const container = document.getElementById('tools-container');
        if (container) {
            container.innerHTML = this.renderTools();
        }
    },
    
    /**
     * Render single tool detail (if needed in future)
     */
    async renderTool(toolId) {
        const main = document.getElementById('main');
        const tool = State.data.tools.find(t => t.id === toolId);
        
        if (!tool) {
            main.innerHTML = Components.emptyState(
                '🔍',
                'Tool not found',
                'The requested tool could not be found.',
                '<a href="#/tools" class="btn btn-primary">Browse Tools</a>'
            );
            return;
        }
        
        // Track as recent
        Storage.addRecent({
            id: `tool-${toolId}`,
            type: 'tool',
            title: tool.name,
            icon: tool.icon || '🛠️',
            url: tool.url
        });
        
        const isBookmarked = Storage.isBookmarked(`tool-${tool.id}`);
        
        main.innerHTML = `
            <div style="margin-bottom: var(--space-4);">
                <a href="#/tools" class="btn btn-ghost btn-sm">← Back to Tools</a>
            </div>
            
            <div class="card" style="max-width: 800px; margin: 0 auto;">
                <header style="display: flex; gap: var(--space-6); align-items: flex-start; flex-wrap: wrap; margin-bottom: var(--space-6);">
                    <div style="font-size: 4rem;">${tool.icon || '🤖'}</div>
                    <div style="flex: 1; min-width: 200px;">
                        <div style="display: flex; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-2);">
                            <span class="tag tag-primary">${tool.category || 'ai'}</span>
                            ${tool.pricing ? `<span class="tag">${tool.pricing}</span>` : ''}
                        </div>
                        <h1>${Helpers.escapeHtml(tool.name)}</h1>
                        <p class="text-secondary" style="margin-top: var(--space-2);">
                            ${Helpers.escapeHtml(tool.description || '')}
                        </p>
                    </div>
                </header>
                
                ${tool.features?.length ? `
                    <div style="margin-bottom: var(--space-6);">
                        <h3 style="margin-bottom: var(--space-3);">✨ Features</h3>
                        <ul style="list-style: none; padding: 0;">
                            ${tool.features.map(f => `
                                <li style="padding: var(--space-2) 0; display: flex; gap: var(--space-2);">
                                    <span>•</span>
                                    <span>${Helpers.escapeHtml(f)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${tool.tags?.length ? `
                    <div style="margin-bottom: var(--space-6);">
                        <h3 style="margin-bottom: var(--space-3);">🏷️ Tags</h3>
                        <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
                            ${tool.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <footer style="display: flex; gap: var(--space-3); padding-top: var(--space-4); border-top: 1px solid var(--color-border);">
                    <a href="${tool.url}" target="_blank" class="btn btn-primary">
                        Visit ${tool.name} →
                    </a>
                    <button 
                        class="btn ${isBookmarked ? 'btn-secondary' : 'btn-ghost'}"
                        onclick="ToolsPage.toggleBookmark(${JSON.stringify(tool).replace(/"/g, '&quot;')})"
                    >
                        ${isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                    </button>
                </footer>
            </div>
        `;
    }
};

// Make available globally
window.ToolsPage = ToolsPage;
