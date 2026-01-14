/**
 * AI Universe - 3D Knowledge Landscape Explorer
 * Three.js powered constellation visualization of AI domains
 */

class AILandscape3D {
    constructor() {
        this.landscapeData = null;
        this.sections = [];
        this.nodes = [];
        this.edges = [];
        this.nodeObjects = [];
        this.edgeObjects = [];
        this.labelSprites = [];
        
        // State
        this.currentDomain = 'all';
        this.selectedNode = null;
        this.showLabels = true;
        this.showEdges = true;
        this.isLoading = true;
        this.autoRotate = true;
        this.autoRotateSpeed = 0.001;  // Faster for floating feel
        
        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = null;
        this.mouse = null;
        
        // Animation
        this.clock = null;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // Domain colors (47 domains organized into 8 categories)
        this.categoryColors = {
            'foundation': 0x4FC3F7,    // Light blue - History, Basics
            'learning': 0x81C784,       // Green - ML, DL, Algorithms
            'language': 0xBA68C8,       // Purple - NLP, LLMs
            'vision': 0xFFB74D,         // Orange - CV, Multimodal
            'systems': 0x4DB6AC,        // Teal - MLOps, Infrastructure
            'applications': 0xF06292,   // Pink - Applications, Agents
            'safety': 0xE57373,         // Red - Ethics, Security
            'future': 0xFFD54F          // Yellow - Emerging, Research
        };
        
        // Map sections to categories
        this.sectionCategories = {
            1: 'foundation', 2: 'foundation', 3: 'foundation', 
            4: 'foundation', 5: 'learning', 6: 'learning',
            7: 'language', 8: 'vision', 9: 'systems', 
            10: 'systems', 11: 'applications', 12: 'safety',
            13: 'learning', 14: 'applications', 15: 'language',
            16: 'language', 17: 'language', 18: 'future',
            19: 'language', 20: 'vision', 21: 'systems',
            22: 'foundation', 23: 'systems', 24: 'safety',
            25: 'systems', 26: 'language', 27: 'applications',
            28: 'future', 29: 'vision', 30: 'foundation',
            31: 'learning', 32: 'vision', 33: 'systems',
            34: 'systems', 35: 'learning', 36: 'safety',
            37: 'safety', 38: 'learning', 39: 'safety',
            40: 'safety', 41: 'safety', 42: 'foundation',
            43: 'applications', 44: 'foundation', 45: 'foundation',
            46: 'systems', 47: 'future'
        };
        
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.setupThreeJS();
        this.createUniverse();
        this.setupControls();
        this.setupEventListeners();
        this.populateDomainPills();
        this.populateLegend();
        this.hideLoading();
        this.animate();
    }
    
    async loadData() {
        try {
            const response = await fetch('../data/landscape.json');
            this.landscapeData = await response.json();
            this.sections = this.landscapeData.sections || [];
            this.nodes = this.landscapeData.nodes || [];
            this.edges = this.landscapeData.edges || [];
            
            // Build node lookup
            this.nodeMap = {};
            this.nodes.forEach(n => {
                this.nodeMap[n.id] = n;
                // Extract section ID from node ID (format: s1_*, s2_*, etc.)
                const match = n.id.match(/^s(\d+)_/);
                if (match) {
                    n.sectionId = parseInt(match[1]);
                }
            });
            
            console.log(`Loaded: ${this.sections.length} sections, ${this.nodes.length} nodes, ${this.edges.length} edges`);
        } catch (error) {
            console.error('Failed to load landscape data:', error);
        }
    }
    
    setupThreeJS() {
        const container = document.getElementById('canvas-container');
        
        // Scene with gradient space background
        this.scene = new THREE.Scene();
        
        // Create gradient background
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#1a1a2e');    // Dark purple-blue at top
        gradient.addColorStop(0.3, '#16213e');  // Deep blue
        gradient.addColorStop(0.6, '#0f0f23');  // Very dark blue
        gradient.addColorStop(1, '#0a0a12');    // Almost black at bottom
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2, 512);
        
