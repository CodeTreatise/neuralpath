/* ========================================
   NeuralPath - Glossary Page
   AI/ML terminology with definitions
   ======================================== */

const GlossaryPage = {
    glossary: null,
    searchQuery: '',
    activeFilter: 'all',
    currentView: 'grid',
    expandedTerm: null,
    
    /**
     * Render glossary page
     */
    async render() {
        const main = document.getElementById('main');
        this.currentView = Storage.getViewMode('glossary') || 'grid';
        
        // Load glossary data
        try {
            const response = await fetch('data/glossary.json');
            if (!response.ok) throw new Error('Failed to fetch');
            this.glossary = await response.json();
        } catch (error) {
            console.error('Error loading glossary:', error);
            main.innerHTML = Components.emptyState(
                '📖',
                'Failed to load glossary',
                'Please try refreshing the page.'
            );
            return;
        }

        const totalTerms = this.glossary.terms.length;
        const filteredTerms = this.getFilteredTerms();
        const letterGroups = this.getLetterGroups();
        const meta = this.glossary.meta || {};
        
        main.innerHTML = `
            <!-- Compact Toolbar -->
            <div class="glossary-toolbar-header">
                <div class="glossary-toolbar-left">
                    <div class="glossary-title-group">
                        <span class="glossary-icon">📖</span>
                        <h1 class="glossary-title">${meta.title || 'AI Glossary'}</h1>
                        ${meta.lastUpdated ? `<span class="glossary-updated">Updated ${new Date(meta.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>` : ''}
                    </div>
                    <div class="search-wrapper">
                        <span class="search-icon">🔍</span>
                        <input 
                            type="text" 
                            id="glossary-search" 
                            class="search-input"
                            placeholder="Search ${totalTerms} terms..."
                            value="${Helpers.escapeHtml(this.searchQuery)}"
                            oninput="GlossaryPage.handleSearch(this.value)"
                        >
                        ${this.searchQuery ? `<button class="search-clear" onclick="GlossaryPage.clearSearch()">✕</button>` : ''}
                    </div>
                </div>
                <div class="glossary-toolbar-right">
                    <div class="toolbar-stats">
                        <span class="stat-badge">${filteredTerms.length === totalTerms ? `${totalTerms} terms` : `${filteredTerms.length}/${totalTerms}`}</span>
                    </div>
                    <div class="toolbar-divider"></div>
                    <div class="view-toggle">
                        <button class="view-btn ${this.currentView === 'grid' ? 'active' : ''}" onclick="GlossaryPage.setView('grid')" title="Grid view">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7" rx="1"/>
                                <rect x="14" y="3" width="7" height="7" rx="1"/>
                                <rect x="3" y="14" width="7" height="7" rx="1"/>
                                <rect x="14" y="14" width="7" height="7" rx="1"/>
                            </svg>
                        </button>
                        <button class="view-btn ${this.currentView === 'list' ? 'active' : ''}" onclick="GlossaryPage.setView('list')" title="List view">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="8" y1="6" x2="21" y2="6"/>
                                <line x1="8" y1="12" x2="21" y2="12"/>
                                <line x1="8" y1="18" x2="21" y2="18"/>
                                <circle cx="4" cy="6" r="1" fill="currentColor"/>
                                <circle cx="4" cy="12" r="1" fill="currentColor"/>
                                <circle cx="4" cy="18" r="1" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Alphabet Navigation -->
            <div class="glossary-alphabet-nav">
                <div class="alphabet-scroll">
                    ${this.renderAlphabetNav(letterGroups)}
                </div>
                ${this.activeFilter !== 'all' || this.searchQuery ? 
                    `<button class="filter-clear" onclick="GlossaryPage.clearFilters()">Clear</button>` : ''
                }
            </div>
            
            <!-- Terms Container -->
            <div id="glossary-container" class="glossary-${this.currentView}">
                ${this.renderTerms(filteredTerms)}
            </div>
        `;
        
        // Focus search if empty
        if (!this.searchQuery) {
            document.getElementById('glossary-search')?.focus();
        }
    },
    
    /**
     * Get unique letter groups
     */
    getLetterGroups() {
        const letters = new Set();
        this.glossary.terms.forEach(t => {
            const first = t.term.charAt(0).toUpperCase();
            letters.add(/[A-Z]/.test(first) ? first : '#');
        });
        return ['all', ...Array.from(letters).sort()];
    },
    
    /**
     * Render alphabet navigation
     */
    renderAlphabetNav(letters) {
        return letters.map(letter => {
            const isActive = this.activeFilter === letter;
            const label = letter === 'all' ? 'All' : letter;
            const count = letter === 'all' 
                ? this.glossary.terms.length 
                : this.glossary.terms.filter(t => {
                    const first = t.term.charAt(0).toUpperCase();
                    return letter === '#' ? !/[A-Z]/.test(first) : first === letter;
                }).length;
            
            const hasTerms = count > 0;
            
            return `
                <button 
                    class="alphabet-btn ${isActive ? 'active' : ''} ${!hasTerms && letter !== 'all' ? 'disabled' : ''}"
                    onclick="GlossaryPage.setFilter('${letter}')"
                    ${!hasTerms && letter !== 'all' ? 'disabled' : ''}
                    title="${count} terms"
                >
                    ${label}
                </button>
            `;
        }).join('');
    },
    
    /**
     * Get filtered terms
     */
    getFilteredTerms() {
        let terms = this.glossary.terms;
        
        // Apply letter filter
        if (this.activeFilter !== 'all') {
            terms = terms.filter(t => {
                const first = t.term.charAt(0).toUpperCase();
                if (this.activeFilter === '#') {
                    return !/[A-Z]/.test(first);
                }
                return first === this.activeFilter;
            });
        }
        
        // Apply search
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            terms = terms.filter(t => 
                t.term.toLowerCase().includes(q) || 
                t.definition.toLowerCase().includes(q)
            );
        }
        
        return terms;
    },
    
    /**
     * Render terms
     */
    renderTerms(terms) {
        if (terms.length === 0) {
            return `
                <div class="glossary-empty">
                    <div class="glossary-empty-icon">🔍</div>
                    <h3>No terms found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
        }
        
        if (this.currentView === 'grid') {
            // Group by first letter for grid view
            const grouped = {};
            terms.forEach(term => {
                const first = term.term.charAt(0).toUpperCase();
                const key = /[A-Z]/.test(first) ? first : '#';
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(term);
            });
            
            let html = '';
            Object.keys(grouped).sort().forEach(letter => {
                html += `
                    <div class="glossary-section" id="letter-${letter}">
                        <div class="glossary-section-header">
                            <span class="glossary-section-letter">${letter}</span>
                            <span class="glossary-section-count">${grouped[letter].length} terms</span>
                        </div>
                        <div class="glossary-cards">
                            ${grouped[letter].map(term => this.renderTermCard(term)).join('')}
                        </div>
                    </div>
                `;
            });
            return html;
        } else {
            return `<div class="glossary-list-wrapper">${terms.map(term => this.renderTermListItem(term)).join('')}</div>`;
        }
    },
    
    /**
     * Render term card (grid view)
     */
    renderTermCard(term) {
        const isExpanded = this.expandedTerm === term.term;
        const firstLetter = term.term.charAt(0).toUpperCase();
        
        return `
            <div class="glossary-card ${isExpanded ? 'expanded' : ''}" onclick="GlossaryPage.toggleTerm('${Helpers.escapeHtml(term.term)}')">
                <div class="glossary-card-front">
                    <div class="glossary-card-letter">${firstLetter}</div>
                    <h3 class="glossary-card-term">${Helpers.escapeHtml(term.term)}</h3>
                    <p class="glossary-card-preview">${Helpers.escapeHtml(term.definition.substring(0, 60))}${term.definition.length > 60 ? '...' : ''}</p>
                    <span class="glossary-card-expand">Click to expand</span>
                </div>
                <div class="glossary-card-back">
                    <h3 class="glossary-card-term-full">${Helpers.escapeHtml(term.term)}</h3>
                    <p class="glossary-card-definition">${Helpers.escapeHtml(term.definition)}</p>
                    ${term.url ? `<a href="${term.url}" target="_blank" rel="noopener" class="glossary-card-link" onclick="event.stopPropagation()">Learn more →</a>` : ''}
                </div>
            </div>
        `;
    },
    
    /**
     * Render term list item
     */
    renderTermListItem(term) {
        const isExpanded = this.expandedTerm === term.term;
        
        return `
            <div class="glossary-list-item ${isExpanded ? 'expanded' : ''}" onclick="GlossaryPage.toggleTerm('${Helpers.escapeHtml(term.term)}')">
                <div class="glossary-list-header">
                    <span class="glossary-list-letter">${term.term.charAt(0).toUpperCase()}</span>
                    <span class="glossary-list-term">${Helpers.escapeHtml(term.term)}</span>
                    <span class="glossary-list-toggle">${isExpanded ? '−' : '+'}</span>
                </div>
                <div class="glossary-list-content ${isExpanded ? 'show' : ''}">
                    <p class="glossary-list-definition">${Helpers.escapeHtml(term.definition)}</p>
                    ${term.url ? `<a href="${term.url}" target="_blank" rel="noopener" class="glossary-list-link" onclick="event.stopPropagation()">Learn more →</a>` : ''}
                </div>
            </div>
        `;
    },
    
    /**
     * Toggle term expansion
     */
    toggleTerm(termName) {
        this.expandedTerm = this.expandedTerm === termName ? null : termName;
        this.updateResults();
    },
    
    /**
     * Handle search input
     */
    handleSearch(query) {
        this.searchQuery = query;
        this.updateResults();
    },
    
    /**
     * Clear search
     */
    clearSearch() {
        this.searchQuery = '';
        document.getElementById('glossary-search').value = '';
        this.updateResults();
    },
    
    /**
     * Set letter filter
     */
    setFilter(letter) {
        this.activeFilter = letter;
        this.expandedTerm = null;
        this.render();
    },
    
    /**
     * Clear filters
     */
    clearFilters() {
        this.activeFilter = 'all';
        this.searchQuery = '';
        this.expandedTerm = null;
        this.render();
    },
    
    /**
     * Set view mode
     */
    setView(view) {
        this.currentView = view;
        this.expandedTerm = null;
        Storage.setViewMode('glossary', view);
        this.render();
    },
    
    /**
     * Update results without full re-render
     */
    updateResults() {
        const container = document.getElementById('glossary-container');
        if (container) {
            const filteredTerms = this.getFilteredTerms();
            container.innerHTML = this.renderTerms(filteredTerms);
            container.className = `glossary-${this.currentView}`;
            
            // Update stats
            const stats = document.querySelector('.glossary-stats');
            if (stats) {
                const total = this.glossary.terms.length;
                stats.innerHTML = filteredTerms.length === total 
                    ? `<span class="glossary-stat-text">Showing all <strong>${total}</strong> terms</span>`
                    : `<span class="glossary-stat-text">Found <strong>${filteredTerms.length}</strong> of ${total} terms</span>` +
                      (this.activeFilter !== 'all' || this.searchQuery ? 
                        `<button class="glossary-clear-btn" onclick="GlossaryPage.clearFilters()">Clear filters</button>` : ''
                      );
            }
        }
    }
};

// Make available globally
window.GlossaryPage = GlossaryPage;
