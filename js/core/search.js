/* ========================================
   NeuralPath - Search Module
   Enhanced with category filtering
   ======================================== */

const Search = {
    modal: null,
    input: null,
    results: null,
    categoriesContainer: null,
    selectedIndex: -1,
    currentResults: [],
    filteredResults: [],
    currentCategory: 'all',
    categories: ['all', 'course', 'tool', 'graph', 'job'],
    
    /**
     * Initialize search
     */
    init() {
        this.modal = document.getElementById('search-modal');
        this.input = document.getElementById('search-input');
        this.results = document.getElementById('search-results');
        this.categoriesContainer = document.getElementById('search-categories');
        
        // Bind events
        this.bindEvents();
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search trigger button
        const trigger = document.getElementById('search-trigger');
        trigger?.addEventListener('click', () => this.open());
        
        // Keyboard shortcut (Cmd/Ctrl + K)
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
            }
            
            // Close on Escape
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
        
        // Click outside to close
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Search input
        this.input?.addEventListener('input', Helpers.debounce((e) => {
            this.performSearch(e.target.value);
        }, 150));
        
        // Keyboard navigation
        this.input?.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectNext();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectPrev();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.openSelected();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.prevCategory();
                } else {
                    this.nextCategory();
                }
            }
        });
        
        // Category button clicks
        this.categoriesContainer?.querySelectorAll('.search-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setCategory(btn.dataset.category);
                this.input?.focus();
            });
        });
    },
    
    /**
     * Open search modal
     */
    open() {
        this.modal?.classList.add('active');
        this.input.value = '';
        this.selectedIndex = -1;
        this.currentCategory = 'all';
        this.updateCategoryUI();
        this.renderEmpty();
        document.body.style.overflow = 'hidden';
        // Focus after modal transition completes
        setTimeout(() => {
            this.input?.focus();
        }, 50);
    },
    
    /**
     * Close search modal
     */
    close() {
        this.modal?.classList.remove('active');
        this.input.value = '';
        this.selectedIndex = -1;
        this.currentCategory = 'all';
        document.body.style.overflow = '';
    },
    
    /**
     * Check if modal is open
     */
    isOpen() {
        return this.modal?.classList.contains('active');
    },
    
    /**
     * Set category filter
     */
    setCategory(category) {
        this.currentCategory = category;
        this.updateCategoryUI();
        this.applyFilter();
    },
    
    /**
     * Next category (Tab)
     */
    nextCategory() {
        const currentIdx = this.categories.indexOf(this.currentCategory);
        const nextIdx = (currentIdx + 1) % this.categories.length;
        this.setCategory(this.categories[nextIdx]);
    },
    
    /**
     * Previous category (Shift+Tab)
     */
    prevCategory() {
        const currentIdx = this.categories.indexOf(this.currentCategory);
        const prevIdx = currentIdx <= 0 ? this.categories.length - 1 : currentIdx - 1;
        this.setCategory(this.categories[prevIdx]);
    },
    
    /**
     * Update category button UI
     */
    updateCategoryUI() {
        // Count results per category
        const counts = { all: this.currentResults.length };
        this.currentResults.forEach(item => {
            counts[item.type] = (counts[item.type] || 0) + 1;
        });
        
        this.categoriesContainer?.querySelectorAll('.search-cat-btn').forEach(btn => {
            const cat = btn.dataset.category;
            const isActive = cat === this.currentCategory;
            btn.classList.toggle('active', isActive);
            
            // Update count badge
            const count = counts[cat] || 0;
            let countEl = btn.querySelector('.cat-count');
            
            if (count > 0 && this.currentResults.length > 0) {
                if (!countEl) {
                    countEl = document.createElement('span');
                    countEl.className = 'cat-count';
                    btn.appendChild(countEl);
                }
                countEl.textContent = count;
            } else if (countEl) {
                countEl.remove();
            }
        });
    },
    
    /**
     * Apply category filter to current results
     */
    applyFilter() {
        if (this.currentCategory === 'all') {
            this.filteredResults = [...this.currentResults];
        } else {
            this.filteredResults = this.currentResults.filter(item => item.type === this.currentCategory);
        }
        this.selectedIndex = this.filteredResults.length > 0 ? 0 : -1;
        this.renderResults();
    },
    
    /**
     * Perform search
     */
    performSearch(query) {
        if (!query || query.length < 2) {
            this.currentResults = [];
            this.filteredResults = [];
            this.updateCategoryUI();
            this.renderEmpty();
            return;
        }
        
        this.currentResults = State.search(query);
        this.updateCategoryUI();
        this.applyFilter();
    },

    /**
     * Render empty state
     */
    renderEmpty() {
        const categoryLabels = {
            all: 'all content',
            course: 'courses',
            tool: 'tools',
            graph: 'explorations',
            job: 'jobs'
        };
        const categoryIcons = {
            all: '🔍',
            course: '📚',
            tool: '🔧',
            graph: '🗺️',
            job: '💼'
        };
        const searchIn = categoryLabels[this.currentCategory] || 'all content';
        const icon = categoryIcons[this.currentCategory] || '🔍';
        
        this.results.innerHTML = `
            <div class="search-empty">
                <div class="search-empty-icon">${icon}</div>
                <p>Search ${searchIn}</p>
                <div class="search-hints">
                    <span class="hint"><kbd>Tab</kbd> Switch category</span>
                    <span class="hint"><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                    <span class="hint"><kbd>↵</kbd> Open</span>
                    <span class="hint"><kbd>Esc</kbd> Close</span>
                </div>
            </div>
        `;
    },
    
    /**
     * Render search results
     */
    renderResults() {
        if (this.filteredResults.length === 0) {
            const categoryLabels = {
                all: '',
                course: ' in Courses',
                tool: ' in Tools',
                graph: ' in Explore',
                job: ' in Jobs'
            };
            this.results.innerHTML = `
                <div class="search-empty">
                    <div class="search-empty-icon">🔎</div>
                    <p>No results found${categoryLabels[this.currentCategory] || ''}</p>
                    ${this.currentCategory !== 'all' && this.currentResults.length > 0 ? 
                        `<p class="search-hint-alt">💡 ${this.currentResults.length} results in other categories — press Tab to switch</p>` : ''}
                </div>
            `;
            return;
        }
        
        // Group by type
        const grouped = Helpers.groupBy(this.filteredResults, 'type');
        const typeLabels = {
            course: 'Courses',
            tool: 'Tools',
            graph: 'Explore',
            job: 'Jobs'
        };
        const typeIcons = {
            course: '📚',
            tool: '🔧',
            graph: '🗺️',
            job: '💼'
        };
        
        let html = '';
        let globalIndex = 0;
        
        for (const [type, items] of Object.entries(grouped)) {
            html += `<div class="search-group-title">${typeIcons[type] || ''} ${typeLabels[type] || type} <span style="opacity:0.5; margin-left:auto;">${items.length}</span></div>`;
            
            items.forEach(item => {
                const isSelected = globalIndex === this.selectedIndex;
                const isExternal = !item.url.startsWith('#');
                html += `
                    <div class="search-result-item ${isSelected ? 'selected' : ''}" 
                         data-index="${globalIndex}"
                         data-url="${item.url}">
                        <span class="search-result-icon">${item.icon}</span>
                        <div class="search-result-content">
                            <div class="search-result-title">${Helpers.escapeHtml(item.title)}</div>
                            <div class="search-result-category">${Helpers.escapeHtml(item.category || item.description || '')}</div>
                        </div>
                        <span class="search-result-arrow">${isExternal ? '↗' : '→'}</span>
                    </div>
                `;
                globalIndex++;
            });
        }
        
        this.results.innerHTML = html;
        
        // Bind click events
        this.results.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                if (url.startsWith('#')) {
                    Router.navigate(url);
                } else {
                    window.open(url, '_blank');
                }
                this.close();
            });
            
            item.addEventListener('mouseenter', () => {
                this.selectedIndex = parseInt(item.dataset.index);
                this.updateSelected();
            });
        });
    },
    
    /**
     * Select next result
     */
    selectNext() {
        if (this.filteredResults.length === 0) return;
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredResults.length;
        this.updateSelected();
    },
    
    /**
     * Select previous result
     */
    selectPrev() {
        if (this.filteredResults.length === 0) return;
        this.selectedIndex = this.selectedIndex <= 0 
            ? this.filteredResults.length - 1 
            : this.selectedIndex - 1;
        this.updateSelected();
    },
    
    /**
     * Update selected state
     */
    updateSelected() {
        this.results.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedIndex);
            if (index === this.selectedIndex) {
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    },
    
    /**
     * Open selected result
     */
    openSelected() {
        if (this.selectedIndex >= 0 && this.filteredResults[this.selectedIndex]) {
            const item = this.filteredResults[this.selectedIndex];
            if (item.url.startsWith('#')) {
                Router.navigate(item.url);
            } else {
                window.open(item.url, '_blank');
            }
            this.close();
        }
    }
};
