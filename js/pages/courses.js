/* ========================================
   NeuralPath - Courses Page
   ======================================== */

const CoursesPage = {
    currentView: 'grid',
    currentFilter: 'all',
    searchQuery: '',
    learningPath: null,
    showPath: false,
    
    /**
     * Load learning path data
     */
    async loadLearningPath() {
        if (!this.learningPath) {
            try {
                const response = await fetch('data/learning-path.json');
                this.learningPath = await response.json();
            } catch (error) {
                console.error('Failed to load learning path:', error);
                this.learningPath = { levels: [] };
            }
        }
        return this.learningPath;
    },
    
    /**
     * Render courses index page
     */
    async render() {
        window.scrollTo(0, 0);
        const main = document.getElementById('main');
        this.currentView = Storage.getViewMode('courses') || 'grid';
        await this.loadLearningPath();
        
        const courses = State.data.courses;
        const stats = this.getStats(courses);
        
        main.innerHTML = `
            <!-- Toolbar -->
            <div class="courses-toolbar">
                <div class="courses-toolbar-left">
                    <div class="search-wrapper">
                        <span class="search-icon">🔍</span>
                        <input 
                            type="text" 
                            id="courses-search" 
                            class="search-input" 
                            placeholder="Search ${courses.length} courses..." 
                            value="${Helpers.escapeHtml(this.searchQuery)}"
                            oninput="CoursesPage.handleSearch(this.value)"
                        />
                        ${this.searchQuery ? `<button class="search-clear" onclick="CoursesPage.clearSearch()">✕</button>` : ''}
                    </div>
                </div>
                <div class="courses-toolbar-right">
                    <div class="toolbar-stats">
                        <span class="stat-item"><strong>${stats.inProgress}</strong> in progress</span>
                        <span class="stat-divider">·</span>
                        <span class="stat-item"><strong>${stats.completed}</strong> completed</span>
                    </div>
                    <div class="toolbar-divider"></div>
                    <button class="pill ${this.showPath ? 'pill-active' : ''}" onclick="CoursesPage.togglePath()">
                        🛤️ Path
                    </button>
                    ${Components.viewToggle(this.currentView, 'CoursesPage.setView', { views: ['grid', 'list'] })}
                </div>
            </div>
            
            <!-- Learning Path (Collapsible) -->
            ${this.showPath ? this.renderLearningPath() : ''}
            
            <!-- Filters -->
            <div class="courses-filters">
                <div class="filter-group" id="level-filters">
                    ${this.renderLevelFilters()}
                </div>
                ${this.currentFilter !== 'all' || this.searchQuery ? `
                    <button class="filter-clear" onclick="CoursesPage.clearFilters()">Clear filters</button>
                ` : ''}
            </div>
            
            <div id="courses-container" class="${this.currentView === 'grid' ? 'courses-grid' : 'courses-list'}">
                ${this.renderCourses()}
            </div>
        `;
        
        this.addPathStyles();
    },
    
    /**
     * Get course stats
     */
    getStats(courses) {
        let inProgress = 0;
        let completed = 0;
        
        courses.forEach(course => {
            const progress = Storage.getCourseProgress(course.id);
            const total = course.totalLessons || 10;
            const done = progress.completed?.length || 0;
            if (done > 0 && done < total) inProgress++;
            if (done >= total) completed++;
        });
        
        return { inProgress, completed };
    },
    
    /**
     * Render level filter pills
     */
    renderLevelFilters() {
        const levels = [
            { id: 'all', label: 'All', icon: '✨' },
            { id: 'beginner', label: 'Beginner', icon: '🌱' },
            { id: 'intermediate', label: 'Intermediate', icon: '🌿' },
            { id: 'advanced', label: 'Advanced', icon: '🌳' }
        ];
        
        return levels.map(level => `
            <button 
                class="pill ${this.currentFilter === level.id ? 'pill-active' : ''}"
                data-level="${level.id}"
                onclick="CoursesPage.setFilter('${level.id}')"
            >
                <span class="pill-icon">${level.icon}</span>
                <span class="pill-label">${level.label}</span>
            </button>
        `).join('');
    },
    
    /**
     * Render learning path roadmap
     */
    renderLearningPath() {
        if (!this.learningPath?.levels?.length) return '';
        
        return `
            <div class="learning-path-roadmap">
                <div class="path-header">
                    <h3>🛤️ Your Learning Journey</h3>
                    <p class="text-muted text-sm">Follow this structured path from beginner to production-ready AI engineer</p>
                </div>
                <div class="path-levels">
                    ${this.learningPath.levels.map((level, index) => `
                        <div class="path-level" style="--level-color: ${level.color};">
                            <div class="path-level-number">${level.level}</div>
                            <div class="path-level-content">
                                <div class="path-level-header">
                                    <span class="path-level-icon">${level.icon}</span>
                                    <div>
                                        <h4 class="path-level-title">${level.title}</h4>
                                        <span class="path-level-subtitle">${level.subtitle}</span>
                                    </div>
                                    <span class="path-level-duration">${level.duration}</span>
                                </div>
                                <p class="path-level-desc">${level.description}</p>
                                <div class="path-level-topics">
                                    ${level.sections.slice(0, 3).map(s => `<span class="tag tag-sm">${s.title}</span>`).join('')}
                                </div>
                            </div>
                            ${index < this.learningPath.levels.length - 1 ? '<div class="path-connector"></div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    /**
     * Toggle learning path visibility
     */
    togglePath() {
        this.showPath = !this.showPath;
        this.render();
    },
    
    /**
     * Add path styles
     */
    addPathStyles() {
        if (document.getElementById('path-styles')) return;
        const style = document.createElement('style');
        style.id = 'path-styles';
        style.textContent = `
            .learning-path-roadmap {
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-xl);
                padding: var(--space-6);
                margin-bottom: var(--space-6);
            }
            .path-header {
                text-align: center;
                margin-bottom: var(--space-6);
            }
            .path-header h3 {
                margin-bottom: var(--space-2);
            }
            .path-levels {
                display: flex;
                flex-direction: column;
                gap: var(--space-4);
            }
            .path-level {
                position: relative;
                display: flex;
                gap: var(--space-4);
                align-items: flex-start;
            }
            .path-level-number {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--level-color);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 1.1rem;
                flex-shrink: 0;
            }
            .path-level-content {
                flex: 1;
                background: var(--color-bg-tertiary);
                border-radius: var(--radius-lg);
                padding: var(--space-4);
                border-left: 3px solid var(--level-color);
            }
            .path-level-header {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                margin-bottom: var(--space-2);
            }
            .path-level-icon {
                font-size: 1.5rem;
            }
            .path-level-title {
                font-size: 1rem;
                margin: 0;
            }
            .path-level-subtitle {
                font-size: 0.8rem;
                color: var(--color-text-muted);
            }
            .path-level-duration {
                margin-left: auto;
                font-size: 0.75rem;
                color: var(--color-text-muted);
                background: var(--color-bg-secondary);
                padding: 2px 8px;
                border-radius: var(--radius-sm);
            }
            .path-level-desc {
                font-size: 0.85rem;
                color: var(--color-text-secondary);
                margin-bottom: var(--space-3);
            }
            .path-level-topics {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-2);
            }
            .path-connector {
                position: absolute;
                left: 20px;
                top: 45px;
                width: 2px;
                height: calc(100% - 20px);
                background: linear-gradient(to bottom, var(--level-color), var(--color-border));
            }
            @media (max-width: 768px) {
                .path-level-header {
                    flex-wrap: wrap;
                }
                .path-level-duration {
                    margin-left: 0;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    /**
     * Render courses list
     */
    renderCourses() {
        let courses = State.data.courses;
        
        // Apply search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            courses = courses.filter(c => 
                c.title.toLowerCase().includes(query) ||
                c.description?.toLowerCase().includes(query) ||
                c.level?.toLowerCase().includes(query)
            );
        }
        
        // Apply filter
        if (this.currentFilter !== 'all') {
            courses = courses.filter(c => c.level === this.currentFilter);
        }
        
        // Update result count
        const countEl = document.getElementById('courses-result-count');
        if (countEl) {
            countEl.textContent = `${courses.length} course${courses.length !== 1 ? 's' : ''}`;
        }
        
        if (courses.length === 0) {
            return `
                <div class="empty-state">
                    <span class="empty-icon">📚</span>
                    <h3>No courses found</h3>
                    <p class="text-muted">Try adjusting your search or filters</p>
                    <button class="action-btn action-btn-primary" onclick="CoursesPage.clearFilters()">Clear filters</button>
                </div>
            `;
        }
        
        if (this.currentView === 'grid') {
            return courses.map(course => this.renderCourseCard(course)).join('');
        } else {
            return courses.map(course => this.renderCourseListItem(course)).join('');
        }
    },
    
    /**
     * Render course card (grid view)
     */
    renderCourseCard(course) {
        const progress = Storage.getCourseProgress(course.id);
        const total = course.totalLessons || 10;
        const completed = progress.completed?.length || 0;
        const percent = Math.round((completed / total) * 100);
        
        const levelColors = {
            beginner: 'level-beginner',
            intermediate: 'level-intermediate',
            advanced: 'level-advanced'
        };
        
        return `
            <a href="#/courses/${course.id}" class="course-card">
                <div class="course-card-header">
                    <span class="course-icon">${course.icon || '📚'}</span>
                    <span class="course-level ${levelColors[course.level] || 'level-beginner'}">${course.level || 'Beginner'}</span>
                </div>
                <div class="course-card-body">
                    <h3 class="course-title">${Helpers.escapeHtml(course.title)}</h3>
                    <p class="course-description">${Helpers.escapeHtml(course.description || '')}</p>
                </div>
                <div class="course-card-footer">
                    <div class="course-progress">
                        <div class="progress-info">
                            <span>${completed}/${total} lessons</span>
                            <span>${percent}%</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${percent}%"></div>
                        </div>
                    </div>
                    <span class="course-action">${completed > 0 ? 'Continue' : 'Start'} →</span>
                </div>
            </a>
        `;
    },
    
    /**
     * Render course list item
     */
    renderCourseListItem(course) {
        const progress = Storage.getCourseProgress(course.id);
        const total = course.totalLessons || 10;
        const completed = progress.completed?.length || 0;
        const percent = Math.round((completed / total) * 100);
        
        return `
            <a href="#/courses/${course.id}" class="course-list-item">
                <span class="course-list-icon">${course.icon || '📚'}</span>
                <div class="course-list-info">
                    <div class="course-list-title">${Helpers.escapeHtml(course.title)}</div>
                    <div class="course-list-meta">${course.level || 'beginner'} · ${total} lessons</div>
                </div>
                <div class="course-list-progress">
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <span class="progress-text">${percent}%</span>
                </div>
                <span class="course-list-action">${completed > 0 ? 'Continue' : 'Start'} →</span>
            </a>
        `;
    },
    
    /**
     * Handle search input
     */
    handleSearch(query) {
        this.searchQuery = query;
        const container = document.getElementById('courses-container');
        if (container) {
            container.innerHTML = this.renderCourses();
        }
        // Update clear button visibility
        const searchWrapper = document.querySelector('.search-wrapper');
        if (searchWrapper) {
            const existingClear = searchWrapper.querySelector('.search-clear');
            if (query && !existingClear) {
                const btn = document.createElement('button');
                btn.className = 'search-clear';
                btn.textContent = '✕';
                btn.onclick = () => this.clearSearch();
                searchWrapper.appendChild(btn);
            } else if (!query && existingClear) {
                existingClear.remove();
            }
        }
        // Update clear filters button
        this.updateClearButton();
    },
    
    /**
     * Clear search
     */
    clearSearch() {
        this.searchQuery = '';
        const input = document.getElementById('courses-search');
        if (input) input.value = '';
        this.render();
    },
    
    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.render();
    },
    
    /**
     * Update clear button visibility
     */
    updateClearButton() {
        const filtersEl = document.querySelector('.courses-filters');
        if (!filtersEl) return;
        
        const existingClear = filtersEl.querySelector('.filter-clear');
        const needsClear = this.currentFilter !== 'all' || this.searchQuery;
        
        if (needsClear && !existingClear) {
            const btn = document.createElement('button');
            btn.className = 'filter-clear';
            btn.textContent = 'Clear filters';
            btn.onclick = () => this.clearFilters();
            filtersEl.appendChild(btn);
        } else if (!needsClear && existingClear) {
            existingClear.remove();
        }
    },
    
    /**
     * Set view mode
     */
    setView(view) {
        this.currentView = view;
        Storage.setViewMode('courses', view);
        this.render();
    },
    
    /**
     * Set filter
     */
    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
    },
    
    /**
     * Render single course detail
     */
    async renderCourse(courseId) {
        window.scrollTo(0, 0);
        const main = document.getElementById('main');
        
        // Show loading
        main.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading course...</p>
            </div>
        `;
        
        // Load course data
        const course = await State.getCourse(courseId);
        
        if (!course) {
            // Show placeholder for courses not yet created
            main.innerHTML = `
                <div style="margin-bottom: var(--space-4);">
                    <a href="#/courses" class="btn btn-ghost btn-sm">← Back to Courses</a>
                </div>
                
                ${Components.emptyState(
                    '🚧',
                    'Course Coming Soon',
                    'This course is currently being developed. Check back soon!',
                    '<a href="#/courses" class="btn btn-primary">Browse Other Courses</a>'
                )}
            `;
            return;
        }
        
        // Track as recent
        Storage.addRecent({
            id: courseId,
            type: 'course',
            title: course.title,
            icon: course.icon || '📚',
            url: `#/courses/${courseId}`
        });
        
        const progress = Storage.getCourseProgress(courseId);
        // Support both modules array and direct lessons array
        let modules = course.modules || [];
        if (modules.length === 0 && course.lessons?.length > 0) {
            // Convert flat lessons to a single module
            modules = [{
                title: 'Course Content',
                description: course.description || '',
                lessons: course.lessons
            }];
        }
        const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
        const completedCount = progress.completed?.length || 0;
        const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        
        main.innerHTML = `
            <div style="margin-bottom: var(--space-4);">
                <a href="#/courses" class="btn btn-ghost btn-sm">← Back to Courses</a>
            </div>
            
            <!-- Course Header -->
            <div class="card" style="margin-bottom: var(--space-6);">
                <div style="display: flex; gap: var(--space-6); align-items: flex-start; flex-wrap: wrap;">
                    <div style="font-size: 4rem;">${course.icon || '📚'}</div>
                    <div style="flex: 1; min-width: 300px;">
                        <span class="tag tag-primary">${course.level || 'beginner'}</span>
                        <h1 style="margin: var(--space-3) 0;">${Helpers.escapeHtml(course.title)}</h1>
                        <p class="text-secondary">${Helpers.escapeHtml(course.description || '')}</p>
                        <div style="display: flex; gap: var(--space-6); margin-top: var(--space-4);">
                            <span class="text-muted">📖 ${totalLessons} lessons</span>
                            <span class="text-muted">⏱️ ${course.duration || '4 weeks'}</span>
                            <span class="text-muted">✓ ${completedCount} completed</span>
                        </div>
                        <div style="margin-top: var(--space-4); max-width: 400px;">
                            ${Components.progressBar(percent, 'Your Progress')}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modules -->
            <div class="modules-list">
                ${modules.map((module, moduleIndex) => this.renderModule(courseId, module, moduleIndex, progress)).join('')}
            </div>
        `;
    },
    
    /**
     * Render course module
     */
    renderModule(courseId, module, moduleIndex, progress) {
        const lessons = module.lessons || [];
        const completedLessons = lessons.filter(l => 
            progress.completed?.includes(`${moduleIndex}-${l.id || lessons.indexOf(l)}`)
        );
        const isComplete = completedLessons.length === lessons.length && lessons.length > 0;
        
        return `
            <div class="card" style="margin-bottom: var(--space-4);">
                <div class="card-header" style="margin-bottom: var(--space-4);">
                    <div>
                        <span class="tag">${isComplete ? '✓ Complete' : `Module ${moduleIndex + 1}`}</span>
                        <h3 style="margin-top: var(--space-2);">${Helpers.escapeHtml(module.title)}</h3>
                        ${module.description ? `<p class="text-muted text-sm">${Helpers.escapeHtml(module.description)}</p>` : ''}
                    </div>
                    <span class="text-muted">${completedLessons.length}/${lessons.length}</span>
                </div>
                
                <div class="list">
                    ${lessons.map((lesson, lessonIndex) => {
                        const lessonId = `${moduleIndex}-${lesson.id || lessonIndex}`;
                        const isCompleted = progress.completed?.includes(lessonId);
                        
                        return `
                            <div class="list-item" style="padding: var(--space-3);">
                                <button 
                                    class="btn btn-icon ${isCompleted ? 'btn-primary' : 'btn-ghost'}"
                                    onclick="CoursesPage.toggleLesson('${courseId}', '${lessonId}')"
                                    style="width: 32px; height: 32px; font-size: 14px;"
                                >
                                    ${isCompleted ? '✓' : '○'}
                                </button>
                                <div style="flex: 1;">
                                    <div style="font-weight: 500; ${isCompleted ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${Helpers.escapeHtml(lesson.title)}</div>
                                    <div class="text-muted text-sm">${lesson.type || 'lesson'} • ${lesson.duration || '10 min'}</div>
                                </div>
                                <a href="#/courses/${courseId}/${moduleIndex}/${lessonIndex}" class="btn btn-ghost btn-sm">
                                    ${isCompleted ? 'Review' : 'Start'} →
                                </a>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    /**
     * Toggle lesson completion
     */
    toggleLesson(courseId, lessonId) {
        const progress = Storage.getCourseProgress(courseId);
        const isCompleted = progress.completed?.includes(lessonId);
        
        Storage.setCourseProgress(courseId, lessonId, !isCompleted);
        
        // Show toast
        Components.toast(
            isCompleted ? 'Lesson marked as incomplete' : 'Lesson completed! 🎉',
            isCompleted ? 'info' : 'success'
        );
        
        // Re-render
        this.renderCourse(courseId);
    },
    
    /**
     * Render lesson content (handles both string and structured content)
     */
    renderLessonContent(lesson) {
        // Handle quiz type
        if (lesson.type === 'quiz' && lesson.questions?.length) {
            return this.renderQuizContent(lesson.questions);
        }
        
        // Handle project type
        if (lesson.type === 'project' && !lesson.content) {
            return this.renderProjectPlaceholder(lesson);
        }
        
        const content = lesson.content;
        
        // If content is a simple string, return it
        if (typeof content === 'string') {
            return content || '<p>Lesson content coming soon...</p>';
        }
        
        // If content is not an object, show placeholder
        if (!content || typeof content !== 'object') {
            return '<p>Lesson content coming soon...</p>';
        }
        
        // Handle array format (used by math-for-ai course)
        if (Array.isArray(content)) {
            return this.renderArrayContent(content);
        }
        
        // Render structured content
        let html = '';
        
        // Overview
        if (content.overview) {
            html += `
                <div class="lesson-overview" style="
                    background: var(--color-surface);
                    border-left: 4px solid var(--color-accent);
                    padding: var(--space-4) var(--space-5);
                    margin-bottom: var(--space-6);
                    border-radius: var(--radius-md);
                ">
                    <p style="margin: 0; font-size: 1.1rem;">${Helpers.escapeHtml(content.overview)}</p>
                </div>
            `;
        }
        
        // Sections
        if (content.sections?.length) {
            content.sections.forEach(section => {
                // Support both `code` (string) and `codeExample` (object with language & code)
                const codeContent = section.code || section.codeExample?.code || '';
                const codeLanguage = section.codeExample?.language || 'javascript';
                
                // Support keyPoints array in section
                const keyPointsHtml = section.keyPoints?.length ? `
                    <ul style="margin: var(--space-4) 0; padding-left: var(--space-5);">
                        ${section.keyPoints.map(p => `<li style="margin-bottom: var(--space-2);">${Helpers.escapeHtml(p)}</li>`).join('')}
                    </ul>
                ` : '';
                
                // Render diagram if present
                const diagramHtml = section.diagram ? `
                    <div class="lesson-diagram" style="margin: var(--space-5) 0;">
                        ${section.diagram.title ? `<div style="font-weight: 600; margin-bottom: var(--space-3); color: var(--color-text-secondary); display: flex; align-items: center; gap: var(--space-2);"><span>📊</span> ${Helpers.escapeHtml(section.diagram.title)}</div>` : ''}
                        <div class="mermaid-container" style="
                            background: var(--color-surface);
                            border: 1px solid var(--color-border);
                            border-radius: var(--radius-lg);
                            padding: var(--space-5);
                            overflow-x: auto;
                            text-align: center;
                        ">
                            <div class="mermaid-diagram" data-mermaid="${Helpers.escapeHtmlAttr(section.diagram.code || '')}"></div>
                        </div>
                    </div>
                ` : '';
                
                html += `
                    <div class="lesson-section" style="margin-bottom: var(--space-8);">
                        <h2 style="color: var(--color-text-primary); margin-bottom: var(--space-4);">
                            ${Helpers.escapeHtml(section.title)}
                        </h2>
                        <div style="margin-bottom: var(--space-4); white-space: pre-wrap;">
                            ${this.renderMarkdown(section.content || '')}
                        </div>
                        ${diagramHtml}
                        ${keyPointsHtml}
                        ${codeContent ? `
                            <div class="code-block" style="
                                background: var(--color-bg-tertiary);
                                border: 1px solid var(--color-border);
                                border-radius: var(--radius-md);
                                padding: var(--space-4);
                                overflow-x: auto;
                                margin-top: var(--space-4);
                                position: relative;
                            ">
                                <div style="position: absolute; top: 8px; right: 12px; display: flex; gap: 8px; align-items: center;">
                                    <span style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase;">${codeLanguage}</span>
                                    <button onclick="CoursesPage.copyCode(this)" style="
                                        background: transparent; 
                                        border: 1px solid var(--color-border); 
                                        border-radius: 4px; 
                                        color: var(--color-text-muted); 
                                        cursor: pointer; 
                                        padding: 2px 6px; 
                                        font-size: 0.75rem;
                                        display: flex;
                                        align-items: center;
                                        gap: 4px;
                                        transition: all 0.2s;
                                    " onmouseover="this.style.background='var(--color-bg-secondary)'" onmouseout="this.style.background='transparent'">
                                        <span>📋</span> Copy
                                    </button>
                                </div>
                                <pre style="margin: 0; color: var(--color-text-primary); font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.875rem; line-height: 1.6;"><code>${Helpers.escapeHtml(codeContent)}</code></pre>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        }
        
        // Key Takeaways
        if (content.keyTakeaways?.length) {
            html += `
                <div class="key-takeaways" style="
                    background: var(--color-gradient-primary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-5);
                    margin-top: var(--space-6);
                ">
                    <h3 style="margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);">
                        💡 Key Takeaways
                    </h3>
                    <ul style="margin: 0; padding-left: var(--space-5);">
                        ${content.keyTakeaways.map(t => `<li style="margin-bottom: var(--space-2);">${Helpers.escapeHtml(t)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Exercises
        if (content.exercises?.length) {
            html += `
                <div class="exercises" style="margin-top: var(--space-6);">
                    <h3 style="margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);">
                        🏋️ Exercises
                    </h3>
                    <div class="list" style="border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                        ${content.exercises.map(ex => `
                            <div class="list-item" style="padding: var(--space-4);">
                                <span style="font-size: 1.25rem;">📝</span>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">${Helpers.escapeHtml(ex.title)}</div>
                                    <div class="text-muted text-sm">${Helpers.escapeHtml(ex.description)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Sources
        if (content.sources?.length) {
            html += `
                <div class="sources" style="margin-top: var(--space-6); padding-top: var(--space-6); border-top: 1px solid var(--color-border);">
                    <h3 style="margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);">
                        📚 Sources & Further Reading
                    </h3>
                    <div class="list" style="border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                        ${content.sources.map(s => `
                            <a href="${s.url || '#'}" target="_blank" rel="noopener" class="list-item" style="padding: var(--space-3);">
                                <span>🔗</span>
                                <div style="flex: 1;">
                                    <div style="font-weight: 500;">${Helpers.escapeHtml(s.title)}</div>
                                    ${s.author ? `<div class="text-muted text-sm">by ${Helpers.escapeHtml(s.author)}</div>` : ''}
                                </div>
                                <span class="text-muted">↗</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        return html || '<p>Lesson content coming soon...</p>';
    },
    
    /**
     * Simple markdown-like rendering for content
     */
    renderMarkdown(text) {
        if (!text) return '';
        
        let html = Helpers.escapeHtml(text);
        
        // Convert markdown-style formatting
        html = html
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code style="background: var(--color-surface); padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">$1</code>')
            // Headers in content (##)
            .replace(/^### (.+)$/gm, '<h4 style="margin-top: var(--space-4);">$1</h4>')
            .replace(/^## (.+)$/gm, '<h3 style="margin-top: var(--space-4);">$1</h3>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        return `<p>${html}</p>`;
    },

    /**
     * Render array-format content (text blocks, code blocks, and diagrams)
     */
    renderArrayContent(contentArray) {
        if (!contentArray || !contentArray.length) {
            return '<p>Lesson content coming soon...</p>';
        }
        
        let html = '';
        
        contentArray.forEach(block => {
            if (block.type === 'text') {
                // Render markdown-style text content
                html += `
                    <div class="lesson-text-block" style="margin-bottom: var(--space-6);">
                        ${this.renderMarkdownAdvanced(block.content || '')}
                    </div>
                `;
            } else if (block.type === 'code') {
                // Render code block
                const language = block.language || 'python';
                const title = block.title || '';
                html += `
                    <div class="lesson-code-block" style="margin-bottom: var(--space-6);">
                        ${title ? `<div style="font-weight: 600; margin-bottom: var(--space-2); color: var(--color-text-secondary);">${Helpers.escapeHtml(title)}</div>` : ''}
                        <div class="code-block" style="
                            background: var(--color-bg-tertiary);
                            border: 1px solid var(--color-border);
                            border-radius: var(--radius-md);
                            padding: var(--space-4);
                            overflow-x: auto;
                            position: relative;
                        ">
                            <div style="position: absolute; top: 8px; right: 12px; display: flex; gap: 8px; align-items: center;">
                                <span style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase;">${language}</span>
                                <button onclick="CoursesPage.copyCode(this)" style="
                                    background: transparent; 
                                    border: 1px solid var(--color-border); 
                                    border-radius: 4px; 
                                    color: var(--color-text-muted); 
                                    cursor: pointer; 
                                    padding: 2px 6px; 
                                    font-size: 0.75rem;
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                    transition: all 0.2s;
                                " onmouseover="this.style.background='var(--color-bg-secondary)'" onmouseout="this.style.background='transparent'">
                                    <span>📋</span> Copy
                                </button>
                            </div>
                            <pre style="margin: 0; color: var(--color-text-primary); font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.875rem; line-height: 1.6;"><code>${Helpers.escapeHtml(block.code || '')}</code></pre>
                        </div>
                    </div>
                `;
            } else if (block.type === 'mermaid' || block.type === 'diagram') {
                // Render Mermaid diagram
                const title = block.title || '';
                const diagramCode = block.code || block.content || '';
                html += `
                    <div class="lesson-diagram-block" style="margin-bottom: var(--space-6);">
                        ${title ? `<div style="font-weight: 600; margin-bottom: var(--space-3); color: var(--color-text-secondary); display: flex; align-items: center; gap: var(--space-2);"><span>📊</span> ${Helpers.escapeHtml(title)}</div>` : ''}
                        <div class="mermaid-container" style="
                            background: var(--color-surface);
                            border: 1px solid var(--color-border);
                            border-radius: var(--radius-lg);
                            padding: var(--space-5);
                            overflow-x: auto;
                            text-align: center;
                        ">
                            <div class="mermaid-diagram" data-mermaid="${Helpers.escapeHtmlAttr(diagramCode)}"></div>
                        </div>
                    </div>
                `;
            }
        });
        
        return html || '<p>Lesson content coming soon...</p>';
    },

    /**
     * Advanced markdown rendering with math and mermaid support
     */
    renderMarkdownAdvanced(text) {
        if (!text) return '';
        
        // First, protect special blocks from HTML escaping
        const mathBlocks = [];
        const mermaidBlocks = [];
        let processed = text;
        
        // Extract mermaid code blocks (```mermaid ... ```)
        processed = processed.replace(/```mermaid\n([\s\S]*?)```/g, (match, code) => {
            mermaidBlocks.push(code.trim());
            return `%%MERMAID_BLOCK_${mermaidBlocks.length - 1}%%`;
        });
        
        // Extract display math ($$...$$)
        processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
            mathBlocks.push({ type: 'display', content: math });
            return `%%MATH_BLOCK_${mathBlocks.length - 1}%%`;
        });
        
        // Extract inline math ($...$)
        processed = processed.replace(/\$([^$\n]+)\$/g, (match, math) => {
            mathBlocks.push({ type: 'inline', content: math });
            return `%%MATH_BLOCK_${mathBlocks.length - 1}%%`;
        });
        
        // Now escape HTML
        let html = Helpers.escapeHtml(processed);
        
        // Apply markdown formatting
        html = html
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Inline code (but not math placeholders)
            .replace(/`([^`]+)`/g, '<code style="background: var(--color-surface); padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">$1</code>')
            // Headers
            .replace(/^### (.+)$/gm, '</p><h4 style="margin-top: var(--space-5); margin-bottom: var(--space-3); color: var(--color-text-primary);">$1</h4><p>')
            .replace(/^## (.+)$/gm, '</p><h3 style="margin-top: var(--space-6); margin-bottom: var(--space-3); color: var(--color-text-primary);">$1</h3><p>')
            // Lists
            .replace(/^- (.+)$/gm, '<li style="margin-left: var(--space-4);">$1</li>')
            // Line breaks
            .replace(/\n\n/g, '</p><p style="margin-bottom: var(--space-3);">')
            .replace(/\n/g, '<br>');
        
        // Restore mermaid blocks
        mermaidBlocks.forEach((code, index) => {
            const placeholder = `%%MERMAID_BLOCK_${index}%%`;
            html = html.replace(placeholder, `
                <div class="mermaid-container" style="
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-5);
                    margin: var(--space-4) 0;
                    overflow-x: auto;
                    text-align: center;
                ">
                    <div class="mermaid-diagram" data-mermaid="${Helpers.escapeHtmlAttr(code)}"></div>
                </div>
            `);
        });
        
        // Restore math blocks
        mathBlocks.forEach((block, index) => {
            const placeholder = `%%MATH_BLOCK_${index}%%`;
            if (block.type === 'display') {
                html = html.replace(placeholder, `<div class="math-display" style="text-align: center; margin: var(--space-4) 0; font-size: 1.1em; overflow-x: auto;">\\[${block.content}\\]</div>`);
            } else {
                html = html.replace(placeholder, `<span class="math-inline">\\(${block.content}\\)</span>`);
            }
        });
        
        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '').replace(/<p style="[^"]*"><\/p>/g, '');
        
        return `<div style="line-height: 1.7; color: var(--color-text-secondary);"><p>${html}</p></div>`;
    },

    /**
     * Render quiz content with interactive questions
     */
    renderQuizContent(questions) {
        if (!questions || !questions.length) {
            return '<p>No quiz questions available.</p>';
        }
        
        let html = `
            <div class="quiz-container" style="margin-bottom: var(--space-6);">
                <div class="quiz-intro" style="
                    background: var(--color-gradient-primary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-5);
                    margin-bottom: var(--space-6);
                ">
                    <h3 style="margin-bottom: var(--space-2); display: flex; align-items: center; gap: var(--space-2);">
                        📝 Quiz Time!
                    </h3>
                    <p style="margin: 0; color: var(--color-text-secondary);">
                        Test your knowledge with ${questions.length} questions. Click on an answer to check if you're correct.
                    </p>
                </div>
        `;
        
        questions.forEach((q, index) => {
            const questionId = `quiz-q-${index}`;
            html += `
                <div class="quiz-question" style="
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-5);
                    margin-bottom: var(--space-4);
                " data-question-index="${index}" data-correct="${q.correct}">
                    <div style="font-weight: 600; margin-bottom: var(--space-4); color: var(--color-text-primary);">
                        <span style="color: var(--color-accent);">Q${index + 1}.</span> ${Helpers.escapeHtml(q.question)}
                    </div>
                    <div class="quiz-options" style="display: flex; flex-direction: column; gap: var(--space-2);">
                        ${q.options.map((opt, optIndex) => `
                            <button 
                                class="quiz-option" 
                                style="
                                    text-align: left;
                                    padding: var(--space-3) var(--space-4);
                                    background: var(--color-bg);
                                    border: 1px solid var(--color-border);
                                    border-radius: var(--radius-md);
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    color: var(--color-text-primary);
                                "
                                data-option-index="${optIndex}"
                                onclick="CoursesPage.checkQuizAnswer(this, ${index}, ${optIndex}, ${q.correct})"
                                onmouseover="this.style.borderColor='var(--color-accent)'"
                                onmouseout="if(!this.classList.contains('selected')) this.style.borderColor='var(--color-border)'"
                            >
                                <span style="font-weight: 600; margin-right: var(--space-2); color: var(--color-text-muted);">
                                    ${String.fromCharCode(65 + optIndex)}.
                                </span>
                                ${Helpers.escapeHtml(opt)}
                            </button>
                        `).join('')}
                    </div>
                    <div class="quiz-explanation" style="
                        display: none;
                        margin-top: var(--space-4);
                        padding: var(--space-4);
                        background: var(--color-bg-tertiary);
                        border-radius: var(--radius-md);
                        color: var(--color-text-secondary);
                    ">
                        <strong>💡 Explanation:</strong> ${Helpers.escapeHtml(q.explanation || '')}
                    </div>
                </div>
            `;
        });
        
        html += `
            <div class="quiz-results" id="quiz-results" style="display: none;">
                <div style="
                    background: var(--color-gradient-success);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-5);
                    text-align: center;
                ">
                    <h3 style="margin-bottom: var(--space-2);">🎉 Quiz Complete!</h3>
                    <p id="quiz-score" style="font-size: 1.25rem; color: var(--color-text-primary);"></p>
                </div>
            </div>
        </div>
        `;
        
        return html;
    },

    /**
     * Check quiz answer
     */
    checkQuizAnswer(button, questionIndex, selectedOption, correctOption) {
        const questionEl = button.closest('.quiz-question');
        const options = questionEl.querySelectorAll('.quiz-option');
        const explanationEl = questionEl.querySelector('.quiz-explanation');
        
        // Disable all options for this question
        options.forEach((opt, idx) => {
            opt.disabled = true;
            opt.style.cursor = 'default';
            opt.onclick = null;
            
            if (idx === correctOption) {
                opt.classList.add('quiz-option-correct');
            } else if (idx === selectedOption && selectedOption !== correctOption) {
                opt.classList.add('quiz-option-incorrect');
            }
        });
        
        // Show explanation
        if (explanationEl) {
            explanationEl.style.display = 'block';
        }
        
        // Track score
        if (!window.quizAnswers) window.quizAnswers = {};
        window.quizAnswers[questionIndex] = selectedOption === correctOption;
        
        // Check if all questions answered
        const totalQuestions = document.querySelectorAll('.quiz-question').length;
        const answeredQuestions = Object.keys(window.quizAnswers).length;
        
        if (answeredQuestions === totalQuestions) {
            const correct = Object.values(window.quizAnswers).filter(v => v).length;
            const resultsEl = document.getElementById('quiz-results');
            const scoreEl = document.getElementById('quiz-score');
            
            if (resultsEl && scoreEl) {
                const percentage = Math.round((correct / totalQuestions) * 100);
                scoreEl.textContent = `You got ${correct} out of ${totalQuestions} correct (${percentage}%)`;
                resultsEl.style.display = 'block';
                resultsEl.scrollIntoView({ behavior: 'smooth' });
            }
        }
    },

    /**
     * Render project placeholder
     */
    renderProjectPlaceholder(lesson) {
        return `
            <div class="project-container">
                <div style="
                    background: var(--color-gradient-warning);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-6);
                    text-align: center;
                ">
                    <span style="font-size: 3rem;">🛠️</span>
                    <h3 style="margin: var(--space-4) 0 var(--space-2);">Capstone Project</h3>
                    <p style="color: var(--color-text-secondary); max-width: 500px; margin: 0 auto;">
                        This hands-on project will help you apply everything you've learned in this module.
                        Detailed project instructions coming soon!
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Build sidebar navigation for lessons
     */
    buildLessonSidebar(courseId, modules, currentModuleIndex, currentLessonIndex, progress) {
        const completedLessons = progress.completed || [];
        
        let sidebarHtml = modules.map((mod, modIdx) => {
            const isCurrentModule = modIdx === currentModuleIndex;
            const lessonsHtml = mod.lessons.map((les, lesIdx) => {
                const lessonId = `${modIdx}-${les.id || lesIdx}`;
                const isCurrent = modIdx === currentModuleIndex && lesIdx === currentLessonIndex;
                const isComplete = completedLessons.includes(lessonId);
                
                return `
                    <a href="#/courses/${courseId}/${modIdx}/${lesIdx}" 
                       class="sidebar-lesson ${isCurrent ? 'active' : ''}"
                       style="
                           display: flex;
                           align-items: center;
                           gap: var(--space-2);
                           padding: var(--space-2) var(--space-3);
                           margin-left: var(--space-3);
                           font-size: var(--text-sm);
                           color: ${isCurrent ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)'};
                           background: ${isCurrent ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};
                           border-radius: var(--radius-md);
                           border-left: 2px solid ${isCurrent ? 'var(--color-accent-primary)' : 'transparent'};
                           transition: all var(--transition-fast);
                           text-decoration: none;
                       "
                       onmouseover="if(!this.classList.contains('active')) this.style.background='var(--color-bg-hover)'"
                       onmouseout="if(!this.classList.contains('active')) this.style.background='transparent'"
                    >
                        <span style="font-size: 0.75rem;">${isComplete ? '✓' : '○'}</span>
                        <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${Helpers.escapeHtml(les.title)}</span>
                        <span style="font-size: 0.7rem; color: var(--color-text-muted);">${les.duration || ''}</span>
                    </a>
                `;
            }).join('');
            
            return `
                <div class="sidebar-module" style="margin-bottom: var(--space-4);">
                    <div style="
                        font-weight: 600;
                        font-size: var(--text-sm);
                        color: ${isCurrentModule ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'};
                        padding: var(--space-2) var(--space-3);
                        display: flex;
                        align-items: center;
                        gap: var(--space-2);
                    ">
                        <span style="
                            width: 20px;
                            height: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: ${isCurrentModule ? 'var(--color-accent-primary)' : 'var(--color-bg-tertiary)'};
                            color: ${isCurrentModule ? 'white' : 'var(--color-text-muted)'};
                            border-radius: var(--radius-sm);
                            font-size: 0.7rem;
                            font-weight: 700;
                        ">${modIdx + 1}</span>
                        <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${Helpers.escapeHtml(mod.title)}</span>
                    </div>
                    <div class="sidebar-lessons" style="display: flex; flex-direction: column; gap: 2px; margin-top: var(--space-1);">
                        ${lessonsHtml}
                    </div>
                </div>
            `;
        }).join('');
        
        return sidebarHtml;
    },

    /**
     * Render lesson detail
     */
    async renderLesson(courseId, moduleIndex, lessonIndex) {
        window.scrollTo(0, 0);
        const main = document.getElementById('main');
        
        const course = await State.getCourse(courseId);
        if (!course) {
            main.innerHTML = Components.emptyState(
                '🔍',
                'Course not found',
                'The requested course could not be found.',
                `<a href="#/courses" class="btn btn-primary">Back to Courses</a>`
            );
            return;
        }
        
        // Support both modules array and direct lessons array
        let modules = course.modules || [];
        if (modules.length === 0 && course.lessons?.length > 0) {
            modules = [{
                title: 'Course Content',
                description: course.description || '',
                lessons: course.lessons
            }];
        }
        
        if (!modules[moduleIndex]?.lessons?.[lessonIndex]) {
            main.innerHTML = Components.emptyState(
                '🔍',
                'Lesson not found',
                'The requested lesson could not be found.',
                `<a href="#/courses/${courseId}" class="btn btn-primary">Back to Course</a>`
            );
            return;
        }
        
        const module = modules[moduleIndex];
        const lesson = module.lessons[lessonIndex];
        const lessonId = `${moduleIndex}-${lesson.id || lessonIndex}`;
        const progress = Storage.getCourseProgress(courseId);
        const isCompleted = progress.completed?.includes(lessonId);
        
        // Calculate prev/next
        const prevLesson = lessonIndex > 0 
            ? `#/courses/${courseId}/${moduleIndex}/${lessonIndex - 1}`
            : moduleIndex > 0 
                ? `#/courses/${courseId}/${moduleIndex - 1}/${modules[moduleIndex - 1].lessons.length - 1}`
                : null;
        
        const nextLesson = lessonIndex < module.lessons.length - 1
            ? `#/courses/${courseId}/${moduleIndex}/${lessonIndex + 1}`
            : moduleIndex < modules.length - 1
                ? `#/courses/${courseId}/${moduleIndex + 1}/0`
                : null;
        
        // Get sources from content object
        const sources = lesson.content?.sources || lesson.resources || [];
        
        // Calculate total lessons and current position
        let totalLessons = 0;
        let currentLessonNum = 0;
        modules.forEach((m, mi) => {
            m.lessons.forEach((l, li) => {
                totalLessons++;
                if (mi < moduleIndex || (mi === moduleIndex && li < lessonIndex)) {
                    currentLessonNum++;
                }
            });
        });
        currentLessonNum++; // 1-indexed
        
        // Build sidebar navigation
        const sidebarNav = this.buildLessonSidebar(courseId, modules, moduleIndex, lessonIndex, progress);
        
        main.innerHTML = `
            <div class="lesson-page-layout" style="
                display: grid;
                grid-template-columns: 280px 1fr;
                gap: var(--space-6);
                max-width: 100%;
                min-height: calc(100vh - var(--header-height) - var(--space-16));
            ">
                <!-- Sidebar Navigation -->
                <aside class="lesson-sidebar" style="
                    position: sticky;
                    top: calc(var(--header-height) + var(--space-4));
                    height: fit-content;
                    max-height: calc(100vh - var(--header-height) - var(--space-8));
                    overflow-y: auto;
                    padding: var(--space-4);
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                ">
                    <a href="#/courses/${courseId}" class="btn btn-ghost btn-sm" style="margin-bottom: var(--space-4); width: 100%; justify-content: flex-start;">
                        ← ${Helpers.escapeHtml(course.title)}
                    </a>
                    
                    <div style="
                        font-size: var(--text-xs);
                        color: var(--color-text-muted);
                        padding: var(--space-2) var(--space-3);
                        margin-bottom: var(--space-2);
                        border-bottom: 1px solid var(--color-border);
                    ">
                        COURSE CONTENT • ${currentLessonNum}/${totalLessons}
                    </div>
                    
                    <nav class="lesson-nav" style="display: flex; flex-direction: column;">
                        ${sidebarNav}
                    </nav>
                </aside>
                
                <!-- Main Content -->
                <article class="lesson-main-content" style="
                    min-width: 0;
                    max-width: 100%;
                ">
                    <div class="card" style="padding: var(--space-6);">
                        <header style="margin-bottom: var(--space-6);">
                            <div class="text-muted text-sm" style="margin-bottom: var(--space-2);">
                                Module ${moduleIndex + 1}: ${Helpers.escapeHtml(module.title)} • Lesson ${lessonIndex + 1}
                            </div>
                            <h1 style="font-size: var(--text-3xl); margin-bottom: var(--space-3);">${Helpers.escapeHtml(lesson.title)}</h1>
                            <div style="display: flex; gap: var(--space-4); flex-wrap: wrap;">
                                <span class="tag">${lesson.type || 'lesson'}</span>
                                <span class="text-muted">⏱️ ${lesson.duration || '10 min'}</span>
                                ${isCompleted ? '<span style="color: var(--color-success);">✓ Completed</span>' : ''}
                            </div>
                        </header>
                        
                        <div class="lesson-content" style="line-height: 1.8; color: var(--color-text-secondary);">
                            ${this.renderLessonContent(lesson)}
                        </div>
                        
                        <footer style="margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid var(--color-border);">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
                                ${prevLesson ? `<a href="${prevLesson}" class="btn btn-ghost">← Previous</a>` : '<div></div>'}
                                
                                <button 
                                    class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}"
                                    onclick="CoursesPage.toggleLesson('${courseId}', '${lessonId}')"
                                >
                                    ${isCompleted ? '✓ Completed' : 'Mark Complete'}
                                </button>
                                
                                ${nextLesson ? `<a href="${nextLesson}" class="btn btn-primary">Next →</a>` : '<div></div>'}
                            </div>
                        </footer>
                    </div>
                </article>
            </div>
            
            <style>
                /* Responsive: collapse sidebar on smaller screens */
                @media (max-width: 900px) {
                    .lesson-page-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .lesson-sidebar {
                        position: relative !important;
                        top: 0 !important;
                        max-height: none !important;
                    }
                }
                
                /* Scrollbar styling for sidebar */
                .lesson-sidebar::-webkit-scrollbar {
                    width: 4px;
                }
                .lesson-sidebar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .lesson-sidebar::-webkit-scrollbar-thumb {
                    background: var(--color-border);
                    border-radius: 2px;
                }
                .lesson-sidebar::-webkit-scrollbar-thumb:hover {
                    background: var(--color-text-muted);
                }
            </style>
        `;
        
        // Typeset math formulas and render mermaid diagrams after content is rendered
        setTimeout(() => {
            if (window.typesetMath) {
                window.typesetMath();
            }
            if (window.renderMermaidDiagrams) {
                window.renderMermaidDiagrams();
            }
        }, 100);
    },

    /**
     * Copy code to clipboard
     */
    async copyCode(button) {
        const wrapper = button?.closest?.('.code-block');
        const codeEl = wrapper?.querySelector?.('code');

        if (!codeEl) {
            Components.toast('Nothing to copy', 'error');
            return;
        }

        const code = codeEl.innerText;

        try {
            const ok = await Helpers.copyToClipboard(code);
            if (!ok) {
                Components.toast('Failed to copy code', 'error');
                return;
            }

            const originalHtml = button.innerHTML;
            button.innerHTML = '<span>✓</span> Copied!';
            button.style.color = 'var(--color-success)';
            button.style.borderColor = 'var(--color-success)';

            setTimeout(() => {
                button.innerHTML = originalHtml;
                button.style.color = 'var(--color-text-muted)';
                button.style.borderColor = 'var(--color-border)';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            Components.toast('Failed to copy code', 'error');
        }
    }
};

// Make available globally
window.CoursesPage = CoursesPage;
