/* ========================================
   NeuralPath - Application State
   ======================================== */

const State = {
    data: {
        courses: [],
        tools: [],
        toolCategories: [],
        graphs: [],
        jobs: [],
        careers: [],
        learningPaths: [],
        resources: [],
        searchIndex: []
    },
    
    loaded: {
        courses: false,
        tools: false,
        graphs: false,
        jobs: false,
        careers: false,
        learningPaths: false,
        resources: false
    },
    
    /**
     * Initialize state - load all data
     */
    async init() {
        // Load data in parallel
        await Promise.all([
            this.loadCourses(),
            this.loadTools(),
            this.loadGraphs(),
            this.loadCareers(),
            this.loadLearningPaths(),
            this.loadResources()
        ]);
        
        // Build search index
        this.buildSearchIndex();
    },
    
    /**
     * Load courses data
     */
    async loadCourses() {
        try {
            const response = await fetch('data/courses/index.json');
            if (response.ok) {
                const data = await response.json();
                this.data.courses = data.courses || [];
                this.loaded.courses = true;
            }
        } catch (e) {
            console.warn('Courses not loaded:', e);
            this.data.courses = [];
        }
    },
    
    /**
     * Load tools data
     */
    async loadTools() {
        try {
            const response = await fetch('data/tools.json');
            if (response.ok) {
                const data = await response.json();
                this.data.toolCategories = data.categories || [];
                this.data.tools = data.tools || [];
                this.loaded.tools = true;
            }
        } catch (e) {
            console.warn('Tools not loaded:', e);
            this.data.toolCategories = [];
            this.data.tools = [];
        }
    },
    
    /**
     * Load graphs data
     */
    async loadGraphs() {
        try {
            const response = await fetch('data/graphs/index.json');
            if (response.ok) {
                const data = await response.json();
                this.data.graphs = data.graphs || [];
                this.loaded.graphs = true;
            }
        } catch (e) {
            console.warn('Graphs not loaded:', e);
            this.data.graphs = [];
        }
    },
    
    /**
     * Load jobs data
     */
    async loadJobs() {
        if (this.loaded.jobs) return this.data.jobs;
        
        try {
            const response = await fetch('data/careers.json');
            if (response.ok) {
                this.data.jobs = await response.json();
                this.loaded.jobs = true;
            }
        } catch (e) {
            console.warn('Jobs not loaded:', e);
            this.data.jobs = [];
        }
        
        return this.data.jobs;
    },

    /**
     * Load careers data for stats
     */
    async loadCareers() {
        if (this.loaded.careers) return this.data.careers;
        
        try {
            const response = await fetch('data/careers.json');
            if (response.ok) {
                const data = await response.json();
                // Careers are in 'roles' array
                this.data.careers = data.roles || [];
                this.loaded.careers = true;
            }
        } catch (e) {
            console.warn('Careers not loaded:', e);
            this.data.careers = [];
        }
        
        return this.data.careers;
    },

    /**
     * Load learning paths data
     */
    async loadLearningPaths() {
        if (this.loaded.learningPaths) return this.data.learningPaths;
        
        try {
            const response = await fetch('data/learning-paths.json');
            if (response.ok) {
                const data = await response.json();
                this.data.learningPaths = data.learningPaths || [];
                this.loaded.learningPaths = true;
            }
        } catch (e) {
            console.warn('Learning paths not loaded:', e);
            this.data.learningPaths = [];
        }
        
        return this.data.learningPaths;
    },

    /**
     * Load resources data
     */
    async loadResources() {
        if (this.loaded.resources) return this.data.resources;
        
        try {
            const response = await fetch('data/resources.json');
            if (response.ok) {
                const data = await response.json();
                // Store the full data with categories
                this.data.resources = data;
                this.loaded.resources = true;
            }
        } catch (e) {
            console.warn('Resources not loaded:', e);
            this.data.resources = { categories: [] };
        }
        
        return this.data.resources;
    },
    
    /**
     * Build search index from all data
     */
    buildSearchIndex() {
        const index = [];
        
        // Add courses
        this.data.courses.forEach(course => {
            index.push({
                id: course.id,
                type: 'course',
                title: course.title,
                description: course.description || '',
                icon: '📚',
                url: `#/courses/${course.id}`
            });
        });
        
        // Add tools
        const toolCategoryMap = {};
        (this.data.toolCategories || []).forEach(cat => {
            toolCategoryMap[cat.id] = cat;
        });

        (this.data.tools || []).forEach(tool => {
            const cat = toolCategoryMap[tool.category] || {};
            index.push({
                id: tool.id,
                type: 'tool',
                title: tool.name,
                description: tool.description || '',
                icon: tool.icon || cat.icon || '🔧',
                url: tool.url,
                category: cat.title || tool.category || ''
            });
        });
        
        // Add graphs
        this.data.graphs.forEach(graph => {
            index.push({
                id: graph.id,
                type: 'graph',
                title: graph.title,
                description: `${graph.nodes} nodes, ${graph.edges} edges`,
                icon: graph.icon || '🗺️',
                url: `#/explore/${graph.id}`
            });
        });
        
        this.data.searchIndex = index;
    },
    
    /**
     * Search across all content
     */
    search(query) {
        if (!query || query.length < 2) return [];
        
        const results = this.data.searchIndex
            .map(item => ({
                ...item,
                score: Helpers.fuzzyMatch(item.title, query) +
                       Helpers.fuzzyMatch(item.description, query) * 0.5
            }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);
        
        return results;
    },
    
    /**
     * Get all tools flat (enriched with category info)
     */
    getAllTools() {
        // Create category lookup map
        const categoryMap = {};
        (this.data.toolCategories || []).forEach(cat => {
            categoryMap[cat.id] = cat;
        });
        
        // Return tools enriched with category data
        return (this.data.tools || []).map(tool => {
            const cat = categoryMap[tool.category] || {};
            return {
                ...tool,
                categoryTitle: cat.title || tool.category,
                categoryIcon: cat.icon || '🔧',
                categoryColor: cat.color || '#6366f1'
            };
        });
    },
    
    /**
     * Get tool categories with counts
     */
    getToolCategories() {
        // Count tools per category
        const counts = {};
        (this.data.tools || []).forEach(tool => {
            counts[tool.category] = (counts[tool.category] || 0) + 1;
        });
        
        return (this.data.toolCategories || []).map(cat => ({
            id: cat.id,
            title: cat.title,
            icon: cat.icon,
            color: cat.color,
            count: counts[cat.id] || 0
        }));
    },
    
    /**
     * Get single course
     */
    async getCourse(id) {
        try {
            const response = await fetch(`data/courses/${id}.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.warn('Course not found:', id);
        }
        return null;
    },
    
    /**
     * Get single graph
     */
    async getGraph(id) {
        try {
            const response = await fetch(`data/graphs/${id}.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.warn('Graph not found:', id);
        }
        return null;
    },
    
    /**
     * Get stats for dashboard
     */
    getStats() {
        const toolCount = this.getAllTools().length;
        const courseCount = this.data.courses.length;
        const graphCount = this.data.graphs.length;
        const careerCount = this.data.careers?.length || 0;
        const learningPathCount = this.data.learningPaths.length;
        
        // Count resources from categories
        let resourceCount = 0;
        if (this.data.resources?.categories) {
            resourceCount = this.data.resources.categories.reduce((sum, cat) => 
                sum + (cat.items?.length || 0), 0);
        }
        
        // Get user progress
        const progress = Storage.get('course_progress', {});
        const completedLessons = Object.values(progress)
            .reduce((sum, p) => sum + (p.completed?.length || 0), 0);
        
        return {
            tools: toolCount,
            courses: courseCount,
            graphs: graphCount,
            careers: careerCount,
            learningPaths: learningPathCount,
            resources: resourceCount,
            completedLessons
        };
    }
};

// Make available globally
window.State = State;
