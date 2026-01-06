/* ========================================
   NeuralPath - Periodic Table Page
   AI Periodic Table inspired by IBM Technology
   ======================================== */

const PeriodicTablePage = {
    data: null,
    selectedElement: null,

    /**
     * Load periodic table data
     */
    async loadData() {
        if (this.data) return this.data;
        try {
            const response = await fetch('data/periodic-table.json');
            this.data = await response.json();
            return this.data;
        } catch (error) {
            console.error('Failed to load periodic table data:', error);
            return null;
        }
    },

    /**
     * Render the periodic table page
     */
    async render() {
        const main = document.getElementById('main');
        const data = await this.loadData();

        if (!data) {
            main.innerHTML = Components.emptyState(
                '⚠️',
                'Failed to load',
                'Could not load periodic table data.'
            );
            return;
        }

        main.innerHTML = `
            <div class="pt-page">
                <!-- Header -->
                <header class="pt-header">
                    <div class="pt-title-row">
                        <h1>🧪 ${Helpers.escapeHtml(data.title)}</h1>
                        <a href="${data.source.url}" target="_blank" rel="noopener" class="pt-source-btn">
                            📺 Watch Video
                        </a>
                    </div>
                    <p class="pt-subtitle">${Helpers.escapeHtml(data.description)}</p>
                </header>

                <!-- Main Content: Table + Detail Panel -->
                <div class="pt-main">
                    <!-- Left: Table -->
                    <div class="pt-table-section">
                        <!-- Column Headers -->
                        <div class="pt-col-labels">
                            <div class="pt-col-spacer"></div>
                            ${data.columns.map(col => `
                                <div class="pt-col-label" style="--col-color: ${col.color}">
                                    ${Helpers.escapeHtml(col.name)}
                                </div>
                            `).join('')}
                        </div>

                        <!-- Table Grid -->
                        <div class="pt-grid">
                            ${data.rows.map(row => this.renderRow(row, data)).join('')}
                        </div>
                    </div>

                    <!-- Right: Detail Panel -->
                    <div class="pt-detail-section" id="element-detail">
                        <div class="pt-detail-placeholder">
                            <span class="pt-detail-icon">👆</span>
                            <p>Click an element to see details</p>
                        </div>
                        <div id="element-detail-content" class="pt-detail-content hidden"></div>
                    </div>
                </div>

                <!-- Reactions Section -->
                <section class="pt-reactions">
                    <h2>⚗️ Reactions</h2>
                    <p class="pt-reactions-subtitle">How elements combine to form AI systems</p>
                    <div class="pt-reactions-grid">
                        ${data.reactions.map(r => this.renderReaction(r, data)).join('')}
                    </div>
                </section>

                <!-- Row Legend -->
                <section class="pt-row-info">
                    ${data.rows.map(row => `
                        <div class="pt-row-info-item">
                            <span class="pt-row-badge">${Helpers.escapeHtml(row.name)}</span>
                            <span class="pt-row-desc">${Helpers.escapeHtml(row.description)}</span>
                        </div>
                    `).join('')}
                </section>
            </div>
        `;
    },

    /**
     * Render a single row
     */
    renderRow(row, data) {
        const rowElements = data.elements.filter(el => el.row === row.id);
        
        return `
            <div class="pt-row">
                <div class="pt-row-label">${Helpers.escapeHtml(row.name)}</div>
                ${data.columns.map(col => {
                    const element = rowElements.find(el => el.column === col.id);
                    if (element) {
                        return `
                            <div class="pt-cell" 
                                 style="--el-color: ${col.color}"
                                 onclick="PeriodicTablePage.showElement('${element.symbol}')"
                                 tabindex="0"
                                 role="button"
                                 data-symbol="${element.symbol}"
                                 aria-label="${element.name}">
                                <span class="pt-cell-symbol">${element.symbol}</span>
                                <span class="pt-cell-name">${Helpers.escapeHtml(element.name)}</span>
                            </div>
                        `;
                    } else {
                        return `<div class="pt-cell-empty"></div>`;
                    }
                }).join('')}
            </div>
        `;
    },

    /**
     * Render a reaction card
     */
    renderReaction(reaction, data) {
        const getElementColor = (symbol) => {
            const el = data.elements.find(e => e.symbol === symbol);
            if (!el) return '#666';
            const col = data.columns.find(c => c.id === el.column);
            return col ? col.color : '#666';
        };

        const levelBadge = reaction.level ? `<span class="pt-level-badge pt-level-${reaction.level}">${reaction.level}</span>` : '';

        return `
            <div class="pt-reaction-card" onclick="PeriodicTablePage.showRecipe('${reaction.id}')">
                <div class="pt-reaction-header">
                    <div class="pt-reaction-name">${Helpers.escapeHtml(reaction.name)}</div>
                    ${levelBadge}
                </div>
                <div class="pt-reaction-formula">
                    ${reaction.inputs.map((sym, i) => `
                        <span class="pt-reaction-el" style="--el-color: ${getElementColor(sym)}">${sym}</span>
                        ${i < reaction.inputs.length - 1 ? '<span class="pt-reaction-op">+</span>' : ''}
                    `).join('')}
                    <span class="pt-reaction-op">→</span>
                    ${reaction.output ? `
                        <span class="pt-reaction-el pt-reaction-output" style="--el-color: ${getElementColor(reaction.output)}">${reaction.output}</span>
                    ` : `<span class="pt-reaction-result">Production</span>`}
                </div>
                <div class="pt-reaction-desc">${Helpers.escapeHtml(reaction.description)}</div>
            </div>
        `;
    },

    /**
     * Show element detail
     */
    showElement(symbol) {
        const element = this.data.elements.find(el => el.symbol === symbol);
        if (!element) return;

        const column = this.data.columns.find(c => c.id === element.column);
        const row = this.data.rows.find(r => r.id === element.row);

        // Find reactions involving this element
        const relatedReactions = this.data.reactions.filter(r => 
            r.inputs.includes(symbol) || r.output === symbol
        );

        const placeholder = document.querySelector('.pt-detail-placeholder');
        const content = document.getElementById('element-detail-content');

        if (placeholder) placeholder.classList.add('hidden');
        content.classList.remove('hidden');

        // Course link button
        const courseLink = element.courseId 
            ? `<a href="#/courses/${element.courseId}" class="pt-learn-btn">📚 Learn ${element.name}</a>`
            : '';

        content.innerHTML = `
            <div class="pt-detail-header" style="--el-color: ${column.color}">
                <div class="pt-detail-symbol">${element.symbol}</div>
                <div>
                    <h3>${Helpers.escapeHtml(element.name)}</h3>
                    <span class="pt-detail-meta">${Helpers.escapeHtml(column.name)} • ${Helpers.escapeHtml(row.name)}</span>
                </div>
            </div>
            
            <p class="pt-detail-desc">${Helpers.escapeHtml(element.description)}</p>
            <p class="pt-detail-info">${Helpers.escapeHtml(element.details)}</p>
            
            ${element.examples && element.examples.length > 0 ? `
                <div class="pt-detail-examples">
                    <h4>Examples</h4>
                    <div class="pt-detail-tags">
                        ${element.examples.map(ex => `<span class="pt-tag">${Helpers.escapeHtml(ex)}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            ${relatedReactions.length > 0 ? `
                <div class="pt-detail-reactions">
                    <h4>Used In Recipes</h4>
                    ${relatedReactions.map(r => `
                        <div class="pt-detail-reaction" onclick="PeriodicTablePage.showRecipe('${r.id}')">${r.formula} - ${r.name}</div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${courseLink}
        `;

        this.selectedElement = symbol;

        // Highlight selected element
        document.querySelectorAll('.pt-cell').forEach(el => el.classList.remove('selected'));
        const selectedEl = document.querySelector(`.pt-cell[data-symbol="${symbol}"]`);
        if (selectedEl) selectedEl.classList.add('selected');
    },

    /**
     * Show recipe modal with how-to-build guide
     */
    showRecipe(reactionId) {
        const reaction = this.data.reactions.find(r => r.id === reactionId);
        if (!reaction) return;

        const getElementColor = (symbol) => {
            const el = this.data.elements.find(e => e.symbol === symbol);
            if (!el) return '#666';
            const col = this.data.columns.find(c => c.id === el.column);
            return col ? col.color : '#666';
        };

        const getElementName = (symbol) => {
            const el = this.data.elements.find(e => e.symbol === symbol);
            return el ? el.name : symbol;
        };

        // Build learning path links
        const learnPathLinks = (reaction.learnPath || []).map(courseId => {
            const course = State.data.courses?.find(c => c.id === courseId);
            const title = course ? course.title : courseId;
            return `<a href="#/courses/${courseId}" class="pt-course-link">${title}</a>`;
        }).join('');

        // Build steps from howToBuild
        const steps = reaction.howToBuild 
            ? reaction.howToBuild.split(/\d+\.\s+/).filter(s => s.trim()).map((step, i) => 
                `<li>${Helpers.escapeHtml(step.trim())}</li>`
              ).join('')
            : '';

        const modal = document.createElement('div');
        modal.className = 'pt-recipe-modal';
        modal.innerHTML = `
            <div class="pt-recipe-backdrop" onclick="PeriodicTablePage.closeRecipe()"></div>
            <div class="pt-recipe-content">
                <button class="pt-recipe-close" onclick="PeriodicTablePage.closeRecipe()">×</button>
                
                <div class="pt-recipe-header">
                    <h2>🧪 ${Helpers.escapeHtml(reaction.name)}</h2>
                    ${reaction.level ? `<span class="pt-level-badge pt-level-${reaction.level}">${reaction.level}</span>` : ''}
                </div>
                
                <div class="pt-recipe-formula-large">
                    ${reaction.inputs.map((sym, i) => `
                        <div class="pt-recipe-ingredient">
                            <span class="pt-recipe-el" style="--el-color: ${getElementColor(sym)}">${sym}</span>
                            <span class="pt-recipe-el-name">${getElementName(sym)}</span>
                        </div>
                        ${i < reaction.inputs.length - 1 ? '<span class="pt-recipe-op">+</span>' : ''}
                    `).join('')}
                    <span class="pt-recipe-op">→</span>
                    ${reaction.output ? `
                        <div class="pt-recipe-ingredient">
                            <span class="pt-recipe-el pt-recipe-output" style="--el-color: ${getElementColor(reaction.output)}">${reaction.output}</span>
                            <span class="pt-recipe-el-name">${getElementName(reaction.output)}</span>
                        </div>
                    ` : `<span class="pt-recipe-result-large">🚀 Production</span>`}
                </div>
                
                <p class="pt-recipe-desc">${Helpers.escapeHtml(reaction.description)}</p>
                
                ${steps ? `
                    <div class="pt-recipe-steps">
                        <h3>📋 How to Build</h3>
                        <ol>${steps}</ol>
                    </div>
                ` : ''}
                
                ${learnPathLinks ? `
                    <div class="pt-recipe-courses">
                        <h3>📚 Learn the Prerequisites</h3>
                        <div class="pt-recipe-course-links">${learnPathLinks}</div>
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    },

    /**
     * Close recipe modal
     */
    closeRecipe() {
        const modal = document.querySelector('.pt-recipe-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },

    /**
     * Close element detail
     */
    closeDetail() {
        const placeholder = document.querySelector('.pt-detail-placeholder');
        const content = document.getElementById('element-detail-content');
        
        if (placeholder) placeholder.classList.remove('hidden');
        if (content) content.classList.add('hidden');
        
        this.selectedElement = null;
        document.querySelectorAll('.pt-cell').forEach(el => el.classList.remove('selected'));
    }
};
