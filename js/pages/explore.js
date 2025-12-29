/* ========================================
   NeuralPath - Explore Page (Knowledge Maps)
   ======================================== */

const ExplorePage = {
    currentGraph: null,
    currentView: 'grid',
    
    /**
     * Render explore index page
     */
    async render() {
        const main = document.getElementById('main');
        this.currentView = Storage.getViewMode('explore') || 'grid';
        
        main.innerHTML = `
            ${Components.sectionHeader(
                '🗺️ Knowledge Maps',
                'Explore AI concepts through interactive visualizations',
                Components.viewToggle(this.currentView, 'ExplorePage.setView', { views: ['grid', 'list'] })
            )}
            
            <div id="graphs-container" class="${this.currentView === 'grid' ? 'grid grid-auto-fit' : 'list'}">
                ${this.renderGraphs()}
            </div>
        `;
    },
    
    /**
     * Render graphs list
     */
    renderGraphs() {
        const graphs = State.data.graphs;
        
        if (graphs.length === 0) {
            return Components.emptyState(
                '🗺️',
                'No maps available',
                'Knowledge maps are being prepared. Check back soon!'
            );
        }
        
        if (this.currentView === 'grid') {
            return graphs.map(graph => Components.graphCard(graph)).join('');
        } else {
            return graphs.map(graph => {
                const nodeCount = graph.nodeCount || graph.nodes || 0;
                return `
                    <a href="#/explore/${graph.id}" class="list-item">
                        <span style="font-size: 1.5rem;">${graph.icon || '🗺️'}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 500;">${Helpers.escapeHtml(graph.title)}</div>
                            <div class="text-muted text-sm">${nodeCount} nodes • ${graph.category || 'general'}</div>
                        </div>
                        <span class="btn btn-ghost btn-sm">Explore →</span>
                    </a>
                `;
            }).join('');
        }
    },
    
    /**
     * Set view mode
     */
    setView(view) {
        this.currentView = view;
        Storage.setViewMode('explore', view);
        this.render();
    },
    
    /**
     * Render single graph viewer
     */
    async renderGraph(graphId) {
        const main = document.getElementById('main');
        
        // Show loading
        main.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading graph...</p>
            </div>
        `;
        
        // Load graph data
        const graph = await State.getGraph(graphId);
        
        if (!graph) {
            main.innerHTML = Components.emptyState(
                '🔍',
                'Graph not found',
                'The requested knowledge map could not be found.',
                '<a href="#/explore" class="btn btn-primary">Back to Maps</a>'
            );
            return;
        }
        
        this.currentGraph = graph;
        
        // Track as recent
        Storage.addRecent({
            id: graphId,
            type: 'graph',
            title: graph.title || graphId,
            icon: '🗺️',
            url: `#/explore/${graphId}`
        });
        
        // Build sections legend if available
        const sectionsLegend = graph.sections ? graph.sections.map(s => `
            <span class="legend-item">
                <span class="legend-dot" style="background: ${s.color};"></span>
                ${s.title}
            </span>
        `).join('') : '';
        
        // Full-screen graph viewer with floating UI
        main.innerHTML = `
            <div class="graph-fullscreen">
                <!-- Compact Header Bar -->
                <div class="graph-header">
                    <a href="#/explore" class="btn btn-ghost btn-sm">← Back</a>
                    <h2 class="graph-title">${Helpers.escapeHtml(graph.title || 'Knowledge Map')}</h2>
                    <div class="graph-stats">${graph.nodes?.length || 0} nodes</div>
                    
                    <div class="graph-layout-tabs">
                        <button class="layout-btn active" data-layout="force" onclick="ExplorePage.setLayout('force')">Force</button>
                        <button class="layout-btn" data-layout="radial" onclick="ExplorePage.setLayout('radial')">Radial</button>
                        <button class="layout-btn" data-layout="cluster" onclick="ExplorePage.setLayout('cluster')">Cluster</button>
                    </div>
                    
                    <div class="graph-zoom-controls">
                        <button class="btn btn-sm btn-ghost" onclick="ExplorePage.zoomIn()" title="Zoom In">➕</button>
                        <button class="btn btn-sm btn-ghost" onclick="ExplorePage.zoomOut()" title="Zoom Out">➖</button>
                        <button class="btn btn-sm btn-ghost" onclick="ExplorePage.resetView()" title="Reset View">⟲</button>
                    </div>
                </div>
                
                <!-- Full-screen Graph Canvas -->
                <div id="graph-canvas" class="graph-canvas-full"></div>
                
                <!-- Floating Legend (bottom-left) -->
                <div class="graph-legend">
                    ${sectionsLegend}
                    ${graph.sections ? '<span class="legend-item"><span class="legend-dot" style="background: #22c55e;"></span>Has Link</span>' : ''}
                </div>
                
                <!-- Floating Details Panel (right side) -->
                <div id="node-panel" class="node-panel">
                    <button class="panel-close" onclick="ExplorePage.closePanel()">✕</button>
                    <div class="panel-icon" id="panel-icon">🔍</div>
                    <h3 class="panel-title" id="panel-title">Select a node</h3>
                    <p class="panel-type" id="panel-type"></p>
                    <p class="panel-description" id="panel-description"></p>
                    <div id="panel-actions"></div>
                </div>
                
                <!-- Floating Tooltip (follows mouse) -->
                <div id="graph-tooltip" class="graph-tooltip"></div>
            </div>
        `;
        
        // Add fullscreen styles if not already present
        this.injectStyles();
        
        // Initialize D3 graph
        this.initGraph(graph);
    },
    
    /**
     * Inject fullscreen graph styles
     */
    injectStyles() {
        if (document.getElementById('graph-fullscreen-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'graph-fullscreen-styles';
        styles.textContent = `
            .graph-fullscreen {
                position: fixed;
                top: 60px;
                left: 0;
                right: 0;
                bottom: 0;
                background: var(--color-bg-primary);
                z-index: 100;
                display: flex;
                flex-direction: column;
            }
            
            .graph-header {
                display: flex;
                align-items: center;
                gap: var(--space-4);
                padding: var(--space-3) var(--space-4);
                background: var(--color-bg-secondary);
                border-bottom: 1px solid var(--color-border);
                height: 50px;
                flex-shrink: 0;
            }
            
            .graph-title {
                font-size: 1rem;
                font-weight: 600;
                margin: 0;
                white-space: nowrap;
                color: var(--color-text-primary);
            }
            
            .graph-stats {
                font-size: 0.75rem;
                color: var(--color-text-muted);
                margin-right: auto;
            }
            
            .graph-layout-tabs {
                display: flex;
                gap: 2px;
                background: var(--color-bg-primary);
                padding: 2px;
                border-radius: 6px;
            }
            
            .layout-btn {
                padding: 4px 12px;
                font-size: 0.75rem;
                border: none;
                background: transparent;
                color: var(--color-text-secondary);
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.15s;
            }
            
            .layout-btn:hover {
                color: var(--color-text-primary);
            }
            
            .layout-btn.active {
                background: var(--color-accent-primary);
                color: white;
            }
            
            .graph-zoom-controls {
                display: flex;
                gap: 2px;
            }
            
            .graph-canvas-full {
                flex: 1;
                overflow: hidden;
                position: relative;
            }
            
            .graph-legend {
                position: absolute;
                bottom: 16px;
                left: 16px;
                display: flex;
                gap: 12px;
                padding: 8px 12px;
                background: var(--color-bg-secondary);
                border-radius: 8px;
                border: 1px solid var(--color-border);
                font-size: 0.7rem;
                z-index: 10;
                backdrop-filter: blur(8px);
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
                color: var(--text-secondary);
            }
            
            .legend-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }
            
            .node-panel {
                position: absolute;
                top: 16px;
                right: 16px;
                width: 280px;
                background: var(--color-bg-secondary);
                border-radius: 12px;
                border: 1px solid var(--color-border);
                padding: var(--space-4);
                z-index: 10;
                display: none;
                box-shadow: var(--shadow-lg);
            }
            
            .node-panel.visible {
                display: block;
                animation: slideIn 0.2s ease-out;
            }
            
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            .panel-close {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 24px;
                height: 24px;
                border: none;
                background: transparent;
                color: var(--color-text-muted);
                cursor: pointer;
                font-size: 14px;
                border-radius: 4px;
            }
            
            .panel-close:hover {
                background: var(--color-bg-tertiary);
                color: var(--color-text-primary);
            }
            
            .panel-icon {
                font-size: 2rem;
                margin-bottom: var(--space-2);
            }
            
            .panel-title {
                font-size: 1rem;
                font-weight: 600;
                margin: 0 0 var(--space-1) 0;
                color: var(--color-text-primary);
            }
            
            .panel-type {
                font-size: 0.7rem;
                color: var(--color-accent-primary);
                text-transform: uppercase;
                margin: 0 0 var(--space-3) 0;
            }
            
            .panel-description {
                font-size: 0.85rem;
                color: var(--color-text-secondary);
                line-height: 1.5;
                margin: 0 0 var(--space-4) 0;
            }
            
            .graph-tooltip {
                position: fixed;
                padding: 6px 10px;
                background: var(--color-bg-tertiary);
                color: var(--color-text-primary);
                font-size: 0.75rem;
                border-radius: 4px;
                border: 1px solid var(--color-border);
                pointer-events: none;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.15s;
                max-width: 200px;
                box-shadow: var(--shadow-lg);
            }
            
            .graph-tooltip.visible {
                opacity: 1;
            }
            
            .graph-tooltip-title {
                font-weight: 600;
            }
            
            .graph-tooltip-type {
                font-size: 0.65rem;
                color: #888;
                text-transform: uppercase;
            }
        `;
        document.head.appendChild(styles);
    },
    
    /**
     * Initialize D3 force-directed graph
     */
    initGraph(data) {
        const container = document.getElementById('graph-canvas');
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight || 500;
        
        // Clear existing
        container.innerHTML = '';
        
        // Check if D3 is available
        if (typeof d3 === 'undefined') {
            container.innerHTML = `
                <div class="empty-state" style="height: 100%;">
                    <p>D3.js is required for graph visualization</p>
                    <p class="text-muted">Add D3.js script to enable interactive graphs</p>
                </div>
            `;
            return;
        }
        
        // Get computed theme colors for graph elements
        const computedStyle = getComputedStyle(document.documentElement);
        const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';
        const linkColor = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
        const nodeStrokeColor = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
        const textColor = isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)';
        
        // Create SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height]);
        
        // Add zoom behavior
        const g = svg.append('g');
        
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });
        
        svg.call(zoom);
        this.zoom = zoom;
        this.svg = svg;
        this.g = g;
        
        // Prepare data
        const nodes = data.nodes || [];
        const links = data.links || data.edges || [];
        
        // Build section color map
        const sectionColors = new Map();
        if (data.sections) {
            data.sections.forEach(s => sectionColors.set(s.id, s.color));
        }
        
        // Color scale for types (fallback)
        const typeColors = {
            'root': '#ef4444',
            'category': '#8b5cf6', 
            'concept': '#6366f1',
            'tool': '#10b981',
            'framework': '#f59e0b',
            'pattern': '#06b6d4',
            'resource': '#ec4899'
        };
        
        // Get node color - prefer section color, fallback to type
        const getNodeColor = (d) => {
            if (d.section && sectionColors.has(d.section)) {
                return sectionColors.get(d.section);
            }
            return typeColors[d.type] || '#6366f1';
        };
        
        // Create simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(80))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30));
        
        // Draw links
        const link = g.append('g')
            .attr('stroke', linkColor)
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke-width', d => Math.sqrt(d.value || 1));
        
        // Draw nodes
        const node = g.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('cursor', 'pointer')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));
        
        // Node circles - size based on type
        node.append('circle')
            .attr('r', d => {
                if (d.type === 'root') return 18;
                if (d.type === 'category') return 14;
                return d.size || 10;
            })
            .attr('fill', d => getNodeColor(d))
            .attr('stroke', nodeStrokeColor)
            .attr('stroke-width', d => d.type === 'root' ? 3 : 1.5);
        
        // Add URL indicator
        node.filter(d => d.url)
            .append('circle')
            .attr('r', 4)
            .attr('cx', d => (d.type === 'root' ? 14 : d.type === 'category' ? 10 : 7))
            .attr('cy', d => (d.type === 'root' ? -14 : d.type === 'category' ? -10 : -7))
            .attr('fill', '#22c55e')
            .attr('stroke', isDarkMode ? '#0d1117' : '#ffffff')
            .attr('stroke-width', 1);
        
        // Node labels
        node.append('text')
            .text(d => d.label || d.id)
            .attr('x', 0)
            .attr('y', d => {
                if (d.type === 'root') return 28;
                if (d.type === 'category') return 22;
                return 18;
            })
            .attr('text-anchor', 'middle')
            .attr('fill', textColor)
            .attr('font-size', d => d.type === 'root' ? '12px' : '10px')
            .attr('font-weight', d => d.type === 'root' ? '600' : '400')
            .attr('pointer-events', 'none');
        
        // Node hover - show tooltip
        node.on('mouseover', (event, d) => {
            this.showTooltip(event, d);
        })
        .on('mouseout', () => {
            this.hideTooltip();
        })
        .on('click', (event, d) => {
            event.stopPropagation();
            this.showPanel(d);
        })
        .on('dblclick', (event, d) => {
            // Double-click opens URL directly
            if (d.url) {
                window.open(d.url, '_blank');
            }
        });
        
        // Click on background closes panel
        svg.on('click', () => {
            this.closePanel();
        });
        
        // Simulation tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });
        
        // Drag functions
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
        
        // Store references
        this.simulation = simulation;
        this.nodes = nodes;
        this.links = links;
        this.width = width;
        this.height = height;
        this.currentLayout = 'force';
    },
    
    /**
     * Show tooltip on hover
     */
    showTooltip(event, d) {
        const tooltip = document.getElementById('graph-tooltip');
        if (!tooltip) return;
        
        tooltip.innerHTML = `
            <div class="graph-tooltip-title">${d.label || d.id}</div>
            <div class="graph-tooltip-type">${d.type || 'node'}${d.url ? ' • 🔗' : ''}</div>
        `;
        
        tooltip.style.left = (event.pageX + 15) + 'px';
        tooltip.style.top = (event.pageY - 10) + 'px';
        tooltip.classList.add('visible');
    },
    
    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('graph-tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
    },
    
    /**
     * Show floating panel with node details
     */
    showPanel(node) {
        const panel = document.getElementById('node-panel');
        const icon = document.getElementById('panel-icon');
        const title = document.getElementById('panel-title');
        const type = document.getElementById('panel-type');
        const description = document.getElementById('panel-description');
        const actions = document.getElementById('panel-actions');
        
        if (!panel) return;
        
        // Set icon based on type
        const icons = {
            'root': '🎯',
            'category': '📁',
            'concept': '💡',
            'tool': '🔧',
            'framework': '🏗️',
            'pattern': '🔄',
            'resource': '📚'
        };
        
        icon.textContent = icons[node.type] || '🔍';
        title.textContent = node.label || node.id;
        type.textContent = node.type || 'node';
        description.textContent = node.description || 'No description available';
        
        // Actions
        if (node.url) {
            actions.innerHTML = `
                <a href="${node.url}" target="_blank" class="btn btn-primary btn-sm" style="width: 100%;">
                    Open Resource →
                </a>
            `;
        } else {
            actions.innerHTML = '';
        }
        
        panel.classList.add('visible');
    },
    
    /**
     * Close the floating panel
     */
    closePanel() {
        const panel = document.getElementById('node-panel');
        if (panel) {
            panel.classList.remove('visible');
        }
    },
    
    /**
     * Set layout mode
     */
    setLayout(layout) {
        // Update button states
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.layout === layout);
        });
        
        this.currentLayout = layout;
        this.applyLayout(layout);
    },
    
    /**
     * Apply layout to nodes
     */
    applyLayout(layout) {
        if (!this.simulation || !this.nodes) return;
        
        const { width, height, nodes, simulation } = this;
        
        simulation.stop();
        
        if (layout === 'force') {
            // Reset positions and restart simulation
            nodes.forEach(n => {
                n.fx = null;
                n.fy = null;
            });
            simulation
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('charge', d3.forceManyBody().strength(-200))
                .alpha(1)
                .restart();
                
        } else if (layout === 'radial') {
            // Arrange by type in radial pattern
            const typeGroups = d3.group(nodes, d => d.type);
            const types = [...typeGroups.keys()];
            const angleStep = (2 * Math.PI) / types.length;
            
            types.forEach((type, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const radius = Math.min(width, height) * 0.3;
                const cx = width / 2 + Math.cos(angle) * radius;
                const cy = height / 2 + Math.sin(angle) * radius;
                
                const group = typeGroups.get(type);
                group.forEach((node, j) => {
                    const subAngle = (j / group.length) * Math.PI * 0.6 + angle - Math.PI * 0.3;
                    const subRadius = 50 + group.length * 5;
                    node.fx = cx + Math.cos(subAngle) * subRadius;
                    node.fy = cy + Math.sin(subAngle) * subRadius;
                });
            });
            
            simulation.alpha(0.3).restart();
            
        } else if (layout === 'cluster') {
            // Arrange in grid clusters by type
            const typeGroups = d3.group(nodes, d => d.type);
            const types = [...typeGroups.keys()];
            const cols = Math.ceil(Math.sqrt(types.length));
            const cellW = width / cols;
            const cellH = height / Math.ceil(types.length / cols);
            
            types.forEach((type, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const cx = col * cellW + cellW / 2;
                const cy = row * cellH + cellH / 2;
                
                const group = typeGroups.get(type);
                group.forEach((node, j) => {
                    const angle = (j / group.length) * 2 * Math.PI;
                    const radius = Math.min(cellW, cellH) * 0.35;
                    node.fx = cx + Math.cos(angle) * radius * (0.6 + Math.random() * 0.4);
                    node.fy = cy + Math.sin(angle) * radius * (0.6 + Math.random() * 0.4);
                });
            });
            
            simulation.alpha(0.3).restart();
        }
    },
    
    /**
     * Zoom controls
     */
    zoomIn() {
        if (this.svg && this.zoom) {
            this.svg.transition().call(this.zoom.scaleBy, 1.3);
        }
    },
    
    zoomOut() {
        if (this.svg && this.zoom) {
            this.svg.transition().call(this.zoom.scaleBy, 0.7);
        }
    },
    
    resetView() {
        if (this.svg && this.zoom) {
            this.svg.transition().call(this.zoom.transform, d3.zoomIdentity);
        }
    },
    
    /**
     * Update graph colors when theme changes
     */
    updateThemeColors() {
        if (!this.g || typeof d3 === 'undefined') return;
        
        const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';
        const linkColor = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
        const nodeStrokeColor = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
        const textColor = isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)';
        const urlIndicatorStroke = isDarkMode ? '#0d1117' : '#ffffff';
        
        // Update link colors
        this.g.selectAll('line')
            .attr('stroke', linkColor);
        
        // Update node stroke colors
        this.g.selectAll('g > circle:first-child')
            .attr('stroke', nodeStrokeColor);
        
        // Update URL indicator circles
        this.g.selectAll('g > circle:nth-child(2)')
            .attr('stroke', urlIndicatorStroke);
        
        // Update text colors
        this.g.selectAll('text')
            .attr('fill', textColor);
    }
};

// Make available globally
window.ExplorePage = ExplorePage;
