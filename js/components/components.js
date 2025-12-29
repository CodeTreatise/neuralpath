/* ========================================
   NeuralPath - UI Components
   ======================================== */

const Components = {
    /**
     * Toast notification
     */
    toast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const id = Helpers.generateId();
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.id = `toast-${id}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${Helpers.escapeHtml(message)}</span>
            <button class="toast-close" onclick="Components.closeToast('${id}')">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => this.closeToast(id), duration);
        
        return id;
    },
    
    /**
     * Close toast
     */
    closeToast(id) {
        const toast = document.getElementById(`toast-${id}`);
        if (toast) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    },
    
    /**
     * View toggle component
     */
    viewToggle(currentView, onViewChange, options = {}) {
        const views = options.views || ['grid', 'list', 'graph'];
        const icons = { grid: '🔲', list: '📋', graph: '🕸️' };
        const labels = { grid: 'Grid', list: 'List', graph: 'Graph' };
        
        return `
            <div class="view-toggle">
                ${views.map(view => `
                    <button 
                        class="view-toggle-btn ${view === currentView ? 'active' : ''}"
                        data-view="${view}"
                        onclick="${onViewChange}('${view}')"
                        title="${labels[view]} view"
                    >
                        ${icons[view]}
                    </button>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * Card component
     */
    card(props) {
        const {
            icon = '📄',
            title,
            description,
            meta = [],
            tags = [],
            href,
            onClick,
            footer
        } = props;
        
        const metaHtml = meta.map(m => `<span>${m}</span>`).join('');
        const tagsHtml = tags.map(t => `<span class="tag">${t}</span>`).join('');
        
        const wrapper = href 
            ? `<a href="${href}" class="card-link">`
            : onClick 
                ? `<div class="card-clickable" onclick="${onClick}">`
                : '<div>';
        const wrapperClose = href ? '</a>' : '</div>';
        
        return `
            <div class="card">
                ${wrapper}
                    <div class="card-header">
                        <div class="card-icon">${icon}</div>
                    </div>
                    <h3 class="card-title">${Helpers.escapeHtml(title)}</h3>
                    ${description ? `<p class="card-description">${Helpers.escapeHtml(description)}</p>` : ''}
                    ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ''}
                    ${metaHtml ? `<div class="card-meta">${metaHtml}</div>` : ''}
                ${wrapperClose}
                ${footer ? `<div class="card-footer">${footer}</div>` : ''}
            </div>
        `;
    },
    
    /**
     * Tool card component
     */
    toolCard(tool) {
        const pricingClass = (tool.pricing || 'free').toLowerCase().replace(/\s+/g, '-');
        return `
            <div class="card tool-card">
                <a href="${tool.url}" target="_blank" rel="noopener" class="card-link">
                    <div class="tool-card-icon">
                        ${tool.icon || '🔧'}
                    </div>
                    <div class="tool-card-content">
                        <div class="tool-card-title">${Helpers.escapeHtml(tool.name)}</div>
                        <div class="tool-card-desc">${Helpers.escapeHtml(tool.description || '')}</div>
                    </div>
                    <div class="tool-card-actions">
                        <span class="tag">${tool.pricing || 'Free'}</span>
                    </div>
                </a>
            </div>
        `;
    },
    
    /**
     * Course card component
     */
    courseCard(course) {
        const progress = Storage.getCourseProgress(course.id);
        const totalLessons = course.totalLessons || 10;
        const completedCount = progress.completed?.length || 0;
        const percent = Math.round((completedCount / totalLessons) * 100);
        
        const levelDots = Array(3).fill(0).map((_, i) => {
            const levels = { beginner: 1, intermediate: 2, advanced: 3 };
            const level = levels[course.level] || 1;
            return `<span class="course-level-dot ${i < level ? 'filled' : ''}"></span>`;
        }).join('');
        
        return `
            <div class="card course-card">
                <a href="#/courses/${course.id}" class="card-link">
                    <div class="course-card-image">
                        ${course.icon || '📚'}
                    </div>
                    <div class="course-card-body">
                        <h3 class="card-title">${Helpers.escapeHtml(course.title)}</h3>
                        <p class="card-description">${Helpers.escapeHtml(course.description || '')}</p>
                        <div class="progress" style="margin-top: auto;">
                            <div class="progress-bar" style="width: ${percent}%"></div>
                        </div>
                    </div>
                    <div class="course-card-footer">
                        <div class="course-level" title="${course.level || 'beginner'}">
                            ${levelDots}
                        </div>
                        <span class="text-muted">${completedCount}/${totalLessons} lessons</span>
                    </div>
                </a>
            </div>
        `;
    },
    
    /**
     * Graph card component
     */
    graphCard(graph) {
        const nodeCount = graph.nodeCount || graph.nodes || 0;
        return `
            <div class="card">
                <a href="#/explore/${graph.id}" class="card-link">
                    <div class="card-header">
                        <div class="card-icon">${graph.icon || '🗺️'}</div>
                    </div>
                    <h3 class="card-title">${Helpers.escapeHtml(graph.title)}</h3>
                    <p class="text-secondary text-sm" style="margin: var(--space-2) 0;">${Helpers.escapeHtml(graph.description || '')}</p>
                    <div class="card-meta">
                        <span>${nodeCount} nodes</span>
                        <span class="tag tag-${graph.category || 'default'}">${graph.category || 'general'}</span>
                    </div>
                </a>
            </div>
        `;
    },
    
    /**
     * Progress bar component
     */
    progressBar(percent, label = '') {
        return `
            <div class="progress-container">
                ${label ? `
                    <div class="progress-label">
                        <span>${label}</span>
                        <span>${percent}%</span>
                    </div>
                ` : ''}
                <div class="progress">
                    <div class="progress-bar" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    },
    
    /**
     * Filter chips component
     */
    filterChips(filters, activeFilter, onFilterChange) {
        return `
            <div class="filter-group">
                ${filters.map(filter => `
                    <button 
                        class="filter-chip ${filter.id === activeFilter ? 'active' : ''}"
                        onclick="${onFilterChange}('${filter.id}')"
                    >
                        ${filter.icon ? `<span>${filter.icon}</span>` : ''}
                        ${filter.label}
                        ${filter.count !== undefined ? `<span class="badge">${filter.count}</span>` : ''}
                    </button>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * Section header component
     */
    sectionHeader(title, subtitle = '', actions = '') {
        return `
            <div class="section-header">
                <div>
                    <h2 class="section-title">${Helpers.escapeHtml(title)}</h2>
                    ${subtitle ? `<p class="section-subtitle">${Helpers.escapeHtml(subtitle)}</p>` : ''}
                </div>
                ${actions ? `<div class="section-actions">${actions}</div>` : ''}
            </div>
        `;
    },
    
    /**
     * Empty state component
     */
    emptyState(icon, title, description, action = '') {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <h2 class="empty-state-title">${Helpers.escapeHtml(title)}</h2>
                <p class="empty-state-description">${Helpers.escapeHtml(description)}</p>
                ${action}
            </div>
        `;
    },
    
    /**
     * Skeleton loader
     */
    skeleton(type = 'card', count = 3) {
        const skeletons = {
            card: '<div class="card skeleton skeleton-card"></div>',
            text: '<div class="skeleton skeleton-text"></div>',
            list: '<div class="list-item skeleton" style="height: 60px;"></div>'
        };
        
        return Array(count).fill(skeletons[type] || skeletons.card).join('');
    },
    
    /**
     * Bookmark button
     */
    bookmarkButton(id, type, isBookmarked = false) {
        const icon = isBookmarked ? '🔖' : '📑';
        return `
            <button 
                class="btn btn-icon btn-ghost" 
                onclick="Components.toggleBookmark('${id}', '${type}')"
                title="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}"
            >
                ${icon}
            </button>
        `;
    },
    
    /**
     * Section header with title, subtitle, and actions
     */
    sectionHeader(title, subtitle = '', actions = '') {
        return `
            <div class="section-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-4);">
                <div>
                    <h1 style="font-size: var(--text-3xl); font-weight: var(--font-bold);">${Helpers.escapeHtml(title)}</h1>
                    ${subtitle ? `<p class="text-secondary" style="margin-top: var(--space-2);">${Helpers.escapeHtml(subtitle)}</p>` : ''}
                </div>
                ${actions ? `<div class="section-actions">${actions}</div>` : ''}
            </div>
        `;
    },
    
    /**
     * Filter chips component
     */
    filterChips(filters, currentFilter, onFilterChange) {
        return `
            <div class="filter-chips" style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
                ${filters.map(f => `
                    <button 
                        class="btn btn-sm ${f.id === currentFilter ? 'btn-primary' : 'btn-ghost'}"
                        onclick="${onFilterChange}('${f.id}')"
                    >
                        ${f.icon || ''} ${f.label}${f.count !== undefined ? ` (${f.count})` : ''}
                    </button>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * Toggle bookmark
     */
    toggleBookmark(id, type) {
        if (Storage.isBookmarked(id, type)) {
            Storage.removeBookmark(id, type);
            this.toast('Bookmark removed', 'info');
        } else {
            // Find item details
            const item = State.data.searchIndex.find(
                i => i.id === id && i.type === type
            );
            if (item) {
                Storage.addBookmark(item);
                this.toast('Bookmark added', 'success');
            }
        }
        // Re-render current page
        Router.handleRoute();
    }
};

// Make available globally
window.Components = Components;
