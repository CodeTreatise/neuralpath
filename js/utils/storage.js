/* ========================================
   NeuralPath - Local Storage Utilities
   ======================================== */

const Storage = {
    PREFIX: 'neuralpath_',
    
    /**
     * Get item from localStorage with prefix
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.PREFIX + key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (e) {
            console.warn('Storage.get error:', e);
            return defaultValue;
        }
    },
    
    /**
     * Set item in localStorage with prefix
     */
    set(key, value) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Storage.set error:', e);
            return false;
        }
    },
    
    /**
     * Remove item from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(this.PREFIX + key);
            return true;
        } catch (e) {
            console.warn('Storage.remove error:', e);
            return false;
        }
    },
    
    /**
     * Clear all NeuralPath data
     */
    clear() {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.PREFIX))
                .forEach(key => localStorage.removeItem(key));
            return true;
        } catch (e) {
            console.warn('Storage.clear error:', e);
            return false;
        }
    },
    
    // ---- Specific Storage Methods ----
    
    /**
     * Get/set theme preference
     */
    getTheme() {
        return this.get('theme', 'dark');
    },
    
    setTheme(theme) {
        return this.set('theme', theme);
    },
    
    /**
     * Get/set bookmarks
     */
    getBookmarks() {
        return this.get('bookmarks', []);
    },
    
    addBookmark(item) {
        const bookmarks = this.getBookmarks();
        if (!bookmarks.find(b => b.id === item.id && b.type === item.type)) {
            bookmarks.push({ ...item, savedAt: Date.now() });
            this.set('bookmarks', bookmarks);
        }
        return bookmarks;
    },
    
    removeBookmark(id, type) {
        const bookmarks = this.getBookmarks().filter(
            b => !(b.id === id && b.type === type)
        );
        this.set('bookmarks', bookmarks);
        return bookmarks;
    },
    
    isBookmarked(id, type) {
        return this.getBookmarks().some(b => b.id === id && b.type === type);
    },
    
    /**
     * Get/set course progress
     */
    getCourseProgress(courseId) {
        const progress = this.get('course_progress', {});
        return progress[courseId] || { completed: [], lastAccessed: null };
    },
    
    setCourseProgress(courseId, lessonId, completed = true) {
        const progress = this.get('course_progress', {});
        if (!progress[courseId]) {
            progress[courseId] = { completed: [], lastAccessed: null };
        }
        
        if (completed && !progress[courseId].completed.includes(lessonId)) {
            progress[courseId].completed.push(lessonId);
        } else if (!completed) {
            progress[courseId].completed = progress[courseId].completed.filter(
                id => id !== lessonId
            );
        }
        
        progress[courseId].lastAccessed = Date.now();
        this.set('course_progress', progress);
        return progress[courseId];
    },
    
    /**
     * Get/set view preferences
     */
    getViewMode(page) {
        const modes = this.get('view_modes', {});
        return modes[page] || 'grid';
    },
    
    setViewMode(page, mode) {
        const modes = this.get('view_modes', {});
        modes[page] = mode;
        this.set('view_modes', modes);
    },
    
    /**
     * Get/set recent items
     */
    getRecent() {
        return this.get('recent', []);
    },
    
    addRecent(item) {
        let recent = this.getRecent();
        // Remove if already exists
        recent = recent.filter(r => !(r.id === item.id && r.type === item.type));
        // Add to front
        recent.unshift({ ...item, viewedAt: Date.now() });
        // Keep only last 10
        recent = recent.slice(0, 10);
        this.set('recent', recent);
        return recent;
    },
    
    /**
     * Get/set notes
     */
    getNotes(itemId, itemType) {
        const notes = this.get('notes', {});
        const key = `${itemType}_${itemId}`;
        return notes[key] || '';
    },
    
    setNote(itemId, itemType, content) {
        const notes = this.get('notes', {});
        const key = `${itemType}_${itemId}`;
        notes[key] = content;
        this.set('notes', notes);
    },
    
    /**
     * Export all user data
     */
    exportData() {
        const data = {
            theme: this.getTheme(),
            bookmarks: this.getBookmarks(),
            course_progress: this.get('course_progress', {}),
            recent: this.getRecent(),
            notes: this.get('notes', {}),
            view_modes: this.get('view_modes', {}),
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },
    
    /**
     * Import user data
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.theme) this.setTheme(data.theme);
            if (data.bookmarks) this.set('bookmarks', data.bookmarks);
            if (data.course_progress) this.set('course_progress', data.course_progress);
            if (data.recent) this.set('recent', data.recent);
            if (data.notes) this.set('notes', data.notes);
            if (data.view_modes) this.set('view_modes', data.view_modes);
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }
};

// Make available globally
window.Storage = Storage;
