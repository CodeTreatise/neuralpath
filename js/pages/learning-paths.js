/* ========================================
   NeuralPath - Learning Paths Page
   Guided learning journeys for specific goals
   Inspired by Pluralsight path navigation
   ======================================== */

const LearningPathsPage = {
    data: null,
    selectedPath: null,
    activeStage: 0,

    /**
     * Load learning paths data
     */
    async loadData() {
        if (this.data) return this.data;
        try {
            const response = await fetch('data/learning-paths.json');
            this.data = await response.json();
            return this.data;
        } catch (error) {
            console.error('Failed to load learning paths:', error);
            return null;
        }
    },

    /**
     * Render the learning paths listing page
     */
    async render() {
        const main = document.getElementById('main');
        const data = await this.loadData();

        if (!data) {
            main.innerHTML = Components.emptyState(
                '⚠️',
                'Failed to load',
                'Could not load learning paths data.'
            );
            return;
        }

        main.innerHTML = `
            <div class="lp-page">
                <!-- Header -->
                <header class="lp-header">
                    <h1>🗺️ Learning Paths</h1>
                    <p class="lp-subtitle">Guided journeys to master specific AI skills</p>
                    <p class="lp-description">Select your goal and follow a structured learning path with courses, projects, and milestones</p>
                </header>

                <!-- Paths Grid -->
                <section class="lp-paths-grid">
                    ${data.learningPaths.map(path => this.renderPathCard(path)).join('')}
                </section>

                <!-- By Time Available -->
                <section class="lp-by-time">
                    <h2>📅 Choose by Time Available</h2>
                    <div class="lp-time-grid">
                        <div class="lp-time-card" onclick="LearningPathsPage.filterByTime('1-2weeks')">
                            <div class="lp-time-icon">⚡</div>
                            <div class="lp-time-title">1-2 Weeks</div>
                            <div class="lp-time-desc">Quick wins & quick skills</div>
                        </div>
                        <div class="lp-time-card" onclick="LearningPathsPage.filterByTime('1month')">
                            <div class="lp-time-icon">🚀</div>
                            <div class="lp-time-title">1 Month</div>
                            <div class="lp-time-desc">Build real projects</div>
                        </div>
                        <div class="lp-time-card" onclick="LearningPathsPage.filterByTime('3months')">
                            <div class="lp-time-icon">🎯</div>
                            <div class="lp-time-title">3 Months</div>
                            <div class="lp-time-desc">Deep expertise</div>
                        </div>
                        <div class="lp-time-card" onclick="LearningPathsPage.filterByTime('6months')">
                            <div class="lp-time-icon">🏆</div>
                            <div class="lp-time-title">6 Months</div>
                            <div class="lp-time-desc">Become a specialist</div>
                        </div>
                    </div>
                </section>
            </div>
        `;
    },

    /**
     * Render a path card
     */
    renderPathCard(path) {
        return `
            <a href="#/learning-paths/${path.id}" class="lp-path-card">
                <div class="lp-path-icon">${path.icon}</div>
                <h3>${Helpers.escapeHtml(path.title)}</h3>
                <p class="lp-path-desc">${Helpers.escapeHtml(path.description)}</p>
                <div class="lp-path-meta">
                    <span class="lp-meta-item">📅 ${path.duration}</span>
                    <span class="lp-meta-item">📚 ${path.stages ? path.stages.length : 4} Stages</span>
                </div>
                <div class="lp-elements">
                    ${(path.periodicTableElements || []).map(el => 
                        `<span class="lp-element">${el}</span>`
                    ).join('')}
                </div>
            </a>
        `;
    },

    /**
     * Render dedicated path detail page (Pluralsight-style)
     */
    async renderPathPage(pathId) {
        const main = document.getElementById('main');
        const data = await this.loadData();
        const path = data?.learningPaths?.find(p => p.id === pathId);

        if (!path) {
            main.innerHTML = Components.emptyState(
                '404',
                'Path Not Found',
                'This learning path does not exist.',
                '<a href="#/learning-paths" class="btn btn-primary">View All Paths</a>'
            );
            return;
        }

        this.selectedPath = path;
        this.activeStage = 0;

        // Calculate totals
        const totalCourses = path.stages?.reduce((sum, stage) => sum + (stage.courses?.length || 0), 0) || 0;

        main.innerHTML = `
            <div class="lp-detail-page">
                <!-- Breadcrumb -->
                <nav class="lp-breadcrumb">
                    <a href="#/learning-paths">Learning Paths</a>
                    <span class="lp-breadcrumb-sep">›</span>
                    <span>${Helpers.escapeHtml(path.title)}</span>
                </nav>

                <!-- Path Header -->
                <header class="lp-detail-hero">
                    <div class="lp-hero-content">
                        <span class="lp-hero-icon">${path.icon}</span>
                        <div>
                            <h1>${Helpers.escapeHtml(path.title)}</h1>
                            <p class="lp-hero-goal">🎯 ${Helpers.escapeHtml(path.goal)}</p>
                        </div>
                    </div>
                    <p class="lp-hero-desc">${Helpers.escapeHtml(path.description)}</p>
                    
                    <!-- Stats Bar -->
                    <div class="lp-stats-bar">
                        <div class="lp-stat">
                            <span class="lp-stat-value">${path.stages?.length || 0}</span>
                            <span class="lp-stat-label">Stages</span>
                        </div>
                        <div class="lp-stat">
                            <span class="lp-stat-value">${totalCourses}</span>
                            <span class="lp-stat-label">Courses</span>
                        </div>
                        <div class="lp-stat">
                            <span class="lp-stat-value">${path.duration}</span>
                            <span class="lp-stat-label">Duration</span>
                        </div>
                        <div class="lp-stat">
                            <span class="lp-stat-value">${(path.periodicTableElements || []).length}</span>
                            <span class="lp-stat-label">Elements</span>
                        </div>
                    </div>

                    <!-- Start Button -->
                    <button class="lp-hero-start-btn" onclick="LearningPathsPage.startPath('${path.id}')">
                        🚀 Start Learning Path
                    </button>
                </header>

                <!-- Main Content with Sidebar Navigation -->
                <div class="lp-detail-layout">
                    <!-- Left Sidebar: Stage Navigation -->
                    <aside class="lp-sidebar">
                        <div class="lp-sidebar-header">
                            <h3>📍 Path Navigation</h3>
                        </div>
                        <nav class="lp-stage-nav">
                            ${path.stages?.map((stage, idx) => `
                                <a href="#stage-${idx}" 
                                   class="lp-stage-nav-item ${idx === 0 ? 'active' : ''}"
                                   data-stage="${idx}"
                                   onclick="LearningPathsPage.scrollToStage(${idx})">
                                    <span class="lp-nav-num">${stage.stageNumber}</span>
                                    <div class="lp-nav-info">
                                        <span class="lp-nav-name">${Helpers.escapeHtml(stage.stageName)}</span>
                                        <span class="lp-nav-meta">${stage.courses?.length || 0} courses • ${stage.stageDuration}</span>
                                    </div>
                                </a>
                            `).join('')}
                        </nav>

                        <!-- Elements in Path -->
                        <div class="lp-sidebar-section">
                            <h4>🧪 Periodic Elements</h4>
                            <div class="lp-sidebar-elements">
                                ${(path.periodicTableElements || []).map(el => {
                                    const desc = path.elementDescriptions?.[el] || '';
                                    return `
                                        <a href="#/periodic-table" class="lp-sidebar-element" title="${desc}">
                                            <span class="lp-el-symbol">${el}</span>
                                            <span class="lp-el-desc">${Helpers.escapeHtml(desc.split(' ').slice(0, 4).join(' '))}...</span>
                                        </a>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Prerequisites -->
                        ${path.prerequisites ? `
                            <div class="lp-sidebar-section">
                                <h4>📋 Prerequisites</h4>
                                <ul class="lp-prereq-list">
                                    ${path.prerequisites.map(pre => `<li>${Helpers.escapeHtml(pre)}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </aside>

                    <!-- Right: Content Area -->
                    <main class="lp-content-area">
                        <!-- Stages -->
                        ${path.stages?.map((stage, idx) => this.renderStageSection(stage, path, idx)).join('')}

                        <!-- Milestones Section -->
                        ${path.projectMilestones && path.projectMilestones.length > 0 ? `
                            <section class="lp-milestones-section" id="milestones">
                                <h2>🏁 Project Milestones</h2>
                                <p class="lp-section-desc">Build real projects to demonstrate your skills</p>
                                <div class="lp-milestones-grid">
                                    ${path.projectMilestones.map(m => `
                                        <div class="lp-milestone-card">
                                            <div class="lp-milestone-header">
                                                <span class="lp-milestone-week">Week ${m.week}</span>
                                                <span class="lp-milestone-name">${Helpers.escapeHtml(m.name)}</span>
                                            </div>
                                            <p class="lp-milestone-desc">${Helpers.escapeHtml(m.description)}</p>
                                            <div class="lp-milestone-elements">
                                                ${(m.periodicElements || []).map(el => 
                                                    `<span class="lp-element-small">${el}</span>`
                                                ).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </section>
                        ` : ''}

                        <!-- Related Reactions -->
                        ${path.relatedReactions && path.relatedReactions.length > 0 ? `
                            <section class="lp-related-section">
                                <h2>⚗️ Related Reactions</h2>
                                <p class="lp-section-desc">Periodic table reactions you'll learn</p>
                                <div class="lp-related-links">
                                    ${path.relatedReactions.map(r => `
                                        <a href="#/periodic-table" class="lp-related-link">${r}</a>
                                    `).join('')}
                                </div>
                            </section>
                        ` : ''}

                        <!-- Next Steps -->
                        ${path.nextSteps && path.nextSteps.length > 0 ? `
                            <section class="lp-next-section">
                                <h2>🔮 What's Next?</h2>
                                <p class="lp-section-desc">Continue your journey after completing this path</p>
                                <ul class="lp-next-list">
                                    ${path.nextSteps.map(step => `<li>${Helpers.escapeHtml(step)}</li>`).join('')}
                                </ul>
                            </section>
                        ` : ''}
                    </main>
                </div>
            </div>
        `;

        // Setup scroll observer for active stage highlighting
        this.setupScrollObserver();
    },

    /**
     * Render a stage section in the content area
     */
    renderStageSection(stage, path, stageIdx) {
        return `
            <section class="lp-stage-section" id="stage-${stageIdx}">
                <div class="lp-stage-header-bar">
                    <div class="lp-stage-badge">Stage ${stage.stageNumber}</div>
                    <h2>${Helpers.escapeHtml(stage.stageName)}</h2>
                    <span class="lp-stage-duration-badge">${stage.stageDuration}</span>
                </div>
                
                ${stage.stageGoal ? `<p class="lp-stage-goal-text">🎯 ${Helpers.escapeHtml(stage.stageGoal)}</p>` : ''}

                <!-- Courses List -->
                <div class="lp-courses-list">
                    ${(stage.courses || []).map((course, courseIdx) => `
                        <div class="lp-course-item">
                            <div class="lp-course-number">${stageIdx + 1}.${courseIdx + 1}</div>
                            <div class="lp-course-body">
                                <div class="lp-course-top">
                                    <a href="#/courses/${course.courseId}" class="lp-course-title">${Helpers.escapeHtml(course.courseName)}</a>
                                    ${course.skip ? `<span class="lp-skip-badge">Optional</span>` : ''}
                                    ${course.prerequisite ? `<span class="lp-prereq-badge">Prerequisite</span>` : ''}
                                </div>
                                <p class="lp-course-why">${Helpers.escapeHtml(course.why)}</p>
                                <div class="lp-course-info">
                                    <span>⏱️ ${course.duration}</span>
                                    ${course.effort ? `<span>💪 ${course.effort}</span>` : ''}
                                </div>
                                ${course.keyLessons ? `
                                    <div class="lp-course-lessons">
                                        ${course.keyLessons.map(l => `<span class="lp-lesson-chip">${Helpers.escapeHtml(l)}</span>`).join('')}
                                    </div>
                                ` : ''}
                                ${course.outcome ? `<p class="lp-course-outcome">✅ ${Helpers.escapeHtml(course.outcome)}</p>` : ''}
                                ${course.practicalTask ? `<p class="lp-course-task">🛠️ <strong>Task:</strong> ${Helpers.escapeHtml(course.practicalTask)}</p>` : ''}
                                ${course.practicalTasks ? `
                                    <div class="lp-course-tasks">
                                        <strong>🛠️ Tasks:</strong>
                                        <ul>
                                            ${course.practicalTasks.map(t => `<li>${Helpers.escapeHtml(t)}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                <a href="#/courses/${course.courseId}" class="lp-course-start-btn">Start Course →</a>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Periodic elements for this stage -->
                ${stage.periodicElements && stage.periodicElements.length > 0 ? `
                    <div class="lp-stage-elements-bar">
                        <span class="lp-elements-label">🧪 Elements Covered:</span>
                        ${stage.periodicElements.map(el => {
                            const desc = path.elementDescriptions?.[el] || '';
                            return `<span class="lp-element-chip" title="${desc}">${el}</span>`;
                        }).join('')}
                    </div>
                ` : ''}
            </section>
        `;
    },

    /**
     * Scroll to specific stage
     */
    scrollToStage(stageIdx) {
        const stageEl = document.getElementById(`stage-${stageIdx}`);
        if (stageEl) {
            stageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.setActiveStage(stageIdx);
        }
    },

    /**
     * Set active stage in sidebar
     */
    setActiveStage(stageIdx) {
        document.querySelectorAll('.lp-stage-nav-item').forEach((el, idx) => {
            el.classList.toggle('active', idx === stageIdx);
        });
        this.activeStage = stageIdx;
    },

    /**
     * Setup scroll observer for highlighting active stage
     */
    setupScrollObserver() {
        const stages = document.querySelectorAll('.lp-stage-section');
        if (!stages.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stageIdx = parseInt(entry.target.id.replace('stage-', ''));
                    this.setActiveStage(stageIdx);
                }
            });
        }, { rootMargin: '-100px 0px -50% 0px' });

        stages.forEach(stage => observer.observe(stage));
    },

    /**
     * Filter paths by time
     */
    filterByTime(timeRange) {
        Components.toast(`Filtering by: ${timeRange}`, 'info');
    },

    /**
     * Start a learning path
     */
    startPath(pathId) {
        Components.toast(`Started learning path: ${pathId}`, 'success');
    }
};