        const bgTexture = new THREE.CanvasTexture(canvas);
        this.scene.background = bgTexture;
        this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.0012);  // Denser fog for depth
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            1,
            10000
        );
        this.camera.position.set(0, 200, 600);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);
        
        // Raycaster for mouse interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Clock for animations
        this.clock = new THREE.Clock();
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 0.8, 2000);
        pointLight.position.set(0, 300, 0);
        this.scene.add(pointLight);
        
        // Camera-attached light for front-facing illumination
        this.cameraLight = new THREE.PointLight(0x88aaff, 0.6, 1200);
        this.scene.add(this.cameraLight);
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    setupControls() {
        // Google Earth-like controls with inertia
        this.isDragging = false;
        this.isPanning = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.dragStartPosition = { x: 0, y: 0 };
        
        // Orbit camera around a dynamic center (like spinning a globe)
        this.orbitCenter = new THREE.Vector3(0, 0, 0);
        this.targetOrbitCenter = new THREE.Vector3(0, 0, 0);
        
        // Spherical coordinates for orbiting
        this.spherical = { theta: 0, phi: Math.PI / 3, radius: 900 };
        this.targetSpherical = { theta: 0, phi: Math.PI / 3, radius: 900 };
        
        // Velocity for inertia
        this.velocity = { theta: 0, phi: 0 };
        this.panVelocity = new THREE.Vector3();
        
        // Damping for smooth movement
        this.dampingFactor = 0.08;  // Slower damping
        this.inertiaDamping = 0.92; // How quickly inertia fades
        this.rotateSpeed = 0.002;   // Reduced from 0.005
        this.panSpeed = 0.5;        // Reduced from 1
        this.zoomSpeed = 1.08;      // Reduced from 1.15
        this.sensitivityMultiplier = 0.3;  // Base sensitivity (controlled by slider)
        
        const canvas = this.renderer.domElement;
        
        // Track mouse for zoom-to-cursor
        this.mouseNDC = new THREE.Vector2(0, 0);
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            
            // Update cursor based on what we're hovering over
            this.updateHoverCursor();
        });
        
        // Mouse down - start drag or pan
        canvas.addEventListener('mousedown', (e) => {
            this.dragStartPosition = { x: e.clientX, y: e.clientY };
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
            
            // Stop inertia when starting new interaction
            this.velocity = { theta: 0, phi: 0 };
            this.panVelocity.set(0, 0, 0);
            
            if (e.button === 0) { // Left click - orbit rotate
                this.isDragging = true;
                
                // Find intersection point to orbit around
                this.raycaster.setFromCamera(this.mouseNDC, this.camera);
                const intersects = this.raycaster.intersectObjects(this.nodeObjects.filter(o => o.visible));
                if (intersects.length > 0) {
                    // Orbit around the point under cursor
                    this.targetOrbitCenter.copy(intersects[0].point);
                }
            } else if (e.button === 2) { // Right click - pan
                this.isPanning = true;
            }
        });
        
        // Mouse move - rotate globe or pan
        canvas.addEventListener('mousemove', (e) => {
            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;
            
            if (this.isDragging) {
                // Rotate around orbit center (like spinning a globe)
                const effectiveRotateSpeed = this.rotateSpeed * this.sensitivityMultiplier;
                const velocityTheta = -deltaX * effectiveRotateSpeed;
                const velocityPhi = deltaY * effectiveRotateSpeed;
                
                this.targetSpherical.theta += velocityTheta;
                this.targetSpherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, 
                    this.targetSpherical.phi + velocityPhi));
                
                // Store velocity for inertia
                this.velocity.theta = velocityTheta;
                this.velocity.phi = velocityPhi;
                
            } else if (this.isPanning) {
                // Pan - move orbit center parallel to view plane
                const panAmount = this.targetSpherical.radius * 0.002 * this.sensitivityMultiplier;
                
                // Get camera right and up vectors
                const cameraDir = new THREE.Vector3().subVectors(this.camera.position, this.orbitCenter).normalize();
                const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), cameraDir).normalize();
                const up = new THREE.Vector3().crossVectors(cameraDir, right).normalize();
                
                const panDelta = new THREE.Vector3();
                panDelta.addScaledVector(right, -deltaX * panAmount);
                panDelta.addScaledVector(up, deltaY * panAmount);
                
                this.targetOrbitCenter.add(panDelta);
                
                // Store velocity for inertia
                this.panVelocity.copy(panDelta);
            }
            
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.isPanning = false;
        });
        canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.isPanning = false;
        });
        
        // Prevent context menu on right-click
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Scroll wheel - zoom toward cursor (Google Earth style)
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const zoomIn = e.deltaY < 0;
            // Apply sensitivity to zoom speed
            const effectiveZoomSpeed = 1 + (this.zoomSpeed - 1) * this.sensitivityMultiplier;
            const zoomFactor = zoomIn ? (1 / effectiveZoomSpeed) : effectiveZoomSpeed;
            
            // Zoom by adjusting radius
            const newRadius = Math.max(50, Math.min(2500, this.targetSpherical.radius * zoomFactor));
            
            // When zooming in, shift orbit center toward cursor intersection
            if (zoomIn) {
                this.raycaster.setFromCamera(this.mouseNDC, this.camera);
                const intersects = this.raycaster.intersectObjects(this.nodeObjects.filter(o => o.visible));
                
                if (intersects.length > 0) {
                    // Move center toward the point we're zooming to
                    this.targetOrbitCenter.lerp(intersects[0].point, 0.15);
                }
            }
            
            this.targetSpherical.radius = newRadius;
        }, { passive: false });
        
        // Double-click to focus on node
        canvas.addEventListener('dblclick', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);
            const intersects = this.raycaster.intersectObjects(this.nodeObjects.filter(o => o.visible));
            
            if (intersects.length > 0) {
                // Focus on clicked node
                const object = intersects[0].object;
                this.focusOnNode(object);
            }
        });
        
        // Single click for node selection
        canvas.addEventListener('click', (e) => {
            // Only trigger if mouse didn't move much (not a drag)
            const dx = Math.abs(e.clientX - this.dragStartPosition.x);
            const dy = Math.abs(e.clientY - this.dragStartPosition.y);
            if (dx < 5 && dy < 5) {
                this.handleClick(e);
            }
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            const rotateStep = 0.08;
            const panStep = 30;
            const zoomStep = 50;
            
            // Get camera direction vectors for panning
            const cameraDir = new THREE.Vector3().subVectors(this.camera.position, this.orbitCenter).normalize();
            const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), cameraDir).normalize();
            const up = new THREE.Vector3(0, 1, 0);
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.targetSpherical.theta += rotateStep;
                    break;
                case 'ArrowRight':
                    this.targetSpherical.theta -= rotateStep;
                    break;
                case 'ArrowUp':
                    this.targetSpherical.phi = Math.max(0.1, this.targetSpherical.phi - rotateStep);
                    break;
                case 'ArrowDown':
                    this.targetSpherical.phi = Math.min(Math.PI - 0.1, this.targetSpherical.phi + rotateStep);
                    break;
                case 'w':
                case 'W':
                    this.targetOrbitCenter.addScaledVector(up, panStep);
                    break;
                case 's':
                case 'S':
                    this.targetOrbitCenter.addScaledVector(up, -panStep);
                    break;
                case 'a':
                case 'A':
                    this.targetOrbitCenter.addScaledVector(right, -panStep);
                    break;
                case 'd':
                case 'D':
                    this.targetOrbitCenter.addScaledVector(right, panStep);
                    break;
                case '+':
                case '=':
                    this.targetSpherical.radius = Math.max(50, this.targetSpherical.radius - zoomStep);
                    break;
                case '-':
                case '_':
                    this.targetSpherical.radius = Math.min(2500, this.targetSpherical.radius + zoomStep);
                    break;
                case 'Home':
                case 'h':
                    this.resetView();
                    break;
            }
        });
        
        // Touch support for mobile
        this.setupTouchControls(canvas);
    }
    
    setupTouchControls(canvas) {
        let lastTouchDistance = 0;
        let lastTouchCenter = { x: 0, y: 0 };
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            // Stop inertia
            this.velocity = { theta: 0, phi: 0 };
            this.panVelocity.set(0, 0, 0);
            
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                this.dragStartPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.touches.length === 2) {
                this.isDragging = false;
                // Pinch zoom
                lastTouchDistance = Math.hypot(
                    e.touches[1].clientX - e.touches[0].clientX,
                    e.touches[1].clientY - e.touches[0].clientY
                );
                lastTouchCenter = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                };
            }
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && this.isDragging) {
                const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
                const deltaY = e.touches[0].clientY - this.previousMousePosition.y;
                
                // Orbit rotation (like spinning a globe) - apply sensitivity
                const effectiveRotateSpeed = this.rotateSpeed * this.sensitivityMultiplier;
                this.targetSpherical.theta -= deltaX * effectiveRotateSpeed;
                this.targetSpherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1,
                    this.targetSpherical.phi + deltaY * effectiveRotateSpeed));
                
                this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.touches.length === 2) {
                // Pinch to zoom - apply sensitivity
                const newDistance = Math.hypot(
                    e.touches[1].clientX - e.touches[0].clientX,
                    e.touches[1].clientY - e.touches[0].clientY
                );
                const delta = (lastTouchDistance - newDistance) * this.sensitivityMultiplier;
                this.targetSpherical.radius = Math.max(50, Math.min(2500, 
                    this.targetSpherical.radius + delta * 2));
                lastTouchDistance = newDistance;
                
                // Two finger pan - move orbit center
                const newCenter = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                };
                const panDeltaX = newCenter.x - lastTouchCenter.x;
                const panDeltaY = newCenter.y - lastTouchCenter.y;
                
                const cameraDir = new THREE.Vector3().subVectors(this.camera.position, this.orbitCenter).normalize();
                const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), cameraDir).normalize();
                const up = new THREE.Vector3().crossVectors(cameraDir, right).normalize();
                
                const panAmount = this.targetSpherical.radius * 0.002 * this.sensitivityMultiplier;
                this.targetOrbitCenter.addScaledVector(right, -panDeltaX * panAmount);
                this.targetOrbitCenter.addScaledVector(up, panDeltaY * panAmount);
                lastTouchCenter = newCenter;
            }
        }, { passive: false });
        
        canvas.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }
    
    focusOnNode(object) {
        const node = object.userData.node;
        if (!node._position) return;
        
        // Set orbit center to the node and zoom in
        this.targetOrbitCenter.copy(node._position);
        this.targetSpherical.radius = 120;
        
        // Keep current viewing angle, just zoom in on node
        // (phi and theta stay the same, giving smooth zoom)
        
        // Select the node
        this.selectNode(object);
        
        // Flash effect
        const originalIntensity = object.material.emissiveIntensity;
        object.material.emissiveIntensity = 1.5;
        setTimeout(() => {
            object.material.emissiveIntensity = 0.8;
        }, 200);
    }
    
    resetView() {
        this.targetOrbitCenter.set(0, 0, 0);
        this.targetSpherical = { theta: 0, phi: Math.PI / 3, radius: 900 };
        this.velocity = { theta: 0, phi: 0 };
        this.panVelocity.set(0, 0, 0);
        this.deselectNode();
    }
    
    createUniverse() {
        // Create starfield background
        this.createStarfield();
        
        // Arrange sections in a spherical pattern
        const sectionPositions = this.calculateSectionPositions();
        
        // Create nodes for each section
        this.nodes.forEach((node, i) => {
            if (!node.sectionId) return;
            
            const sectionPos = sectionPositions[node.sectionId];
            if (!sectionPos) return;
            
            // Position within section cluster (spread out more)
            const localOffset = this.fibonacci3D(i % 100, 100, 60);  // Increased from 30 to 60
            const pos = new THREE.Vector3(
                sectionPos.x + localOffset.x,
                sectionPos.y + localOffset.y,
                sectionPos.z + localOffset.z
            );
            
            // Create node sphere
            const category = this.sectionCategories[node.sectionId] || 'foundation';
            const color = this.categoryColors[category];
            const geometry = new THREE.SphereGeometry(4, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.9
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(pos);
            mesh.userData = { 
                node: node, 
                originalColor: color,
                sectionId: node.sectionId 
            };
            
            this.scene.add(mesh);
            this.nodeObjects.push(mesh);
            node._mesh = mesh;
            node._position = pos;
            
            // Create node label sprite (like map labels - constant screen size)
            const labelCanvas = document.createElement('canvas');
            const labelCtx = labelCanvas.getContext('2d');
            labelCanvas.width = 512;  // Larger canvas for better quality
            labelCanvas.height = 96;
            
            // Draw label background
            labelCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            labelCtx.roundRect(8, 8, labelCanvas.width - 16, labelCanvas.height - 16, 12);
            labelCtx.fill();
            
            // Larger, bolder font
            labelCtx.font = 'bold 32px system-ui, -apple-system, sans-serif';
            labelCtx.fillStyle = '#ffffff';
            labelCtx.textAlign = 'center';
            labelCtx.textBaseline = 'middle';
            
            // Truncate long labels
            let labelText = node.label || node.id;
            if (labelText.length > 25) labelText = labelText.substring(0, 23) + '...';
            labelCtx.fillText(labelText, labelCanvas.width / 2, labelCanvas.height / 2);
            
            const labelTexture = new THREE.CanvasTexture(labelCanvas);
            const labelMaterial = new THREE.SpriteMaterial({
                map: labelTexture,
                transparent: true,
                opacity: 0.95,
                depthTest: false
            });
            
            const labelSprite = new THREE.Sprite(labelMaterial);
            labelSprite.position.copy(pos);
            labelSprite.position.y += 10;  // Position above node
            labelSprite.userData = { 
                isNodeLabel: true, 
                nodeId: node.id,
                sectionId: node.sectionId,
                parentMesh: mesh
            };
            labelSprite.renderOrder = 2;
            labelSprite.visible = false;  // Hidden by default, shown when nearby or selected
            
            this.scene.add(labelSprite);
            node._labelSprite = labelSprite;
            mesh.userData.labelSprite = labelSprite;
        });
        
        // Create edges
        this.createEdges();
        
        // Create section labels
        this.createSectionLabels(sectionPositions);
        
        // Update stats
        document.getElementById('node-count').textContent = this.nodes.length;
        document.getElementById('edge-count').textContent = this.edges.length;
        document.getElementById('visible-nodes').textContent = `${this.nodes.length} visible`;
    }
    
    calculateSectionPositions() {
        const positions = {};
        const numSections = this.sections.length;
        const radius = 500;  // Increased for more spread
        
        this.sections.forEach((section, i) => {
            // Fibonacci sphere distribution for even spacing
            const pos = this.fibonacci3D(i, numSections, radius);
            positions[section.id] = pos;
        });
        
        return positions;
    }
    
    fibonacci3D(index, total, radius) {
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
        const y = 1 - (index / (total - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * index;
        
        return new THREE.Vector3(
            Math.cos(theta) * radiusAtY * radius,
            y * radius * 0.6,
            Math.sin(theta) * radiusAtY * radius
        );
    }
    
    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 3000;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            const radius = 2000 + Math.random() * 3000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            sizeAttenuation: true
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }
    
    createEdges() {
        this.edges.forEach(edge => {
            const fromNode = this.nodeMap[edge.source];
            const toNode = this.nodeMap[edge.target];
            
            if (!fromNode?._position || !toNode?._position) return;
            
            // Get colors from both connected nodes - brighten for visibility
            const fromCategory = this.sectionCategories[fromNode.sectionId] || 'foundation';
            const toCategory = this.sectionCategories[toNode.sectionId] || 'foundation';
            const fromColor = new THREE.Color(this.categoryColors[fromCategory]);
            const toColor = new THREE.Color(this.categoryColors[toCategory]);
            
            // Brighten the colors for better contrast
            fromColor.multiplyScalar(1.5);
            toColor.multiplyScalar(1.5);
            
            // Create gradient line using vertex colors
            const positions = new Float32Array([
                fromNode._position.x, fromNode._position.y, fromNode._position.z,
                toNode._position.x, toNode._position.y, toNode._position.z
            ]);
            
            const colors = new Float32Array([
                fromColor.r, fromColor.g, fromColor.b,
                toColor.r, toColor.g, toColor.b
            ]);
            
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const lineMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.75,  // Higher base opacity
                linewidth: 3
            });
            
            const line = new THREE.Line(geometry, lineMaterial);
            
            // Create arrowhead at the target end
            const direction = new THREE.Vector3().subVectors(toNode._position, fromNode._position).normalize();
            const arrowLength = 6;
            const arrowRadius = 2.5;
            // Position arrow slightly before the target node
            const arrowPos = toNode._position.clone().sub(direction.clone().multiplyScalar(8));
            
            const arrowGeometry = new THREE.ConeGeometry(arrowRadius, arrowLength, 8);
            const arrowMaterial = new THREE.MeshBasicMaterial({
                color: toColor,
                transparent: true,
                opacity: 0.6  // Higher arrow opacity
            });
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            arrow.position.copy(arrowPos);
            // Orient arrow to point in direction of edge
            arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            this.scene.add(arrow);
            line.userData = { 
                edge, 
                fromId: edge.source, 
                toId: edge.target, 
                originalFromColor: fromColor.getHex(),
                originalToColor: toColor.getHex(),
                arrow: arrow  // Store reference to arrow
            };
            arrow.userData = { parentLine: line };
            this.scene.add(line);
            this.edgeObjects.push(line);
        });
    }
    
    createSectionLabels(positions) {
        this.sections.forEach(section => {
            const pos = positions[section.id];
            if (!pos) return;
            
            // Create canvas for label with glow effect
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 512;
            canvas.height = 96;
            
            // Background glow
            const gradient = ctx.createRadialGradient(256, 48, 0, 256, 48, 200);
            gradient.addColorStop(0, 'rgba(88, 166, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Text with shadow
            ctx.shadowColor = '#58a6ff';
            ctx.shadowBlur = 15;
            ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Truncate long titles
            let title = section.title;
            if (title.length > 20) title = title.substring(0, 18) + '...';
            ctx.fillText(title, canvas.width / 2, canvas.height / 2);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture, 
                transparent: true,
                opacity: 1.0,
                depthTest: false
            });
            
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.copy(pos);
            sprite.position.y += 55;
            sprite.scale.set(120, 22, 1);
            sprite.userData = { 
                sectionId: section.id, 
                sectionTitle: section.title,
                isSectionLabel: true 
            };
            sprite.renderOrder = 1;
            
            this.scene.add(sprite);
            this.labelSprites.push(sprite);
        });
    }
    
    populateDomainPills() {
        const container = document.getElementById('domain-pills');
        
        // Add category filter pills
        const categories = [
            { id: 'all', icon: '🌐', label: 'All Domains' },
            { id: 'foundation', icon: '📚', label: 'Foundation' },
            { id: 'learning', icon: '🧠', label: 'Machine Learning' },
            { id: 'language', icon: '💬', label: 'NLP & LLMs' },
            { id: 'vision', icon: '👁️', label: 'Vision' },
            { id: 'systems', icon: '⚙️', label: 'Systems' },
            { id: 'applications', icon: '🚀', label: 'Applications' },
            { id: 'safety', icon: '🛡️', label: 'Safety' },
            { id: 'future', icon: '🔮', label: 'Future' }
        ];
        
        container.innerHTML = categories.map(cat => `
            <button class="domain-pill ${cat.id === 'all' ? 'active' : ''}" data-domain="${cat.id}">
                <span class="pill-icon">${cat.icon}</span>
                <span class="pill-label">${cat.label}</span>
            </button>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.domain-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                container.querySelectorAll('.domain-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.filterByCategory(pill.dataset.domain);
            });
        });
    }
    
    populateLegend() {
        const container = document.getElementById('legend-items');
        
        const categories = [
            { id: 'foundation', label: 'Foundation & History', color: this.categoryColors.foundation },
            { id: 'learning', label: 'Machine Learning', color: this.categoryColors.learning },
            { id: 'language', label: 'NLP & Language Models', color: this.categoryColors.language },
            { id: 'vision', label: 'Vision & Multimodal', color: this.categoryColors.vision },
            { id: 'systems', label: 'MLOps & Infrastructure', color: this.categoryColors.systems },
            { id: 'applications', label: 'Applications & Agents', color: this.categoryColors.applications },
            { id: 'safety', label: 'Safety & Ethics', color: this.categoryColors.safety },
            { id: 'future', label: 'Emerging & Future', color: this.categoryColors.future }
        ];
        
        container.innerHTML = categories.map(cat => `
            <div class="legend-item" data-category="${cat.id}">
                <span class="legend-dot" style="background: #${cat.color.toString(16).padStart(6, '0')}"></span>
                <span class="legend-label">${cat.label}</span>
            </div>
        `).join('');
    }
    
    filterByCategory(category) {
        this.currentDomain = category;
        
        // Update node visibility
        this.nodeObjects.forEach(obj => {
            const nodeSection = obj.userData.sectionId;
            const nodeCategory = this.sectionCategories[nodeSection];
            
            if (category === 'all' || nodeCategory === category) {
                obj.visible = true;
                obj.material.opacity = 0.85;
            } else {
                obj.visible = false;
            }
        });
        
        // Update edge visibility (and arrows)
        this.edgeObjects.forEach(line => {
            let visible = false;
            if (category === 'all') {
                visible = this.showEdges;
            } else {
                // Only show edges within the category
                const fromNode = this.nodeMap[line.userData.fromId];
                const toNode = this.nodeMap[line.userData.toId];
                
                const fromCat = this.sectionCategories[fromNode?.sectionId];
                const toCat = this.sectionCategories[toNode?.sectionId];
                
                visible = this.showEdges && (fromCat === category || toCat === category);
            }
            line.visible = visible;
            // Also update arrow visibility
            if (line.userData.arrow) {
                line.userData.arrow.visible = visible;
            }
        });
        
        // Update label visibility
        this.labelSprites.forEach(sprite => {
            const sectionId = sprite.userData.sectionId;
            const sectionCat = this.sectionCategories[sectionId];
            
            if (category === 'all') {
                sprite.visible = this.showLabels;
            } else {
                sprite.visible = this.showLabels && sectionCat === category;
            }
        });
        
        // Update domain info
        this.updateDomainInfo(category);
        
        // Update visible count
        const visibleCount = this.nodeObjects.filter(o => o.visible).length;
        document.getElementById('visible-nodes').textContent = `${visibleCount} visible`;
    }
    
    updateDomainInfo(category) {
        const info = {
            'all': { icon: '🌐', title: 'AI Universe', desc: 'All 47 domains visualized as constellations' },
            'foundation': { icon: '📚', title: 'Foundation & History', desc: 'AI origins, concepts, and ecosystem overview' },
            'learning': { icon: '🧠', title: 'Machine Learning', desc: 'ML algorithms, deep learning, and training methods' },
            'language': { icon: '💬', title: 'NLP & Language Models', desc: 'LLMs, RAG, NLP evolution, and text processing' },
            'vision': { icon: '👁️', title: 'Vision & Multimodal', desc: 'Computer vision, image generation, and multimodal AI' },
            'systems': { icon: '⚙️', title: 'MLOps & Infrastructure', desc: 'Deployment, monitoring, and AI infrastructure' },
            'applications': { icon: '🚀', title: 'Applications & Agents', desc: 'AI agents, industry applications, and use cases' },
            'safety': { icon: '🛡️', title: 'Safety & Ethics', desc: 'AI safety, governance, privacy, and explainability' },
            'future': { icon: '🔮', title: 'Emerging & Future', desc: 'Cutting-edge research and future AI trends' }
        };
        
        const current = info[category] || info['all'];
        document.getElementById('domain-icon').textContent = current.icon;
        document.getElementById('domain-title').textContent = current.title;
        document.getElementById('domain-description').textContent = current.desc;
        
        // Show domain info briefly when category changes
        const domainInfo = document.getElementById('domain-info');
        domainInfo.classList.add('visible');
        
        // Auto-hide after 2 seconds
        clearTimeout(this.domainInfoTimeout);
        this.domainInfoTimeout = setTimeout(() => {
            domainInfo.classList.remove('visible');
        }, 2000);
    }
    
    handleClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for section label clicks first
        const labelIntersects = this.raycaster.intersectObjects(this.labelSprites.filter(s => s.visible && s.userData.isSectionLabel));
        if (labelIntersects.length > 0) {
            const sectionId = labelIntersects[0].object.userData.sectionId;
            this.handleSectionLabelClick(sectionId);
            return;
        }
        
        // Check for node clicks
        const intersects = this.raycaster.intersectObjects(this.nodeObjects.filter(o => o.visible));
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.selectNode(object);
        } else {
            this.deselectNode();
        }
    }
    
    selectNode(object) {
        // Reset previous selection
        if (this.selectedNode) {
            this.selectedNode.material.emissiveIntensity = 0.3;
            this.selectedNode.scale.setScalar(1);
        }
        
        this.selectedNode = object;
        object.material.emissiveIntensity = 0.8;
        object.scale.setScalar(1.5);
        
        // Show all labels when a node is selected
        this.labelSprites.forEach(sprite => {
            sprite.visible = true;
        });
        
        const node = object.userData.node;
        const section = this.sections.find(s => s.id === node.sectionId);
        
        // Update card header
        document.getElementById('node-icon').textContent = node.label?.charAt(0) || '📄';
        document.getElementById('node-label').textContent = node.label || node.id;
        
        // Section and difficulty badges
        const sectionName = node.section || section?.title || '';
        const difficulty = node.difficulty || 'Intermediate';
        const difficultyClass = difficulty.toLowerCase();
        document.getElementById('node-section').innerHTML = `
            <span class="node-badge section-badge">📂 ${sectionName}</span>
            <span class="node-badge difficulty-badge ${difficultyClass}">${difficulty}</span>
        `;
        
        // Description
        const descEl = document.getElementById('node-description');
        if (descEl) {
            descEl.textContent = node.description || '';
            descEl.style.display = node.description ? 'block' : 'none';
        }
        
        // Link
        const linkEl = document.getElementById('node-link');
        if (node.url) {
            linkEl.href = node.url;
            linkEl.classList.remove('hidden');
        } else {
            linkEl.classList.add('hidden');
        }
        
        // Show connections
        const connections = this.edges.filter(e => e.source === node.id || e.target === node.id);
        const connHtml = connections.slice(0, 5).map(e => {
            const otherId = e.source === node.id ? e.target : e.source;
            const other = this.nodeMap[otherId];
            return `<span class="connection-tag">${other?.label || otherId}</span>`;
        }).join('');
        
        document.getElementById('node-connections').innerHTML = 
            connections.length > 0 ? `<p>Connected to:</p>${connHtml}${connections.length > 5 ? `<span class="connection-more">+${connections.length - 5} more</span>` : ''}` : '';
        
        document.getElementById('node-card').classList.remove('hidden');
        
        // Highlight connected edges and their arrows
        this.edgeObjects.forEach(line => {
            if (line.userData.fromId === node.id || line.userData.toId === node.id) {
                line.material.color.setHex(0x58a6ff);
                line.material.opacity = 0.8;
                line.material.linewidth = 4;
                if (line.userData.arrow) {
                    line.userData.arrow.material.color.setHex(0x58a6ff);
                    line.userData.arrow.material.opacity = 0.9;
                    line.userData.arrow.scale.setScalar(1.3);
                }
            }
        });
    }
    
    deselectNode() {
        if (this.selectedNode) {
            this.selectedNode.material.emissiveIntensity = 0.3;
            this.selectedNode.scale.setScalar(1);
            this.selectedNode = null;
        }
        
        document.getElementById('node-card').classList.add('hidden');
        
        // Reset labels visibility based on showLabels setting
        this.labelSprites.forEach(sprite => {
            sprite.visible = this.showLabels && 
                (this.currentDomain === 'all' || this.sectionCategories[sprite.userData.sectionId] === this.currentDomain);
        });
        
        // Reset edge colors and arrows - restore vertex colors
        this.edgeObjects.forEach(line => {
            line.material.vertexColors = true;  // Re-enable gradient colors
            line.material.needsUpdate = true;
            line.material.opacity = 0.6;
            line.material.linewidth = 3;
            if (line.userData.arrow) {
                line.userData.arrow.material.color.setHex(line.userData.originalToColor);
                line.userData.arrow.material.opacity = 0.5;
                line.userData.arrow.scale.setScalar(1);
            }
        });
    }
    
    setupEventListeners() {
        // Close card button
        document.getElementById('close-card').addEventListener('click', () => this.deselectNode());
        
        // HUD controls
        document.getElementById('zoom-in').addEventListener('click', () => {
            // Decrease orbit radius (zoom in)
            this.targetSpherical.radius = Math.max(50, this.targetSpherical.radius - 80);
        });
        
        document.getElementById('zoom-out').addEventListener('click', () => {
            // Increase orbit radius (zoom out)
            this.targetSpherical.radius = Math.min(2500, this.targetSpherical.radius + 80);
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
            this.resetView();
        });
        
        document.getElementById('toggle-labels').addEventListener('click', (e) => {
            this.showLabels = !this.showLabels;
            e.target.classList.toggle('active', this.showLabels);
            this.labelSprites.forEach(s => s.visible = this.showLabels && 
                (this.currentDomain === 'all' || this.sectionCategories[s.userData.sectionId] === this.currentDomain));
        });
        
        document.getElementById('toggle-edges').addEventListener('click', (e) => {
            this.showEdges = !this.showEdges;
            e.target.classList.toggle('active', this.showEdges);
            this.filterByCategory(this.currentDomain); // Reapply filter
        });
        
        document.getElementById('toggle-rotate').addEventListener('click', (e) => {
            this.autoRotate = !this.autoRotate;
            e.target.classList.toggle('active', this.autoRotate);
        });
        
        // Legend toggle
        document.getElementById('toggle-legend').addEventListener('click', (e) => {
            const legend = document.getElementById('legend');
            legend.classList.toggle('visible');
            e.target.classList.toggle('active', legend.classList.contains('visible'));
        });
        
        // Search
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                searchResults.innerHTML = '';
                searchResults.classList.remove('visible');
                return;
            }
            
            const matches = this.nodes
                .filter(n => n.label?.toLowerCase().includes(query) || n.id.toLowerCase().includes(query))
                .slice(0, 8);
            
            if (matches.length > 0) {
                searchResults.innerHTML = matches.map(n => `
                    <div class="search-result" data-id="${n.id}">
                        <span class="result-icon">${n.label?.charAt(0) || '📄'}</span>
                        <span class="result-label">${n.label || n.id}</span>
                    </div>
                `).join('');
                searchResults.classList.add('visible');
                
                searchResults.querySelectorAll('.search-result').forEach(el => {
                    el.addEventListener('click', () => {
                        const node = this.nodes.find(n => n.id === el.dataset.id);
                        if (node?._mesh) {
                            this.selectNode(node._mesh);
                            // Focus camera on node
                            this.targetCenter.copy(node._position);
                            this.targetDistance = 150;
                        }
                        searchResults.innerHTML = '';
                        searchResults.classList.remove('visible');
                        searchInput.value = '';
                    });
                });
            } else {
                searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
                searchResults.classList.add('visible');
            }
        });
        
        // Click outside to close search
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#search-container')) {
                searchResults.innerHTML = '';
                searchResults.classList.remove('visible');
            }
        });
        
        // Initial button states
        document.getElementById('toggle-labels').classList.add('active');
        document.getElementById('toggle-edges').classList.add('active');
        document.getElementById('toggle-rotate').classList.add('active');
        
        // Sensitivity slider with value display
        const sensitivitySlider = document.getElementById('sensitivity-slider');
        const sensitivityValue = document.getElementById('sensitivity-value');
        if (sensitivitySlider) {
            sensitivitySlider.addEventListener('input', (e) => {
                // Map slider value (5-100) to sensitivity multiplier (0.05 - 1.0)
                this.sensitivityMultiplier = e.target.value / 100;
                if (sensitivityValue) {
                    sensitivityValue.textContent = `${e.target.value}%`;
                }
            });
        }
        
        // Help button
        document.getElementById('show-help').addEventListener('click', () => {
            document.getElementById('instructions-overlay').classList.remove('hidden');
        });
        
        // Start exploring button (dismiss instructions)
        document.getElementById('start-exploring').addEventListener('click', () => {
            document.getElementById('instructions-overlay').classList.add('hidden');
        });
        
        // Allow ESC to dismiss instructions
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('instructions-overlay').classList.add('hidden');
            }
        });
        
        // Auto-hide header after idle (show on mouse move near top)
        let headerTimeout;
        const header = document.getElementById('header');
        const showHeader = () => {
            header.classList.remove('hidden');
            clearTimeout(headerTimeout);
            headerTimeout = setTimeout(() => {
                if (!document.querySelector('#search-input:focus')) {
                    header.classList.add('hidden');
                }
            }, 3000);
        };
        
        document.addEventListener('mousemove', (e) => {
            if (e.clientY < 80) {
                showHeader();
            }
        });
        
        // Keep header visible when search is focused
        document.getElementById('search-input').addEventListener('focus', () => {
            header.classList.remove('hidden');
            clearTimeout(headerTimeout);
        });
        
        // Start header hide timer
        headerTimeout = setTimeout(() => header.classList.add('hidden'), 4000);
        
        // Show domain info on pill hover
        document.getElementById('domain-pills').addEventListener('mouseenter', () => {
            document.getElementById('domain-info').classList.add('visible');
            clearTimeout(this.domainInfoTimeout);
        });
        
        document.getElementById('domain-pills').addEventListener('mouseleave', () => {
            this.domainInfoTimeout = setTimeout(() => {
                document.getElementById('domain-info').classList.remove('visible');
            }, 500);
        });
        
        // Section sidebar handlers
        this.setupSidebarListeners();
    }
    
    // =====================
    // Section Sidebar Methods
    // =====================
    
    setupSidebarListeners() {
        const sidebar = document.getElementById('section-sidebar');
        const closeSidebar = document.getElementById('close-sidebar');
        const overlay = sidebar.querySelector('.sidebar-overlay');
        
        // Close sidebar button
        closeSidebar.addEventListener('click', () => this.closeSectionSidebar());
        
        // Close when clicking overlay
        overlay.addEventListener('click', () => this.closeSectionSidebar());
        
        // ESC to close sidebar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !sidebar.classList.contains('hidden')) {
                this.closeSectionSidebar();
            }
        });
        
        // Click on domain pills to open sidebar with that section
        document.getElementById('domain-pills').addEventListener('click', (e) => {
            const pill = e.target.closest('.domain-pill');
            if (pill && pill.dataset.domain !== 'all') {
                this.openSectionSidebar(pill.dataset.domain, 'category');
            }
        });
    }
    
    openSectionSidebar(id, type = 'section') {
        const sidebar = document.getElementById('section-sidebar');
        
        let sectionNodes = [];
        let sectionTitle = '';
        let sectionDesc = '';
        let sectionIcon = '📚';
        let sectionColor = '#58a6ff';
        
        if (type === 'category') {
            // Filter by category (like 'safety', 'learning', etc.)
            const categoryInfo = {
                'foundation': { icon: '📚', title: 'Foundation & History', desc: 'AI origins, concepts, and ecosystem overview', color: '#4FC3F7' },
                'learning': { icon: '🧠', title: 'Machine Learning', desc: 'ML algorithms, deep learning, and training methods', color: '#81C784' },
                'language': { icon: '💬', title: 'NLP & Language Models', desc: 'LLMs, RAG, NLP evolution, and text processing', color: '#BA68C8' },
                'vision': { icon: '👁️', title: 'Vision & Multimodal', desc: 'Computer vision, image generation, and multimodal AI', color: '#FFB74D' },
                'systems': { icon: '⚙️', title: 'MLOps & Infrastructure', desc: 'Deployment, monitoring, and AI infrastructure', color: '#4DB6AC' },
                'applications': { icon: '🚀', title: 'Applications & Agents', desc: 'AI agents, industry applications, and use cases', color: '#F06292' },
                'safety': { icon: '🛡️', title: 'Safety & Ethics', desc: 'AI safety, governance, privacy, and explainability', color: '#E57373' },
                'future': { icon: '🔮', title: 'Emerging & Future', desc: 'Cutting-edge research and future AI trends', color: '#FFD54F' }
            };
            
            const cat = categoryInfo[id];
            if (cat) {
                sectionTitle = cat.title;
                sectionDesc = cat.desc;
                sectionIcon = cat.icon;
                sectionColor = cat.color;
            }
            
            // Get all nodes in this category
            sectionNodes = this.nodes.filter(n => {
                const nodeCategory = this.sectionCategories[n.sectionId];
                return nodeCategory === id;
            });
            
        } else {
            // Filter by specific section ID
            const section = this.sections.find(s => s.id === parseInt(id));
            if (section) {
                sectionTitle = section.title;
                sectionDesc = section.description || '';
                const category = this.sectionCategories[section.id];
                sectionColor = '#' + (this.categoryColors[category] || 0x58a6ff).toString(16).padStart(6, '0');
            }
            
            sectionNodes = this.nodes.filter(n => n.sectionId === parseInt(id));
        }
        
        // Update sidebar header
        document.getElementById('sidebar-icon').textContent = sectionIcon;
        document.getElementById('sidebar-title').textContent = sectionTitle;
        document.getElementById('sidebar-description').textContent = sectionDesc;
        document.getElementById('sidebar-icon').style.textShadow = `0 0 15px ${sectionColor}`;
        
        // Count connections within this section
        const nodeIds = new Set(sectionNodes.map(n => n.id));
        const internalEdges = this.edges.filter(e => nodeIds.has(e.source) || nodeIds.has(e.target));
        
        document.getElementById('sidebar-node-count').textContent = sectionNodes.length;
        document.getElementById('sidebar-edge-count').textContent = internalEdges.length;
        
        // Populate flowchart
        this.populateSidebarFlowchart(sectionNodes, sectionColor);
        
        // Show sidebar
        sidebar.classList.remove('hidden');
    }
    
    populateSidebarFlowchart(nodes, sectionColor) {
        const container = document.getElementById('sidebar-flowchart');
        
        // Group nodes by type
        const typeIcons = {
            'root': '🎯',
            'concept': '💡',
            'tool': '🛠️',
            'framework': '📦',
            'application': '🚀',
            'technique': '⚡',
            'model': '🤖',
            'library': '📚',
            'service': '☁️',
            'default': '📄'
        };
        
        const typeLabels = {
            'root': 'Core Concepts',
            'concept': 'Concepts',
            'tool': 'Tools',
            'framework': 'Frameworks',
            'application': 'Applications',
            'technique': 'Techniques',
            'model': 'Models',
            'library': 'Libraries',
            'service': 'Services',
            'default': 'Other'
        };
        
        // Group by type
        const grouped = {};
        nodes.forEach(node => {
            const type = node.type || 'default';
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push(node);
        });
        
        // Sort types by priority
        const typePriority = ['root', 'concept', 'technique', 'model', 'framework', 'tool', 'library', 'service', 'application', 'default'];
        const sortedTypes = Object.keys(grouped).sort((a, b) => {
            return (typePriority.indexOf(a) === -1 ? 999 : typePriority.indexOf(a)) - 
                   (typePriority.indexOf(b) === -1 ? 999 : typePriority.indexOf(b));
        });
        
        let html = '';
        
        sortedTypes.forEach(type => {
            const typeNodes = grouped[type];
            const icon = typeIcons[type] || typeIcons.default;
            const label = typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1);
            
            html += `
                <div class="flow-type-header">
                    <span class="flow-type-icon">${icon}</span>
                    <span class="flow-type-label">${label}</span>
                    <span class="flow-type-count">${typeNodes.length}</span>
                </div>
            `;
            
            typeNodes.forEach((node, idx) => {
                const difficulty = node.difficulty || 'Intermediate';
                const difficultyClass = difficulty.toLowerCase();
                const connections = this.edges.filter(e => e.source === node.id || e.target === node.id).length;
                const nodeIcon = typeIcons[node.type] || typeIcons.default;
                
                html += `
                    <div class="flowchart-node" data-node-id="${node.id}">
                        <div class="flow-connector">
                            <div class="flow-dot" style="--node-color: ${sectionColor}"></div>
                            ${idx < typeNodes.length - 1 ? '<div class="flow-arrow"></div>' : ''}
                        </div>
                        <div class="flow-node-card">
                            <div class="flow-node-header">
                                <span class="flow-node-type">${nodeIcon}</span>
                                <span class="flow-node-title">${node.label || node.id}</span>
                                <span class="flow-node-badge ${difficultyClass}">${difficulty}</span>
                            </div>
                            ${node.description ? `<p class="flow-node-desc">${node.description}</p>` : ''}
                            <div class="flow-node-footer">
                                ${connections > 0 ? `<span class="flow-node-connections">🔗 <span>${connections}</span> connections</span>` : ''}
                                ${node.url ? `<a href="${node.url}" target="_blank" class="flow-node-link" onclick="event.stopPropagation()">Open ↗</a>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        });
        
        container.innerHTML = html;
        
        // Add click handlers to navigate to nodes
        container.querySelectorAll('.flowchart-node').forEach(el => {
            el.addEventListener('click', () => {
                const nodeId = el.dataset.nodeId;
                this.navigateToNodeFromSidebar(nodeId, el);
            });
        });
    }
    
    navigateToNodeFromSidebar(nodeId, flowchartEl) {
        const node = this.nodeMap[nodeId];
        if (!node || !node._mesh) return;
        
        // Highlight in sidebar
        document.querySelectorAll('.flowchart-node').forEach(el => el.classList.remove('highlight'));
        flowchartEl.classList.add('highlight');
        
        // Scroll the highlighted node into view
        flowchartEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Smooth camera fly to node
        this.flyToNode(node);
        
        // Select the node (but don't show card - let user click in 3D for that)
        // Just highlight it
        if (this.selectedNode && this.selectedNode !== node._mesh) {
            this.selectedNode.material.emissiveIntensity = 0.3;
            this.selectedNode.scale.setScalar(1);
        }
        
        this.selectedNode = node._mesh;
        node._mesh.material.emissiveIntensity = 0.8;
        node._mesh.scale.setScalar(1.5);
        
        // Show connected edges
        this.edgeObjects.forEach(line => {
            if (line.userData.fromId === nodeId || line.userData.toId === nodeId) {
                line.material.color.setHex(0x58a6ff);
                line.material.opacity = 0.8;
                if (line.userData.arrow) {
                    line.userData.arrow.material.color.setHex(0x58a6ff);
                    line.userData.arrow.material.opacity = 0.9;
                    line.userData.arrow.scale.setScalar(1.3);
                }
            }
        });
    }
    
    flyToNode(node) {
        if (!node._position) return;
        
        // Calculate offset so node appears to the right of sidebar
        // Get camera's right vector
        const cameraDir = new THREE.Vector3().subVectors(this.camera.position, this.orbitCenter).normalize();
        const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), cameraDir).normalize();
        
        // Offset the orbit center slightly to the left so node appears more centered in visible area
        const offset = right.multiplyScalar(-80); // Move center left
        
        this.targetOrbitCenter.copy(node._position).add(offset);
        
        // Zoom to a comfortable distance
        this.targetSpherical.radius = 250;
        
        // Keep current viewing angles for smooth transition
    }
    
    closeSectionSidebar() {
        const sidebar = document.getElementById('section-sidebar');
        sidebar.classList.add('hidden');
        
        // Remove highlight from flowchart nodes
        document.querySelectorAll('.flowchart-node').forEach(el => el.classList.remove('highlight'));
    }
    
    // Add click handler for section labels in 3D
    handleSectionLabelClick(sectionId) {
        this.openSectionSidebar(sectionId, 'section');
    }
    
    // Update cursor based on what's being hovered
    updateHoverCursor() {
        if (this.isDragging || this.isPanning) {
            this.renderer.domElement.style.cursor = 'grabbing';
            return;
        }
        
        this.raycaster.setFromCamera(this.mouseNDC, this.camera);
        
        // Check for section labels
        const labelIntersects = this.raycaster.intersectObjects(
            this.labelSprites.filter(s => s.visible && s.userData.isSectionLabel)
        );
        if (labelIntersects.length > 0) {
            this.renderer.domElement.style.cursor = 'pointer';
            return;
        }
        
        // Check for nodes
        const nodeIntersects = this.raycaster.intersectObjects(
            this.nodeObjects.filter(o => o.visible)
        );
        if (nodeIntersects.length > 0) {
            this.renderer.domElement.style.cursor = 'pointer';
            return;
        }
        
        // Default cursor
        this.renderer.domElement.style.cursor = 'grab';
    }
    
    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading-overlay').classList.add('hidden');
            this.isLoading = false;
        }, 500);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        
        // Apply inertia when not dragging (Google Earth-like momentum)
        if (!this.isDragging && !this.isPanning) {
            // Apply angular velocity with decay
            this.targetSpherical.theta += this.velocity.theta;
            this.targetSpherical.phi += this.velocity.phi;
            
            // Clamp phi to prevent flipping
            this.targetSpherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.targetSpherical.phi));
            
            // Apply pan velocity with decay
            this.targetOrbitCenter.add(this.panVelocity);
            
            // Decay velocities (inertia damping)
            const inertiaDecay = 0.95;
            this.velocity.theta *= inertiaDecay;
            this.velocity.phi *= inertiaDecay;
            this.panVelocity.multiplyScalar(inertiaDecay);
            
            // Stop tiny velocities
            if (Math.abs(this.velocity.theta) < 0.00001) this.velocity.theta = 0;
            if (Math.abs(this.velocity.phi) < 0.00001) this.velocity.phi = 0;
            if (this.panVelocity.length() < 0.001) this.panVelocity.set(0, 0, 0);
        }
        
        // Auto-rotate when idle (gentle theta rotation)
        if (this.autoRotate && !this.isDragging && !this.isPanning && !this.selectedNode) {
            this.targetSpherical.theta += this.autoRotateSpeed;
        }
        
        // Smooth damping for all camera movements
        const damping = this.dampingFactor;
        
        // Smooth interpolation for spherical coordinates
        this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * damping;
        this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * damping;
        this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * damping;
        
        // Smooth interpolation for orbit center
        this.orbitCenter.lerp(this.targetOrbitCenter, damping);
        
        // Calculate camera position from spherical coordinates
        // (theta = azimuth around Y, phi = polar angle from Y axis)
        const sinPhi = Math.sin(this.spherical.phi);
        const cosPhi = Math.cos(this.spherical.phi);
        const sinTheta = Math.sin(this.spherical.theta);
        const cosTheta = Math.cos(this.spherical.theta);
        
        this.camera.position.set(
            this.orbitCenter.x + this.spherical.radius * sinPhi * sinTheta,
            this.orbitCenter.y + this.spherical.radius * cosPhi,
            this.orbitCenter.z + this.spherical.radius * sinPhi * cosTheta
        );
        
        // Look at orbit center
        this.camera.lookAt(this.orbitCenter);
        
        // Update camera light position (follows camera for front illumination)
        if (this.cameraLight) {
            this.cameraLight.position.copy(this.camera.position);
        }
        
        // Animated connection glow - brighter pulse
        if (this.showEdges) {
            this.edgeObjects.forEach((line, i) => {
                if (line.visible) {
                    const pulse = 0.6 + Math.sin(time * 2 + i * 0.05) * 0.15;
                    line.material.opacity = pulse;
                    // Also pulse arrow if exists
                    if (line.userData.arrow && line.userData.arrow.visible) {
                        line.userData.arrow.material.opacity = pulse * 0.9;
                    }
                }
            });
        }
        
        // Subtle node animation + depth-based effects
        this.nodeObjects.forEach((obj, i) => {
            if (!obj.visible) return;
            
            const distance = this.camera.position.distanceTo(obj.position);
            
            // Distance-based scale (closer = larger, further = smaller)
            const baseSize = 1.0;
            const minScale = 0.5;
            const maxScale = 1.8;
            const scaleFactor = Math.max(minScale, Math.min(maxScale, 800 / distance));
            
            if (obj !== this.selectedNode) {
                obj.position.y = obj.userData.node._position.y + 
                    Math.sin(time * 0.5 + i * 0.1) * 0.5;
                
                // Distance-based emissive intensity (closer = brighter glow)
                const distanceFactor = Math.max(0.2, Math.min(1.0, 400 / distance));
                const pulse = (0.3 + Math.sin(time * 1.5 + i * 0.2) * 0.1) * distanceFactor;
                obj.material.emissiveIntensity = pulse + (distanceFactor * 0.4);
                
                // Distance-based opacity (closer = more solid, further = slightly faded)
                obj.material.opacity = 0.5 + distanceFactor * 0.45;
                
                // Apply distance-based scale
                obj.scale.setScalar(scaleFactor);
            } else {
                // Selected node stays prominent
                obj.scale.setScalar(1.5);
                obj.material.opacity = 1.0;
            }
        });
        
        // Section labels - constant screen size (scale proportionally with distance)
        this.labelSprites.forEach(sprite => {
            const distance = this.camera.position.distanceTo(sprite.position);
            // Constant screen size: scale increases with distance
            const baseScale = 100;
            const scale = baseScale * (distance / 400);  // Reference distance of 400
            sprite.scale.set(scale, scale * 0.18, 1);
        });
        
        // Node labels - constant screen size + show when close or selected
        const showDistance = 250;  // Distance at which labels appear
        this.nodeObjects.forEach(obj => {
            const labelSprite = obj.userData.labelSprite;
            if (!labelSprite) return;
            
            const distance = this.camera.position.distanceTo(obj.position);
            
            // Constant screen size scaling - larger base for better readability
            const baseScale = 55;
            const scale = baseScale * (distance / 300);
            labelSprite.scale.set(scale, scale * 0.19, 1);  // Adjusted aspect ratio for new canvas size
            
            // Follow node position (for animation)
            labelSprite.position.copy(obj.position);
            labelSprite.position.y += 10;
            
            // Show label when close, always show if selected
            const isConnectedToSelected = this.selectedNode && 
                this.edges.some(e => 
                    (e.source === this.selectedNode.userData.node.id && e.target === obj.userData.node.id) ||
                    (e.target === this.selectedNode.userData.node.id && e.source === obj.userData.node.id)
                );
            
            labelSprite.visible = obj.visible && (
                obj === this.selectedNode ||
                isConnectedToSelected ||
                distance < showDistance
            );
        });
        
        // FPS counter
        this.frameCount++;
        if (time - this.lastFpsUpdate > 1) {
            document.getElementById('fps').textContent = `${Math.round(this.frameCount / (time - this.lastFpsUpdate))} FPS`;
            this.lastFpsUpdate = time;
            this.frameCount = 0;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AILandscape3D();
});
