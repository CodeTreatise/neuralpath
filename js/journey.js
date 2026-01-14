/**
 * AI Journey - Enchanted Forest Path Through AI History
 * Three.js powered whimsical cartoon nature visualization
 */

class AIJourney3D {
    constructor() {
        this.timelineData = null;
        this.events = [];
        this.eras = [];
        this.currentEventIndex = 0;
        this.targetPosition = 0;
        this.currentPosition = 0;
        this.autoPlayInterval = null;
        this.isAutoPlaying = false;
        
        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.roadPath = null;
        this.milestones = [];
        
        // Road configuration - forest path style
        this.roadConfig = {
            segmentLength: 100,      // Distance between events
            roadWidth: 6,
            curveAmplitude: 60,      // How much the path curves (increased for winding path)
            curveFrequency: 0.15,    // Curve frequency - more frequent curves
        };
        
        // Nature colors
        this.colors = {
            sky: 0x87CEEB,
            grass: 0x7CB342,
            grassLight: 0x9CCC65,
            path: 0xD7CCC8,
            pathDark: 0xA1887F,
            treeTrunk: 0x8D6E63,
            treeLeaves: 0x43A047,
            treeLeavesLight: 0x66BB6A,
            flowerPink: 0xF48FB1,
            flowerYellow: 0xFFF176,
            flowerPurple: 0xCE93D8,
            shopRoof: 0xFF7043,
            shopWall: 0xFFF3E0,
            wood: 0x6D4C41
        };
        
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.setupThreeJS();
        this.createScene();
        this.setupDOM();
        this.renderEraLegend();
        this.setupEventListeners();
        this.animate();
        this.updateHUD();
    }
    
    async loadData() {
        try {
            const response = await fetch('../data/ai-timeline.json');
            this.timelineData = await response.json();
            this.events = this.timelineData.events;
            this.eras = this.timelineData.eras;
        } catch (error) {
            console.error('Failed to load timeline data:', error);
        }
    }
    
    setupThreeJS() {
        const container = document.getElementById('canvas-container');
        
        // Scene with sky gradient background
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.colors.sky);
        
        // Camera - first person perspective
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 3, 10);
        this.camera.lookAt(0, 2, -50);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(this.colors.sky);
        container.appendChild(this.renderer.domElement);
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    createScene() {
        // Bright sunny lighting
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
        this.scene.add(ambientLight);
        
        // Sun light (warm yellow)
        const sunLight = new THREE.DirectionalLight(0xFFF5E1, 1.0);
        sunLight.position.set(100, 200, 100);
        sunLight.castShadow = true;
        this.scene.add(sunLight);
        
        // Fill light (soft blue from sky)
        const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
        fillLight.position.set(-50, 100, 50);
        this.scene.add(fillLight);
        
        // Create the sky dome
        this.createSky();
        
        // Create clouds
        this.createClouds();
        
        // Create ground/grass
        this.createGround();
        
        // Create the path
        this.createPath();
        
        // Create event milestones (as cottages/shops)
        this.createMilestones();
        
        // Create era-based evolving environment (museum walkthrough)
        this.createEvolvingEnvironment();
        
        // Create trees along the path (fewer, as era environments add their own)
        this.createTrees();
        
        // Create flowers and decorations
        this.createDecorations();
        
        // Create distant mountains/hills
        this.createHills();
    }
    
    // Create environment that evolves through technological eras
    createEvolvingEnvironment() {
        // Define era environments - the world transforms as you progress
        const eraEnvironments = {
            'prerequisites': {
                // 1847-1939: Academic/Victorian era
                structures: ['library', 'university', 'observatory'],
                props: ['bookstack', 'telescope', 'gasLamp'],
                groundColor: 0x558B2F, // Natural green
                skyTint: 0x87CEEB, // Clear blue
                label: '📚 Age of Mathematics'
            },
            'foundations': {
                // 1940-1956: Industrial/WW2 era
                structures: ['factory', 'warehouse', 'lab'],
                props: ['smokestack', 'crane', 'electrical'],
                groundColor: 0x6D4C41, // Brown industrial
                skyTint: 0x90A4AE, // Slightly grey
                label: '🏭 Industrial Age'
            },
            'early-ai': {
                // 1956-1974: Space age/Universities
                structures: ['researchCenter', 'antenna', 'computerRoom'],
                props: ['satellite', 'radar', 'mainframe'],
                groundColor: 0x5D4037, // Concrete brown
                skyTint: 0x78909C, // Tech grey
                label: '🚀 Space Age Computing'
            },
            'first-winter': {
                // 1974-1980: Quieter period
                structures: ['office', 'smallLab'],
                props: ['papers', 'typewriter'],
                groundColor: 0x455A64, // Muted
                skyTint: 0x607D8B, // Overcast
                label: '❄️ AI Winter'
            },
            'expert-systems': {
                // 1980-1987: Corporate computing
                structures: ['corporateBuilding', 'serverRoom', 'cubicles'],
                props: ['desktop', 'printer', 'fax'],
                groundColor: 0x37474F, // Urban grey
                skyTint: 0x546E7A,
                label: '🏢 Corporate Era'
            },
            'second-winter': {
                // 1987-1993: Transition period
                structures: ['smallOffice', 'garage'],
                props: ['laptop', 'cdrom'],
                groundColor: 0x455A64,
                skyTint: 0x607D8B,
                label: '🌨️ Second Winter'
            },
            'ml-rise': {
                // 1993-2011: Internet age
                structures: ['dataCenter', 'techCampus', 'serverFarm'],
                props: ['server', 'fiber', 'router'],
                groundColor: 0x263238, // Dark tech
                skyTint: 0x1565C0, // Digital blue
                label: '🌐 Internet Age'
            },
            'deep-learning': {
                // 2012-2017: GPU computing
                structures: ['gpuFarm', 'modernLab', 'techHub'],
                props: ['gpuRack', 'neuralViz', 'smartphone'],
                groundColor: 0x1A237E, // Deep blue
                skyTint: 0x0D47A1,
                label: '🧠 Deep Learning Era'
            },
            'transformers': {
                // 2017-2022: Cloud AI
                structures: ['cloudCenter', 'aiLab', 'tpuCluster'],
                props: ['cloudSymbol', 'transformer', 'hologram'],
                groundColor: 0x311B92, // Purple tech
                skyTint: 0x4A148C,
                label: '☁️ Cloud AI Era'
            },
            'genai': {
                // 2022+: Generative AI future
                structures: ['futuristicTower', 'aiHub', 'holoCenter'],
                props: ['robot', 'hologram', 'neuralOrb'],
                groundColor: 0x4A148C, // Futuristic purple
                skyTint: 0x6A1B9A,
                label: '✨ Generative AI Era'
            }
        };
        
        // Store animated elements for the animate loop
        this.eraElements = [];
        
        // Create environment zones based on where each era starts
        this.eras.forEach((era, eraIndex) => {
            const env = eraEnvironments[era.id];
            if (!env) return;
            
            // Find events in this era to determine zone boundaries
            const eraEvents = this.events.filter(e => 
                e.year >= era.start_year && e.year <= era.end_year
            );
            if (eraEvents.length === 0) return;
            
            const startEventIdx = this.events.indexOf(eraEvents[0]);
            const endEventIdx = this.events.indexOf(eraEvents[eraEvents.length - 1]);
            
            const startT = startEventIdx / this.events.length;
            const endT = (endEventIdx + 1) / this.events.length;
            
            // Create environment elements throughout this era's zone
            this.createEraZone(era, env, startT, endT, eraIndex);
        });
    }
    
    createEraZone(era, env, startT, endT, eraIndex) {
        const numStructures = Math.max(3, Math.floor((endT - startT) * 30));
        const color = parseInt(era.color.replace('#', '0x'));
        
        for (let i = 0; i < numStructures; i++) {
            const t = startT + (i / numStructures) * (endT - startT);
            const point = this.roadPath.getPoint(t);
            const tangent = this.roadPath.getTangent(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            
            // Alternate sides, varying distances
            const side = i % 2 === 0 ? 1 : -1;
            const distance = 20 + Math.random() * 40;
            
            // Select structure type based on era
            const structureType = env.structures[i % env.structures.length];
            const structure = this.createEraStructure(structureType, color, eraIndex);
            
            structure.position.set(
                point.x + normal.x * distance * side,
                0,
                point.z + normal.z * distance * side
            );
            structure.rotation.y = Math.random() * Math.PI * 2;
            
            this.scene.add(structure);
            
            // Add floating era label at zone entrance
            if (i === 0) {
                this.createEraEnvironmentLabel(point, normal, env.label, color);
            }
            
            // Add props around structures
            if (Math.random() > 0.5) {
                const propType = env.props[Math.floor(Math.random() * env.props.length)];
                const prop = this.createEraProp(propType, color, eraIndex);
                prop.position.set(
                    point.x + normal.x * (distance - 5) * side,
                    0,
                    point.z + normal.z * (distance - 5) * side + (Math.random() - 0.5) * 10
                );
                this.scene.add(prop);
            }
        }
        
        // Create ground color zones (colored patches showing era)
        this.createEraGroundZone(startT, endT, env.groundColor, color);
    }
    
    createEraStructure(type, accentColor, eraIndex) {
        const group = new THREE.Group();
        
        switch(type) {
            case 'library':
            case 'university':
                this.createClassicBuilding(group, accentColor);
                break;
            case 'observatory':
                this.createObservatory(group, accentColor);
                break;
            case 'factory':
            case 'warehouse':
                this.createFactory(group, accentColor);
                break;
            case 'lab':
            case 'smallLab':
                this.createLab(group, accentColor);
                break;
            case 'researchCenter':
            case 'computerRoom':
                this.createResearchCenter(group, accentColor);
                break;
            case 'antenna':
                this.createAntenna(group, accentColor);
                break;
            case 'office':
            case 'smallOffice':
            case 'corporateBuilding':
                this.createOfficeBuilding(group, accentColor, eraIndex);
                break;
            case 'serverRoom':
            case 'cubicles':
                this.createServerRoom(group, accentColor);
                break;
            case 'garage':
                this.createGarage(group, accentColor);
                break;
            case 'dataCenter':
            case 'serverFarm':
                this.createDataCenter(group, accentColor);
                break;
            case 'techCampus':
            case 'techHub':
            case 'modernLab':
                this.createTechCampus(group, accentColor);
                break;
            case 'gpuFarm':
            case 'tpuCluster':
                this.createGpuFarm(group, accentColor);
                break;
            case 'cloudCenter':
            case 'aiLab':
                this.createCloudCenter(group, accentColor);
                break;
            case 'futuristicTower':
            case 'aiHub':
            case 'holoCenter':
                this.createFuturisticTower(group, accentColor);
                break;
            default:
                this.createGenericBuilding(group, accentColor);
        }
        
        return group;
    }
    
    // Classic academic building (Victorian/early 1900s)
    createClassicBuilding(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0xD7CCC8 }); // Stone color
        
        // Main building
        const main = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 10), mat);
        main.position.y = 4;
        group.add(main);
        
        // Columns
        const colMat = new THREE.MeshLambertMaterial({ color: 0xEFEBE9 });
        for (let i = 0; i < 4; i++) {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 6, 8), colMat);
            col.position.set(-4.5 + i * 3, 3, 5.5);
            group.add(col);
        }
        
        // Triangular roof
        const roofGeom = new THREE.ConeGeometry(8, 4, 4);
        const roof = new THREE.Mesh(roofGeom, new THREE.MeshLambertMaterial({ color: color }));
        roof.position.y = 10;
        roof.rotation.y = Math.PI / 4;
        group.add(roof);
        
        // Windows
        const winMat = new THREE.MeshBasicMaterial({ color: 0xFFF8E1 });
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 3; c++) {
                const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2, 0.1), winMat);
                win.position.set(-3 + c * 3, 3 + r * 3, 5.1);
                group.add(win);
            }
        }
    }
    
    createObservatory(group, color) {
        // Dome
        const domeMat = new THREE.MeshLambertMaterial({ color: 0x90A4AE });
        const dome = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
        dome.position.y = 8;
        group.add(dome);
        
        // Base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, 8, 16), new THREE.MeshLambertMaterial({ color: 0xBDBDBD }));
        base.position.y = 4;
        group.add(base);
        
        // Telescope slit
        const slitMat = new THREE.MeshBasicMaterial({ color: 0x263238 });
        const slit = new THREE.Mesh(new THREE.BoxGeometry(1, 5, 0.5), slitMat);
        slit.position.set(0, 10, 5);
        group.add(slit);
    }
    
    createFactory(group, color) {
        const brickMat = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
        
        // Main building
        const main = new THREE.Mesh(new THREE.BoxGeometry(15, 10, 12), brickMat);
        main.position.y = 5;
        group.add(main);
        
        // Smokestacks
        const stackMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
        for (let i = 0; i < 2; i++) {
            const stack = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.5, 12, 8), stackMat);
            stack.position.set(-4 + i * 8, 11, 0);
            group.add(stack);
            
            // Smoke puffs
            const smokeMat = new THREE.MeshBasicMaterial({ color: 0x9E9E9E, transparent: true, opacity: 0.6 });
            for (let j = 0; j < 3; j++) {
                const smoke = new THREE.Mesh(new THREE.SphereGeometry(1 + j * 0.5, 8, 8), smokeMat);
                smoke.position.set(-4 + i * 8 + (Math.random() - 0.5) * 2, 18 + j * 2, (Math.random() - 0.5) * 2);
                group.add(smoke);
            }
        }
        
        // Saw-tooth roof
        const roofMat = new THREE.MeshLambertMaterial({ color: color });
        for (let i = 0; i < 3; i++) {
            const roofSeg = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 12), roofMat);
            roofSeg.position.set(-5 + i * 5, 10.5, 0);
            roofSeg.rotation.z = 0.2;
            group.add(roofSeg);
        }
    }
    
    createLab(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0xECEFF1 });
        
        // Building
        const main = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 8), mat);
        main.position.y = 3;
        group.add(main);
        
        // Large windows
        const winMat = new THREE.MeshBasicMaterial({ color: 0xB3E5FC });
        const windows = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.1), winMat);
        windows.position.set(0, 3, 4.1);
        group.add(windows);
        
        // Roof equipment
        const equipMat = new THREE.MeshLambertMaterial({ color: 0x78909C });
        const equipment = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), equipMat);
        equipment.position.set(0, 7, 0);
        group.add(equipment);
    }
    
    createResearchCenter(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0xCFD8DC });
        
        // Modern building
        const main = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 10), mat);
        main.position.y = 4;
        group.add(main);
        
        // Glass facade
        const glassMat = new THREE.MeshBasicMaterial({ color: 0x64B5F6, transparent: true, opacity: 0.7 });
        const glass = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 0.1), glassMat);
        glass.position.set(0, 4, 5.1);
        group.add(glass);
        
        // Satellite dish on roof
        const dishMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const dish = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), dishMat);
        dish.position.set(4, 9, 0);
        dish.rotation.x = -0.5;
        group.add(dish);
    }
    
    createAntenna(group, color) {
        const metalMat = new THREE.MeshLambertMaterial({ color: 0x90A4AE });
        
        // Tower
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 20, 8), metalMat);
        tower.position.y = 10;
        group.add(tower);
        
        // Cross beams
        for (let i = 0; i < 4; i++) {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3), metalMat);
            beam.position.set(0, 5 + i * 4, 0);
            beam.rotation.y = i * Math.PI / 4;
            group.add(beam);
        }
        
        // Dish
        const dish = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), metalMat);
        dish.position.set(0, 18, 2);
        dish.rotation.x = -0.8;
        group.add(dish);
        
        // Blinking light
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const light = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), lightMat);
        light.position.set(0, 20.5, 0);
        group.add(light);
    }
    
    createOfficeBuilding(group, color, eraIndex) {
        const height = 8 + eraIndex * 2; // Taller in later eras
        const mat = new THREE.MeshLambertMaterial({ color: 0xB0BEC5 });
        
        // Building
        const main = new THREE.Mesh(new THREE.BoxGeometry(10, height, 8), mat);
        main.position.y = height / 2;
        group.add(main);
        
        // Window grid
        const winMat = new THREE.MeshBasicMaterial({ color: 0x81D4FA });
        const floors = Math.floor(height / 3);
        for (let f = 0; f < floors; f++) {
            for (let w = 0; w < 4; w++) {
                const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 0.1), winMat);
                win.position.set(-3 + w * 2, 2 + f * 3, 4.1);
                group.add(win);
            }
        }
        
        // Company logo (color accent)
        const logoMat = new THREE.MeshBasicMaterial({ color: color });
        const logo = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 0.2), logoMat);
        logo.position.set(0, height - 1, 4.2);
        group.add(logo);
    }
    
    createServerRoom(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x37474F });
        
        // Building
        const main = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 10), mat);
        main.position.y = 2.5;
        group.add(main);
        
        // AC units on roof
        const acMat = new THREE.MeshLambertMaterial({ color: 0x78909C });
        for (let i = 0; i < 3; i++) {
            const ac = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 2), acMat);
            ac.position.set(-4 + i * 4, 5.75, 0);
            group.add(ac);
        }
        
        // Blinking server lights through window
        const winMat = new THREE.MeshBasicMaterial({ color: color });
        const win = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 0.1), winMat);
        win.position.set(0, 2.5, 5.1);
        group.add(win);
    }
    
    createGarage(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
        
        // Simple garage
        const main = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 6), mat);
        main.position.y = 2;
        group.add(main);
        
        // Garage door
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
        const door = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 0.2), doorMat);
        door.position.set(0, 1.5, 3.1);
        group.add(door);
    }
    
    createDataCenter(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x263238 });
        
        // Large windowless building
        const main = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 15), mat);
        main.position.y = 5;
        group.add(main);
        
        // Cooling towers
        const coolMat = new THREE.MeshLambertMaterial({ color: 0x455A64 });
        for (let i = 0; i < 4; i++) {
            const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 5, 8), coolMat);
            tower.position.set(-7 + i * 5, 12.5, 0);
            group.add(tower);
        }
        
        // Glowing vents
        const ventMat = new THREE.MeshBasicMaterial({ color: color });
        for (let i = 0; i < 3; i++) {
            const vent = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 0.1), ventMat);
            vent.position.set(-6 + i * 6, 3, 7.6);
            group.add(vent);
        }
        
        // Security fence
        this.addSecurityFence(group);
    }
    
    addSecurityFence(group) {
        const fenceMat = new THREE.MeshLambertMaterial({ color: 0x757575 });
        
        // Posts
        for (let i = 0; i < 6; i++) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 8), fenceMat);
            post.position.set(-12 + i * 5, 1.5, 10);
            group.add(post);
        }
        
        // Wire
        const wire = new THREE.Mesh(new THREE.BoxGeometry(25, 0.05, 0.05), fenceMat);
        wire.position.set(0, 2.5, 10);
        group.add(wire);
    }
    
    createTechCampus(group, color) {
        const glassMat = new THREE.MeshBasicMaterial({ color: 0x4FC3F7, transparent: true, opacity: 0.6 });
        const frameMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        
        // Modern glass building
        const glass = new THREE.Mesh(new THREE.BoxGeometry(15, 12, 12), glassMat);
        glass.position.y = 6;
        group.add(glass);
        
        // Frame
        const frame = new THREE.Mesh(new THREE.BoxGeometry(15.5, 12.5, 12.5), frameMat);
        frame.position.y = 6;
        frame.material.wireframe = true;
        group.add(frame);
        
        // Glowing accent
        const accentMat = new THREE.MeshBasicMaterial({ color: color });
        const accent = new THREE.Mesh(new THREE.BoxGeometry(15, 0.5, 12), accentMat);
        accent.position.y = 0.25;
        group.add(accent);
        
        // Rooftop garden
        const greenMat = new THREE.MeshLambertMaterial({ color: 0x66BB6A });
        const garden = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 6), greenMat);
        garden.position.set(0, 12.5, 0);
        group.add(garden);
    }
    
    createGpuFarm(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x1A237E });
        
        // Dark building
        const main = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 14), mat);
        main.position.y = 4;
        group.add(main);
        
        // LED strip lighting
        const ledMat = new THREE.MeshBasicMaterial({ color: color });
        for (let i = 0; i < 5; i++) {
            const led = new THREE.Mesh(new THREE.BoxGeometry(18, 0.2, 0.1), ledMat);
            led.position.set(0, 1 + i * 1.5, 7.1);
            group.add(led);
        }
        
        // Massive cooling
        const coolMat = new THREE.MeshLambertMaterial({ color: 0x90CAF9 });
        for (let i = 0; i < 6; i++) {
            const fan = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.3, 8), coolMat);
            fan.rotation.x = Math.PI / 2;
            fan.position.set(-7.5 + i * 3, 4, 7.2);
            group.add(fan);
        }
    }
    
    createCloudCenter(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x311B92 });
        
        // Futuristic curved building
        const main = new THREE.Mesh(new THREE.CylinderGeometry(8, 10, 15, 16), mat);
        main.position.y = 7.5;
        group.add(main);
        
        // Glowing rings
        const ringMat = new THREE.MeshBasicMaterial({ color: color });
        for (let i = 0; i < 4; i++) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(9 - i, 0.3, 8, 32), ringMat);
            ring.position.y = 3 + i * 4;
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
            this.eraElements.push({ mesh: ring, type: 'ring', baseY: ring.position.y });
        }
        
        // Floating data orbs
        const orbMat = new THREE.MeshBasicMaterial({ color: 0xE1BEE7, transparent: true, opacity: 0.7 });
        for (let i = 0; i < 5; i++) {
            const orb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), orbMat);
            const angle = (i / 5) * Math.PI * 2;
            orb.position.set(Math.cos(angle) * 12, 10 + Math.sin(i) * 3, Math.sin(angle) * 12);
            group.add(orb);
            this.eraElements.push({ mesh: orb, type: 'orb', baseY: orb.position.y, angle: angle });
        }
    }
    
    createFuturisticTower(group, color) {
        // Sleek futuristic tower
        const mat = new THREE.MeshLambertMaterial({ color: 0x4A148C });
        
        // Main spire
        const spire = new THREE.Mesh(new THREE.ConeGeometry(5, 25, 6), mat);
        spire.position.y = 12.5;
        group.add(spire);
        
        // Base platform
        const baseMat = new THREE.MeshBasicMaterial({ color: color });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(8, 10, 2, 6), baseMat);
        base.position.y = 1;
        group.add(base);
        
        // Floating rings
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xCE93D8, transparent: true, opacity: 0.6 });
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(4 + i * 2, 0.2, 8, 32), ringMat);
            ring.position.y = 5 + i * 6;
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
            this.eraElements.push({ mesh: ring, type: 'floatRing', baseY: ring.position.y, offset: i });
        }
        
        // Holographic top
        const holoMat = new THREE.MeshBasicMaterial({ color: 0xE1BEE7, transparent: true, opacity: 0.5 });
        const holo = new THREE.Mesh(new THREE.OctahedronGeometry(2, 0), holoMat);
        holo.position.y = 27;
        group.add(holo);
        this.eraElements.push({ mesh: holo, type: 'holo' });
    }
    
    createGenericBuilding(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });
        const main = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 6), mat);
        main.position.y = 3;
        group.add(main);
    }
    
    // Era props (smaller elements)
    createEraProp(type, color, eraIndex) {
        const group = new THREE.Group();
        
        switch(type) {
            case 'bookstack':
                this.createBookstackProp(group, color);
                break;
            case 'telescope':
                this.createTelescopeProp(group, color);
                break;
            case 'gasLamp':
                this.createGasLampProp(group, color);
                break;
            case 'smokestack':
            case 'crane':
                this.createCraneProp(group, color);
                break;
            case 'electrical':
                this.createElectricalProp(group, color);
                break;
            case 'satellite':
            case 'radar':
                this.createRadarProp(group, color);
                break;
            case 'mainframe':
                this.createMainframeProp(group, color);
                break;
            case 'papers':
            case 'typewriter':
                this.createTypewriterProp(group, color);
                break;
            case 'desktop':
            case 'printer':
            case 'fax':
                this.createDesktopProp(group, color);
                break;
            case 'laptop':
            case 'cdrom':
                this.createLaptopProp(group, color);
                break;
            case 'server':
            case 'router':
            case 'fiber':
                this.createServerProp(group, color);
                break;
            case 'gpuRack':
            case 'smartphone':
            case 'neuralViz':
                this.createGpuProp(group, color);
                break;
            case 'cloudSymbol':
            case 'transformer':
            case 'hologram':
                this.createHologramProp(group, color);
                break;
            case 'robot':
            case 'neuralOrb':
                this.createRobotProp(group, color);
                break;
            default:
                this.createGenericProp(group, color);
        }
        
        group.scale.setScalar(1.5);
        return group;
    }
    
    createBookstackProp(group, color) {
        for (let i = 0; i < 4; i++) {
            const book = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.15, 0.5),
                new THREE.MeshLambertMaterial({ color: [0x8D6E63, 0x5D4037, 0x3E2723, color][i] })
            );
            book.position.y = 0.1 + i * 0.15;
            book.rotation.y = (Math.random() - 0.5) * 0.3;
            group.add(book);
        }
    }
    
    createTelescopeProp(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x795548 });
        // Tripod
        for (let i = 0; i < 3; i++) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 8), mat);
            const angle = (i / 3) * Math.PI * 2;
            leg.position.set(Math.cos(angle) * 0.5, 1, Math.sin(angle) * 0.5);
            leg.rotation.x = 0.3;
            leg.rotation.z = angle;
            group.add(leg);
        }
        // Tube
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.1, 1.5, 8), new THREE.MeshLambertMaterial({ color: 0xFFD700 }));
        tube.position.set(0, 1.8, 0);
        tube.rotation.x = 0.5;
        group.add(tube);
    }
    
    createGasLampProp(group, color) {
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x424242 });
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 3, 8), poleMat);
        pole.position.y = 1.5;
        group.add(pole);
        
        const lampMat = new THREE.MeshBasicMaterial({ color: 0xFFE082 });
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), lampMat);
        lamp.position.y = 3.3;
        group.add(lamp);
    }
    
    createCraneProp(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0xFF9800 });
        // Tower
        const tower = new THREE.Mesh(new THREE.BoxGeometry(0.5, 8, 0.5), mat);
        tower.position.y = 4;
        group.add(tower);
        // Arm
        const arm = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 0.3), mat);
        arm.position.set(2, 8, 0);
        group.add(arm);
    }
    
    createElectricalProp(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x795548 });
        // Pole
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 6, 8), mat);
        pole.position.y = 3;
        group.add(pole);
        // Cross arm
        const cross = new THREE.Mesh(new THREE.BoxGeometry(3, 0.15, 0.15), mat);
        cross.position.y = 5.5;
        group.add(cross);
        // Insulators
        const insMat = new THREE.MeshLambertMaterial({ color: 0xE0E0E0 });
        for (let i = 0; i < 3; i++) {
            const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8), insMat);
            ins.position.set(-1 + i, 5.7, 0);
            group.add(ins);
        }
    }
    
    createRadarProp(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });
        // Dish
        const dish = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
        dish.position.y = 2;
        dish.rotation.x = -0.5;
        group.add(dish);
        // Stand
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2, 8), mat);
        stand.position.y = 1;
        group.add(stand);
    }
    
    createMainframeProp(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x78909C });
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 1), mat);
        cabinet.position.y = 1.25;
        group.add(cabinet);
        // Lights
        const lightMat = new THREE.MeshBasicMaterial({ color: 0x4CAF50 });
        for (let i = 0; i < 4; i++) {
            const light = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), lightMat);
            light.position.set(-0.5 + i * 0.3, 2, 0.55);
            group.add(light);
        }
    }
    
    createTypewriterProp(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x424242 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(1, 0.4, 0.8), mat);
        body.position.y = 0.7;
        group.add(body);
        // Paper
        const paper = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.02), new THREE.MeshLambertMaterial({ color: 0xFFFDE7 }));
        paper.position.set(0, 1.2, 0);
        group.add(paper);
    }
    
    createDesktopProp(group, color) {
        // Monitor
        const monMat = new THREE.MeshLambertMaterial({ color: 0xE0E0E0 });
        const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 0.3), monMat);
        monitor.position.y = 1;
        group.add(monitor);
        // Screen
        const screen = new THREE.Mesh(new THREE.BoxGeometry(1, 0.75, 0.02), new THREE.MeshBasicMaterial({ color: 0x2196F3 }));
        screen.position.set(0, 1, 0.17);
        group.add(screen);
    }
    
    createLaptopProp(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });
        // Base
        const base = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 0.7), mat);
        base.position.y = 0.54;
        group.add(base);
        // Screen
        const screen = new THREE.Mesh(new THREE.BoxGeometry(1, 0.7, 0.05), mat);
        screen.position.set(0, 0.9, -0.3);
        screen.rotation.x = 0.2;
        group.add(screen);
        // Display
        const disp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.02), new THREE.MeshBasicMaterial({ color: color }));
        disp.position.set(0, 0.9, -0.27);
        disp.rotation.x = 0.2;
        group.add(disp);
    }
    
    createServerProp(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x37474F });
        const rack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2, 0.6), mat);
        rack.position.y = 1;
        group.add(rack);
        // LEDs
        const ledMat = new THREE.MeshBasicMaterial({ color: color });
        for (let i = 0; i < 5; i++) {
            const led = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.02), ledMat);
            led.position.set(0, 0.3 + i * 0.35, 0.32);
            group.add(led);
        }
    }
    
    createGpuProp(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x1B5E20 });
        const card = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 0.8), mat);
        card.position.y = 0.8;
        card.rotation.x = -0.4;
        group.add(card);
        // LED strip
        const led = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.03, 0.1), new THREE.MeshBasicMaterial({ color: color }));
        led.position.set(0, 0.88, 0.35);
        led.rotation.x = -0.4;
        group.add(led);
    }
    
    createHologramProp(group, color) {
        // Holographic display
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x37474F });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 0.3, 16), baseMat);
        base.position.y = 0.15;
        group.add(base);
        
        // Hologram cone
        const holoMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.4 });
        const holo = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2, 16, 1, true), holoMat);
        holo.position.y = 1.3;
        group.add(holo);
        
        // Floating symbol
        const symbol = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), new THREE.MeshBasicMaterial({ color: color }));
        symbol.position.y = 1.8;
        group.add(symbol);
        this.eraElements.push({ mesh: symbol, type: 'holo' });
    }
    
    createRobotProp(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x90A4AE });
        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.5), mat);
        body.position.y = 1;
        group.add(body);
        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.4), mat);
        head.position.y = 1.75;
        group.add(head);
        // Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: color });
        const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
        eye1.position.set(-0.15, 1.8, 0.22);
        group.add(eye1);
        const eye2 = eye1.clone();
        eye2.position.x = 0.15;
        group.add(eye2);
    }
    
    createGenericProp(group, color) {
        const mat = new THREE.MeshLambertMaterial({ color: color });
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat);
        box.position.y = 0.25;
        group.add(box);
    }
    
    // Create era environment floating label
    createEraEnvironmentLabel(point, normal, label, color) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1024;
        canvas.height = 256;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.roundRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 30);
        ctx.fill();
        
        // Border
        const hexColor = '#' + color.toString(16).padStart(6, '0');
        ctx.strokeStyle = hexColor;
        ctx.lineWidth = 8;
        this.roundRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 30);
        ctx.stroke();
        
        // Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 72px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(20, 5, 1);
        sprite.position.set(point.x, 15, point.z);
        this.scene.add(sprite);
    }
    
    // Create colored ground zones for each era
    createEraGroundZone(startT, endT, groundColor, accentColor) {
        const segments = 50;
        const width = 80;
        
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const t = startT + (i / segments) * (endT - startT);
            const point = this.roadPath.getPoint(t);
            const tangent = this.roadPath.getTangent(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            
            // Create points on both sides
            points.push(
                new THREE.Vector3(point.x + normal.x * width, 0.02, point.z + normal.z * width),
                new THREE.Vector3(point.x - normal.x * width, 0.02, point.z - normal.z * width)
            );
        }
        
        // Create edge glow lines
        const lineMat = new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.3 });
        const leftPoints = [];
        const rightPoints = [];
        
        for (let i = 0; i <= segments; i++) {
            const t = startT + (i / segments) * (endT - startT);
            const point = this.roadPath.getPoint(t);
            const tangent = this.roadPath.getTangent(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            
            leftPoints.push(new THREE.Vector3(point.x + normal.x * 60, 0.1, point.z + normal.z * 60));
            rightPoints.push(new THREE.Vector3(point.x - normal.x * 60, 0.1, point.z - normal.z * 60));
        }
        
        const leftGeom = new THREE.BufferGeometry().setFromPoints(leftPoints);
        const leftLine = new THREE.Line(leftGeom, lineMat);
        this.scene.add(leftLine);
        
        const rightGeom = new THREE.BufferGeometry().setFromPoints(rightPoints);
        const rightLine = new THREE.Line(rightGeom, lineMat);
        this.scene.add(rightLine);
    }

    createSky() {
        // Gradient sky dome
        const skyGeometry = new THREE.SphereGeometry(4000, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x87CEEB) },
                bottomColor: { value: new THREE.Color(0xE0F4FF) },
                offset: { value: 400 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
        
        // Sun
        const sunGeometry = new THREE.CircleGeometry(80, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFEB3B,
            transparent: true,
            opacity: 0.9
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(500, 400, -800);
        sun.lookAt(0, 0, 0);
        this.scene.add(sun);
        
        // Sun glow
        const glowGeometry = new THREE.CircleGeometry(120, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFF9C4,
            transparent: true,
            opacity: 0.4
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(500, 400, -801);
        glow.lookAt(0, 0, 0);
        this.scene.add(glow);
    }
    
    createClouds() {
        const totalLength = this.events.length * this.roadConfig.segmentLength;
        
        // Create fluffy cartoon clouds
        for (let i = 0; i < 30; i++) {
            const cloud = this.createCloud();
            cloud.position.set(
                (Math.random() - 0.5) * 1500,
                150 + Math.random() * 200,
                -Math.random() * (totalLength + 500)
            );
            cloud.scale.setScalar(10 + Math.random() * 20);
            this.scene.add(cloud);
        }
    }
    
    createCloud() {
        const cloud = new THREE.Group();
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.9
        });
        
        // Create puffy cloud from spheres
        const positions = [
            [0, 0, 0], [1.5, 0.2, 0], [-1.5, 0.1, 0],
            [0.7, 0.5, 0.3], [-0.7, 0.4, -0.2],
            [0, 0.3, 0.5]
        ];
        
        positions.forEach(pos => {
            const size = 0.8 + Math.random() * 0.6;
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(pos[0], pos[1], pos[2]);
            cloud.add(sphere);
        });
        
        return cloud;
    }
    
    createGround() {
        const totalLength = this.events.length * this.roadConfig.segmentLength;
        
        // Main grass ground
        const groundGeometry = new THREE.PlaneGeometry(3000, totalLength + 2000);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: this.colors.grass,
            side: THREE.DoubleSide
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, -0.1, -totalLength / 2);
        this.scene.add(ground);
        
        // Add grass texture variation
        const grassPatchGeometry = new THREE.PlaneGeometry(2000, totalLength + 1000);
        const grassPatchMaterial = new THREE.MeshLambertMaterial({ 
            color: this.colors.grassLight,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 5; i++) {
            const patch = new THREE.Mesh(grassPatchGeometry, grassPatchMaterial);
            patch.rotation.x = -Math.PI / 2;
            patch.rotation.z = Math.random() * Math.PI;
            patch.position.set(
                (Math.random() - 0.5) * 500,
                -0.05, // Lower slightly to avoid Z-fighting with path (at y=0) but above ground (at y=-0.1)
                -totalLength / 2 + (Math.random() - 0.5) * totalLength
            );
            patch.scale.set(0.3 + Math.random() * 0.5, 0.3 + Math.random() * 0.5, 1);
            this.scene.add(patch);
        }
    }
    
    createPath() {
        const totalLength = this.events.length * this.roadConfig.segmentLength;
        
        // Create path points with gentle curves
        const pathPoints = [];
        for (let i = 0; i <= this.events.length; i++) {
            const z = -i * this.roadConfig.segmentLength;
            const x = Math.sin(i * this.roadConfig.curveFrequency) * this.roadConfig.curveAmplitude;
            const y = 0;
            pathPoints.push(new THREE.Vector3(x, y, z));
        }
        
        // Create smooth curve through points
        this.roadPath = new THREE.CatmullRomCurve3(pathPoints);
        
        // Create dirt path with rounded edges
        const pathShape = new THREE.Shape();
        const hw = this.roadConfig.roadWidth / 2;
        pathShape.moveTo(-hw, 0);
        pathShape.lineTo(hw, 0);
        pathShape.lineTo(hw, 0.15);
        pathShape.lineTo(-hw, 0.15);
        pathShape.lineTo(-hw, 0);
        
        const extrudeSettings = {
            steps: this.events.length * 10,
            bevelEnabled: false,
            extrudePath: this.roadPath
        };
        
        const pathGeometry = new THREE.ExtrudeGeometry(pathShape, extrudeSettings);
        const pathMaterial = new THREE.MeshLambertMaterial({
            color: this.colors.path
        });
        
        const path = new THREE.Mesh(pathGeometry, pathMaterial);
        this.scene.add(path);
        
        // Path edge (darker)
        this.createPathEdges();
        
        // Cobblestone markers
        this.createCobblestones();
    }
    
    createPathEdges() {
        const hw = this.roadConfig.roadWidth / 2;
        const segments = this.events.length * 20;
        
        const createEdge = (offset, color) => {
            const points = [];
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const point = this.roadPath.getPoint(t);
                const tangent = this.roadPath.getTangent(t);
                const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
                
                points.push(new THREE.Vector3(
                    point.x + normal.x * offset,
                    0.2,
                    point.z + normal.z * offset
                ));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ 
                color: color,
                linewidth: 2
            });
            
            const line = new THREE.Line(geometry, material);
            this.scene.add(line);
        };
        
        createEdge(-hw + 0.2, this.colors.pathDark);
        createEdge(hw - 0.2, this.colors.pathDark);
    }
    
    createCobblestones() {
        // Add small stone decorations along the path
        const stoneGeometry = new THREE.SphereGeometry(0.15, 6, 4);
        const stoneMaterial = new THREE.MeshLambertMaterial({ color: this.colors.pathDark });
        
        for (let i = 0; i < this.events.length * 5; i++) {
            const t = i / (this.events.length * 5);
            const point = this.roadPath.getPoint(t);
            const tangent = this.roadPath.getTangent(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            
            // Scatter stones along edges
            const side = Math.random() > 0.5 ? 1 : -1;
            const offset = (this.roadConfig.roadWidth / 2 - 0.5) * side + (Math.random() - 0.5) * 0.5;
            
            const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
            stone.position.set(
                point.x + normal.x * offset,
                0.1,
                point.z + normal.z * offset
            );
            stone.scale.set(
                0.8 + Math.random() * 0.4,
                0.5 + Math.random() * 0.3,
                0.8 + Math.random() * 0.4
            );
            this.scene.add(stone);
        }
    }
    
    createMilestones() {
        this.events.forEach((event, index) => {
            const t = index / this.events.length;
            const position = this.roadPath.getPoint(t);
            const tangent = this.roadPath.getTangent(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            
            // Get era color
            const era = this.eras.find(e => event.year >= e.start_year && event.year <= e.end_year);
            const color = era ? parseInt(era.color.replace('#', '0x')) : 0x81C784;
            
            // Alternate sides for milestones
            const side = index % 2 === 0 ? 1 : -1;
            const distance = 10;
            
            // Create cottage/shop for each milestone
            const cottage = this.createCottage(color, index);
            cottage.position.set(
                position.x + normal.x * distance * side,
                0,
                position.z + normal.z * distance * side
            );
            
            // Rotate to face the path
            cottage.lookAt(position.x, 0, position.z);
            this.scene.add(cottage);
            
            // Wooden signpost
            const signpost = this.createSignpost(event.title, color);
            signpost.position.set(
                position.x + normal.x * 8 * side,
                0,
                position.z + normal.z * 8 * side
            );
            // Rotate signpost to face the path (look at the milestone position on path)
            signpost.lookAt(position.x, 0, position.z);
            this.scene.add(signpost);
            
            // Era transition marker (special archway)
            if (index === 0 || (index > 0 && this.getEra(event) !== this.getEra(this.events[index - 1]))) {
                this.createEraMarker(position, normal, era, event.year, index === 0);
            }
            
            // Store milestone data
            this.milestones.push({
                index,
                event,
                position,
                cottage,
                signpost,
                t
            });
        });
    }
    
    createCottage(accentColor, index) {
        const cottage = new THREE.Group();
        
        // Base/walls
        const wallGeometry = new THREE.BoxGeometry(4, 3, 3);
        const wallMaterial = new THREE.MeshLambertMaterial({ color: this.colors.shopWall });
        const walls = new THREE.Mesh(wallGeometry, wallMaterial);
        walls.position.y = 1.5;
        cottage.add(walls);
        
        // Roof
        const roofGeometry = new THREE.ConeGeometry(3.5, 2, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: accentColor });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 4;
        roof.rotation.y = Math.PI / 4;
        cottage.add(roof);
        
        // Door
        const doorGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.1);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: this.colors.wood });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 0.75, 1.55);
        cottage.add(door);
        
        // Windows
        const windowGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.1);
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xB3E5FC });
        
        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(-1, 1.8, 1.55);
        cottage.add(window1);
        
        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(1, 1.8, 1.55);
        cottage.add(window2);
        
        // Chimney
        const chimneyGeometry = new THREE.BoxGeometry(0.5, 1.5, 0.5);
        const chimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x795548 });
        const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney.position.set(1.2, 4.5, 0);
        cottage.add(chimney);
        
        // Small fence
        this.addFence(cottage);
        
        return cottage;
    }
    
    addFence(cottage) {
        const fenceMaterial = new THREE.MeshLambertMaterial({ color: this.colors.wood });
        
        for (let i = -3; i <= 3; i++) {
            if (Math.abs(i) > 1) { // Leave gap for path
                const post = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.8, 0.15),
                    fenceMaterial
                );
                post.position.set(i * 0.8, 0.4, 3);
                cottage.add(post);
                
                // Horizontal bar
                if (i < 3 && Math.abs(i) > 1 && Math.abs(i + 1) > 1) {
                    const bar = new THREE.Mesh(
                        new THREE.BoxGeometry(0.8, 0.1, 0.1),
                        fenceMaterial
                    );
                    bar.position.set(i * 0.8 + 0.4, 0.5, 3);
                    cottage.add(bar);
                }
            }
        }
    }
    
    createSignpost(title, color) {
        const signpost = new THREE.Group();
        
        // Wooden pole
        const poleGeometry = new THREE.CylinderGeometry(0.15, 0.2, 3, 8);
        const poleMaterial = new THREE.MeshLambertMaterial({ color: this.colors.wood });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 1.5;
        signpost.add(pole);
        
        // Sign board
        const signGeometry = new THREE.BoxGeometry(2, 0.8, 0.1);
        const signMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE082 });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0.5, 2.8, 0);
        sign.rotation.y = Math.PI / 8;
        signpost.add(sign);
        
        // Color accent on sign
        const accentGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.12);
        const accentMaterial = new THREE.MeshLambertMaterial({ color: color });
        const accent = new THREE.Mesh(accentGeometry, accentMaterial);
        accent.position.set(-0.45, 2.8, 0);
        accent.rotation.y = Math.PI / 8;
        signpost.add(accent);
        
        return signpost;
    }
    
    getEra(event) {
        // Use pre-computed era field if available, otherwise fall back to year lookup
        if (event.era) {
            return this.eras.find(e => e.id === event.era);
        }
        return this.eras.find(e => event.year >= e.start_year && event.year <= e.end_year);
    }

    createTextTexture(text, width, height, bgColor, textColor = '#FFFFFF') {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;  // Higher resolution for crisp text
        canvas.height = 256;

        const ctx = canvas.getContext('2d');

        // Background with rounded corners effect
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 12;
        ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

        // Calculate font size to fit text (auto-scale for long names)
        let fontSize = 100;
        ctx.font = `bold ${fontSize}px "Fredoka", "Patrick Hand", sans-serif`;
        let textWidth = ctx.measureText(text).width;
        
        // Scale down if text is too wide (leave 80px padding on each side)
        const maxWidth = canvas.width - 160;
        if (textWidth > maxWidth) {
            fontSize = Math.floor(fontSize * (maxWidth / textWidth));
            ctx.font = `bold ${fontSize}px "Fredoka", "Patrick Hand", sans-serif`;
        }

        // Text shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        // Text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        // Reset shadow for clean texture
        ctx.shadowColor = 'transparent';

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
    
    createEraMarker(position, normal, era, year, isFirst = false) {
        if (!era) return;
        
        const color = parseInt(era.color.replace('#', '0x'));
        
        // Wooden archway - wider to avoid path overlap
        const archGroup = new THREE.Group();
        const pillarSpacing = 6; // Distance from center to each pillar (wider arch)
        
        // Left pillar
        const pillarGeometry = new THREE.CylinderGeometry(0.4, 0.5, 7, 8);
        const pillarMaterial = new THREE.MeshLambertMaterial({ color: this.colors.wood });
        
        const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        leftPillar.position.set(-pillarSpacing, 3.5, 0);
        archGroup.add(leftPillar);
        
        const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        rightPillar.position.set(pillarSpacing, 3.5, 0);
        archGroup.add(rightPillar);
        
        // Arch beam - wider to span pillars
        const beamGeometry = new THREE.BoxGeometry(pillarSpacing * 2 + 1, 0.6, 0.8);
        const beamMaterial = new THREE.MeshLambertMaterial({ color: this.colors.wood });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(0, 7.3, 0);
        archGroup.add(beam);
        
        // Decorative banner with text label - wider for long era names
        const bannerGeometry = new THREE.BoxGeometry(7.5, 1.5, 0.15);
        // Create text texture for the banner
        const texture = this.createTextTexture(era.name, 1024, 256, '#' + color.toString(16).padStart(6, '0'));
        const bannerMaterial = new THREE.MeshBasicMaterial({ map: texture }); // BasicMaterial for full brightness
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(0, 6.2, 0.5);
        archGroup.add(banner);
        
        // Flower decorations on arch
        const flowerColors = [0xF48FB1, 0xFFF176, 0xCE93D8];
        for (let i = 0; i < 8; i++) {
            const flower = this.createFlower(flowerColors[i % 3]);
            flower.position.set(
                -3.5 + i,
                7.5,
                0
            );
            flower.scale.setScalar(0.5);
            archGroup.add(flower);
        }

        // Align arch with path using tangent
        // Tangent can be derived from normal: normal = (-tz, 0, tx) -> tangent = (normal.z, 0, -normal.x)
        const tangent = new THREE.Vector3(normal.z, 0, -normal.x);
        const lookTarget = new THREE.Vector3().copy(position).add(tangent);
        archGroup.lookAt(lookTarget);
        
        // For first era marker, place it ahead of start so player sees it immediately
        // For other era markers, offset forward along path to prevent camera overlap
        const offsetDistance = isFirst ? 30 : 15;
        const forwardOffset = tangent.clone().multiplyScalar(-offsetDistance);
        archGroup.position.set(
            position.x + forwardOffset.x,
            0,
            position.z + forwardOffset.z
        );
        this.scene.add(archGroup);
    }
    
    createTrees() {
        const totalLength = this.events.length * this.roadConfig.segmentLength;
        const safeDistance = 20; // Minimum distance from path center
        
        // Create many trees along the path (properly offset from road)
        for (let i = 0; i < this.events.length * 3; i++) {
            const t = i / (this.events.length * 3);
            const point = this.roadPath.getPoint(t);
            const tangent = this.roadPath.getTangent(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            
            // Trees on both sides - ensure safe distance from path
            const side = Math.random() > 0.5 ? 1 : -1;
            const distance = safeDistance + Math.random() * 40; // 20-60 units from path
            
            const tree = this.createTree();
            // Position strictly along the normal, no random X offset that could put tree on road
            tree.position.set(
                point.x + normal.x * distance * side,
                0,
                point.z + normal.z * distance * side
            );
            tree.scale.setScalar(0.8 + Math.random() * 0.6);
            this.scene.add(tree);
        }
        
        // Background trees (placed far from path using path-aware positioning)
        for (let i = 0; i < 100; i++) {
            // Sample a point on the path to know where NOT to place trees
            const t = Math.random();
            const pathPoint = this.roadPath.getPoint(t);
            const tangent = this.roadPath.getTangent(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            
            // Place background trees far to the sides (80-200 units away)
            const side = Math.random() > 0.5 ? 1 : -1;
            const distance = 80 + Math.random() * 120;
            
            const tree = this.createTree();
            tree.position.set(
                pathPoint.x + normal.x * distance * side,
                0,
                pathPoint.z + normal.z * distance * side + (Math.random() - 0.5) * 100
            );
            tree.scale.setScalar(0.5 + Math.random() * 1.5);
            this.scene.add(tree);
        }
    }
    
    createTree() {
        const tree = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: this.colors.treeTrunk });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.5;
        tree.add(trunk);
        
        // Foliage (cartoon style - stacked spheres/cones)
        const foliageType = Math.random();
        
        if (foliageType < 0.5) {
            // Round tree
            const foliageGeometry = new THREE.SphereGeometry(2, 8, 6);
            const foliageMaterial = new THREE.MeshLambertMaterial({ 
                color: Math.random() > 0.5 ? this.colors.treeLeaves : this.colors.treeLeavesLight 
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 4.5;
            tree.add(foliage);
            
            // Extra puffs
            const puff1 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), foliageMaterial);
            puff1.position.set(1, 3.5, 0.5);
            tree.add(puff1);
            
            const puff2 = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), foliageMaterial);
            puff2.position.set(-0.8, 3.8, -0.5);
            tree.add(puff2);
        } else {
            // Pine tree
            const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x2E7D32 });
            
            const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.5, 3, 8), foliageMaterial);
            cone1.position.y = 3.5;
            tree.add(cone1);
            
            const cone2 = new THREE.Mesh(new THREE.ConeGeometry(2, 2.5, 8), foliageMaterial);
            cone2.position.y = 5.5;
            tree.add(cone2);
            
            const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2, 8), foliageMaterial);
            cone3.position.y = 7;
            tree.add(cone3);
        }
        
        return tree;
    }
    
    createDecorations() {
        const totalLength = this.events.length * this.roadConfig.segmentLength;
        
        // Flowers along the path
        const flowerColors = [
            this.colors.flowerPink,
            this.colors.flowerYellow,
            this.colors.flowerPurple
        ];
        
        for (let i = 0; i < this.events.length * 3; i++) {
            const t = Math.random();
            const point = this.roadPath.getPoint(t);
            const tangent = this.roadPath.getTangent(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            
            const side = Math.random() > 0.5 ? 1 : -1;
            const distance = 8 + Math.random() * 20;
            
            const flower = this.createFlower(flowerColors[Math.floor(Math.random() * flowerColors.length)]);
            flower.position.set(
                point.x + normal.x * distance * side,
                0,
                point.z + normal.z * distance * side
            );
            flower.scale.setScalar(0.3 + Math.random() * 0.4);
            this.scene.add(flower);
        }
        
        // Mushrooms
        for (let i = 0; i < this.events.length * 2; i++) {
            const t = Math.random();
            const point = this.roadPath.getPoint(t);
            const tangent = this.roadPath.getTangent(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            
            const side = Math.random() > 0.5 ? 1 : -1;
            const distance = 5 + Math.random() * 10;
            
            const mushroom = this.createMushroom();
            mushroom.position.set(
                point.x + normal.x * distance * side,
                0,
                point.z + normal.z * distance * side
            );
            mushroom.scale.setScalar(0.4 + Math.random() * 0.6);
            this.scene.add(mushroom);
        }
        
        // Butterflies (simple floating objects)
        this.createButterflies();
    }
    
    createFlower(color) {
        const flower = new THREE.Group();
        
        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x558B2F });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.5;
        flower.add(stem);
        
        // Petals
        const petalGeometry = new THREE.SphereGeometry(0.2, 6, 4);
        const petalMaterial = new THREE.MeshLambertMaterial({ color: color });
        
        for (let i = 0; i < 5; i++) {
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            const angle = (i / 5) * Math.PI * 2;
            petal.position.set(
                Math.cos(angle) * 0.25,
                1.1,
                Math.sin(angle) * 0.25
            );
            petal.scale.set(1, 0.5, 1);
            flower.add(petal);
        }
        
        // Center
        const centerGeometry = new THREE.SphereGeometry(0.15, 6, 4);
        const centerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFEB3B });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 1.1;
        flower.add(center);
        
        return flower;
    }
    
    createMushroom() {
        const mushroom = new THREE.Group();
        
        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8);
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0xFAFAFA });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.3;
        mushroom.add(stem);
        
        // Cap
        const capGeometry = new THREE.SphereGeometry(0.4, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
        const capMaterial = new THREE.MeshLambertMaterial({ color: 0xE53935 });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.y = 0.6;
        mushroom.add(cap);
        
        // White spots on cap
        const spotGeometry = new THREE.SphereGeometry(0.08, 6, 4);
        const spotMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        
        for (let i = 0; i < 5; i++) {
            const spot = new THREE.Mesh(spotGeometry, spotMaterial);
            const angle = (i / 5) * Math.PI * 2;
            const height = 0.6 + Math.random() * 0.15;
            spot.position.set(
                Math.cos(angle) * 0.25,
                height,
                Math.sin(angle) * 0.25
            );
            mushroom.add(spot);
        }
        
        return mushroom;
    }
    
    createButterflies() {
        const butterflyColors = [0xF48FB1, 0x81D4FA, 0xFFF176, 0xCE93D8];
        this.butterflies = [];
        
        for (let i = 0; i < 20; i++) {
            const t = Math.random();
            const point = this.roadPath.getPoint(t);
            
            const butterfly = new THREE.Group();
            
            // Simple wing shapes
            const wingGeometry = new THREE.CircleGeometry(0.3, 6);
            const wingMaterial = new THREE.MeshBasicMaterial({ 
                color: butterflyColors[Math.floor(Math.random() * butterflyColors.length)],
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            
            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.x = -0.2;
            leftWing.rotation.y = 0.3;
            butterfly.add(leftWing);
            
            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.x = 0.2;
            rightWing.rotation.y = -0.3;
            butterfly.add(rightWing);
            
            butterfly.position.set(
                point.x + (Math.random() - 0.5) * 30,
                2 + Math.random() * 4,
                point.z
            );
            
            butterfly.userData = {
                baseY: butterfly.position.y,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.5
            };
            
            this.butterflies.push(butterfly);
            this.scene.add(butterfly);
        }
    }
    
    createHills() {
        const totalLength = this.events.length * this.roadConfig.segmentLength;
        
        // Distant rolling hills - placed far to the sides to avoid blocking path
        const hillMaterial = new THREE.MeshLambertMaterial({ color: 0x558B2F });
        
        for (let i = 0; i < 15; i++) {
            const hillGeometry = new THREE.SphereGeometry(
                100 + Math.random() * 150,
                16, 8,
                0, Math.PI * 2,
                0, Math.PI / 2
            );
            const hill = new THREE.Mesh(hillGeometry, hillMaterial);
            
            // Place hills far to the left or right (at least 300 units from center)
            const side = Math.random() > 0.5 ? 1 : -1;
            const xOffset = side * (300 + Math.random() * 500);
            
            hill.position.set(
                xOffset,
                -30, // Lower so they appear as distant backdrop
                -200 - Math.random() * totalLength
            );
            this.scene.add(hill);
        }
    }
    
    // Create era-specific technology artifacts along the roadside
    createEraArtifacts() {
        // Define era-specific artifacts with their 3D representations
        const eraArtifacts = {
            'prerequisites': [
                { type: 'book', label: '📚 Logic Books' },
                { type: 'chalkboard', label: '📐 Mathematics' },
                { type: 'quill', label: '✒️ Manuscripts' }
            ],
            'foundations': [
                { type: 'vacuum_tube', label: '💡 Vacuum Tubes' },
                { type: 'mainframe', label: '🖥️ ENIAC' },
                { type: 'punch_card', label: '📇 Punch Cards' }
            ],
            'early-ai': [
                { type: 'terminal', label: '🖵 Terminals' },
                { type: 'reel_tape', label: '📼 Tape Storage' },
                { type: 'robot_arm', label: '🦾 First Robots' }
            ],
            'first-winter': [
                { type: 'papers', label: '📄 Research Papers' },
                { type: 'old_pc', label: '🖥️ Minicomputers' }
            ],
            'expert-systems': [
                { type: 'desktop', label: '🖥️ Desktop PCs' },
                { type: 'floppy', label: '💾 Floppy Disks' },
                { type: 'keyboard', label: '⌨️ Expert Systems' }
            ],
            'second-winter': [
                { type: 'laptop', label: '💻 Laptops' },
                { type: 'network', label: '🌐 Networks' }
            ],
            'ml-rise': [
                { type: 'server', label: '🗄️ Servers' },
                { type: 'globe', label: '🌍 Internet' },
                { type: 'data', label: '📊 Big Data' }
            ],
            'deep-learning': [
                { type: 'gpu', label: '🎮 GPUs' },
                { type: 'smartphone', label: '📱 Smartphones' },
                { type: 'neural', label: '🧠 Neural Nets' }
            ],
            'transformers': [
                { type: 'cloud', label: '☁️ Cloud AI' },
                { type: 'brain', label: '🧠 Transformers' },
                { type: 'chip', label: '🔲 TPUs' }
            ],
            'genai': [
                { type: 'robot', label: '🤖 AI Assistants' },
                { type: 'chat', label: '💬 ChatGPT' },
                { type: 'sparkle', label: '✨ GenAI' }
            ]
        };
        
        // Store artifacts for animation
        this.artifactBeacons = [];
        
        // Place artifacts along the path based on era
        this.events.forEach((event, index) => {
            // Place artifacts every 2nd event for better visibility
            if (index % 2 !== 0) return;
            
            const t = index / this.events.length;
            const point = this.roadPath.getPoint(t);
            const tangent = this.roadPath.getTangent(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            
            const era = this.getEra(event);
            if (!era) return;
            
            const artifacts = eraArtifacts[era.id];
            if (!artifacts || artifacts.length === 0) return;
            
            // Pick artifact based on index within era for variety
            const artifact = artifacts[index % artifacts.length];
            
            // Place on opposite side from cottages, closer to path
            const side = index % 4 < 2 ? -1 : 1; // Opposite side pattern from cottages
            const distance = 6 + Math.random() * 2; // Even closer to path
            
            const artifactGroup = this.createArtifact(artifact.type, artifact.label, era.color);
            artifactGroup.position.set(
                point.x + normal.x * distance * side,
                0,
                point.z + normal.z * distance * side
            );
            
            // Scale up larger for visibility
            artifactGroup.scale.setScalar(2.0);
            
            // Add glowing beacon above artifact (higher up)
            const beaconColor = parseInt(era.color.replace('#', '0x'));
            const beacon = this.createArtifactBeacon(beaconColor);
            beacon.position.set(
                point.x + normal.x * distance * side,
                8, // Higher up
                point.z + normal.z * distance * side
            );
            this.scene.add(beacon);
            this.artifactBeacons.push(beacon);
            
            // Rotate to face the path
            artifactGroup.lookAt(point.x, 0, point.z);
            
            this.scene.add(artifactGroup);
        });
    }
    
    createArtifactBeacon(color) {
        const beacon = new THREE.Group();
        
        // Glowing orb
        const orbGeom = new THREE.SphereGeometry(0.4, 16, 16);
        const orbMat = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.9
        });
        const orb = new THREE.Mesh(orbGeom, orbMat);
        beacon.add(orb);
        
        // Outer glow
        const glowGeom = new THREE.SphereGeometry(0.7, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        beacon.add(glow);
        
        // Light rays pointing up
        const rayMat = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.5
        });
        const ray = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.2, 2, 8), rayMat);
        ray.position.y = 1.2;
        beacon.add(ray);
        
        return beacon;
    }
    
    createArtifact(type, label, eraColor) {
        const group = new THREE.Group();
        const color = parseInt(eraColor.replace('#', '0x'));
        
        // Pedestal/base for all artifacts
        const pedestalGeom = new THREE.CylinderGeometry(1, 1.2, 0.5, 8);
        const pedestalMat = new THREE.MeshLambertMaterial({ color: 0xBCAAA4 });
        const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
        pedestal.position.y = 0.25;
        group.add(pedestal);
        
        // Create different artifact types
        switch(type) {
            case 'book':
                this.addBookArtifact(group, color);
                break;
            case 'chalkboard':
                this.addChalkboardArtifact(group, color);
                break;
            case 'quill':
                this.addQuillArtifact(group, color);
                break;
            case 'vacuum_tube':
                this.addVacuumTubeArtifact(group, color);
                break;
            case 'mainframe':
                this.addMainframeArtifact(group, color);
                break;
            case 'punch_card':
                this.addPunchCardArtifact(group, color);
                break;
            case 'terminal':
                this.addTerminalArtifact(group, color);
                break;
            case 'reel_tape':
                this.addReelTapeArtifact(group, color);
                break;
            case 'robot_arm':
                this.addRobotArmArtifact(group, color);
                break;
            case 'papers':
                this.addPapersArtifact(group, color);
                break;
            case 'old_pc':
            case 'desktop':
                this.addDesktopArtifact(group, color);
                break;
            case 'floppy':
                this.addFloppyArtifact(group, color);
                break;
            case 'keyboard':
                this.addKeyboardArtifact(group, color);
                break;
            case 'laptop':
                this.addLaptopArtifact(group, color);
                break;
            case 'network':
                this.addNetworkArtifact(group, color);
                break;
            case 'server':
                this.addServerArtifact(group, color);
                break;
            case 'globe':
                this.addGlobeArtifact(group, color);
                break;
            case 'data':
                this.addDataArtifact(group, color);
                break;
            case 'gpu':
                this.addGpuArtifact(group, color);
                break;
            case 'smartphone':
                this.addSmartphoneArtifact(group, color);
                break;
            case 'neural':
                this.addNeuralArtifact(group, color);
                break;
            case 'cloud':
                this.addCloudArtifact(group, color);
                break;
            case 'brain':
                this.addBrainArtifact(group, color);
                break;
            case 'chip':
                this.addChipArtifact(group, color);
                break;
            case 'robot':
                this.addRobotArtifact(group, color);
                break;
            case 'chat':
                this.addChatArtifact(group, color);
                break;
            case 'sparkle':
                this.addSparkleArtifact(group, color);
                break;
            default:
                this.addDefaultArtifact(group, color);
        }
        
        // Add label sign
        this.addArtifactLabel(group, label, color);
        
        return group;
    }
    
    // Artifact creation methods
    addBookArtifact(group, color) {
        const bookGeom = new THREE.BoxGeometry(0.8, 1.2, 0.2);
        const bookMat = new THREE.MeshLambertMaterial({ color: color });
        const book = new THREE.Mesh(bookGeom, bookMat);
        book.position.set(0, 1.1, 0);
        book.rotation.z = 0.1;
        group.add(book);
        
        // Pages
        const pagesGeom = new THREE.BoxGeometry(0.75, 1.15, 0.15);
        const pagesMat = new THREE.MeshLambertMaterial({ color: 0xFFFDE7 });
        const pages = new THREE.Mesh(pagesGeom, pagesMat);
        pages.position.set(0.02, 1.1, 0);
        pages.rotation.z = 0.1;
        group.add(pages);
        
        // Second book
        const book2 = book.clone();
        book2.position.set(0.3, 0.9, 0.2);
        book2.rotation.z = -0.2;
        book2.material = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
        group.add(book2);
    }
    
    addChalkboardArtifact(group, color) {
        // Board
        const boardGeom = new THREE.BoxGeometry(1.5, 1, 0.1);
        const boardMat = new THREE.MeshLambertMaterial({ color: 0x2E4A32 });
        const board = new THREE.Mesh(boardGeom, boardMat);
        board.position.set(0, 1.5, 0);
        group.add(board);
        
        // Frame
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
        const topFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.15), frameMat);
        topFrame.position.set(0, 2.05, 0);
        group.add(topFrame);
        
        // Chalk marks (simple lines)
        const chalkGeom = new THREE.BoxGeometry(0.8, 0.05, 0.02);
        const chalkMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        for (let i = 0; i < 3; i++) {
            const mark = new THREE.Mesh(chalkGeom, chalkMat);
            mark.position.set(0, 1.7 - i * 0.2, 0.06);
            group.add(mark);
        }
    }
    
    addQuillArtifact(group, color) {
        // Inkwell
        const wellGeom = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 8);
        const wellMat = new THREE.MeshLambertMaterial({ color: 0x1A1A1A });
        const well = new THREE.Mesh(wellGeom, wellMat);
        well.position.set(0, 0.65, 0);
        group.add(well);
        
        // Quill (cone + cylinder)
        const quillMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const feather = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.2, 4), quillMat);
        feather.position.set(0.1, 1.2, 0);
        feather.rotation.z = -0.4;
        group.add(feather);
    }
    
    addVacuumTubeArtifact(group, color) {
        // Glass tube
        const tubeGeom = new THREE.CylinderGeometry(0.2, 0.3, 1.2, 16);
        const tubeMat = new THREE.MeshBasicMaterial({ color: 0xFFE082, transparent: true, opacity: 0.6 });
        const tube = new THREE.Mesh(tubeGeom, tubeMat);
        tube.position.set(0, 1.1, 0);
        group.add(tube);
        
        // Filament glow inside
        const glowGeom = new THREE.SphereGeometry(0.15, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xFF6F00 });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        glow.position.set(0, 1.2, 0);
        group.add(glow);
        
        // Base
        const baseGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x424242 });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.position.set(0, 0.6, 0);
        group.add(base);
    }
    
    addMainframeArtifact(group, color) {
        // Large cabinet
        const cabinetGeom = new THREE.BoxGeometry(1.2, 2, 0.8);
        const cabinetMat = new THREE.MeshLambertMaterial({ color: 0x78909C });
        const cabinet = new THREE.Mesh(cabinetGeom, cabinetMat);
        cabinet.position.set(0, 1.5, 0);
        group.add(cabinet);
        
        // Panel with lights
        const panelGeom = new THREE.BoxGeometry(1, 0.4, 0.05);
        const panelMat = new THREE.MeshLambertMaterial({ color: 0x263238 });
        const panel = new THREE.Mesh(panelGeom, panelMat);
        panel.position.set(0, 2, 0.43);
        group.add(panel);
        
        // Blinking lights
        const lightColors = [0xFF0000, 0x00FF00, 0xFFFF00];
        for (let i = 0; i < 5; i++) {
            const lightGeom = new THREE.SphereGeometry(0.05, 8, 8);
            const lightMat = new THREE.MeshBasicMaterial({ color: lightColors[i % 3] });
            const light = new THREE.Mesh(lightGeom, lightMat);
            light.position.set(-0.3 + i * 0.15, 2, 0.46);
            group.add(light);
        }
    }
    
    addPunchCardArtifact(group, color) {
        // Stack of punch cards
        for (let i = 0; i < 5; i++) {
            const cardGeom = new THREE.BoxGeometry(0.9, 0.02, 0.5);
            const cardMat = new THREE.MeshLambertMaterial({ color: 0xFFECB3 });
            const card = new THREE.Mesh(cardGeom, cardMat);
            card.position.set((Math.random() - 0.5) * 0.1, 0.6 + i * 0.03, (Math.random() - 0.5) * 0.1);
            card.rotation.y = (Math.random() - 0.5) * 0.2;
            group.add(card);
        }
        
        // Holes in top card
        const holeMat = new THREE.MeshBasicMaterial({ color: 0x8D6E63 });
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 6; c++) {
                if (Math.random() > 0.5) {
                    const hole = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.05), holeMat);
                    hole.position.set(-0.3 + c * 0.1, 0.74, -0.15 + r * 0.1);
                    group.add(hole);
                }
            }
        }
    }
    
    addTerminalArtifact(group, color) {
        // CRT monitor shape
        const monitorGeom = new THREE.BoxGeometry(1, 0.8, 0.7);
        const monitorMat = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });
        const monitor = new THREE.Mesh(monitorGeom, monitorMat);
        monitor.position.set(0, 1, 0);
        group.add(monitor);
        
        // Screen (dark with green text)
        const screenGeom = new THREE.BoxGeometry(0.8, 0.6, 0.05);
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x1B5E20 });
        const screen = new THREE.Mesh(screenGeom, screenMat);
        screen.position.set(0, 1, 0.38);
        group.add(screen);
        
        // Text lines
        const textMat = new THREE.MeshBasicMaterial({ color: 0x4CAF50 });
        for (let i = 0; i < 4; i++) {
            const line = new THREE.Mesh(new THREE.BoxGeometry(0.5 + Math.random() * 0.2, 0.03, 0.01), textMat);
            line.position.set(-0.1, 1.15 - i * 0.1, 0.41);
            group.add(line);
        }
    }
    
    addReelTapeArtifact(group, color) {
        // Two reels
        const reelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
        const reelMat = new THREE.MeshLambertMaterial({ color: 0x424242 });
        
        const reel1 = new THREE.Mesh(reelGeom, reelMat);
        reel1.rotation.x = Math.PI / 2;
        reel1.position.set(-0.4, 1.2, 0);
        group.add(reel1);
        
        const reel2 = new THREE.Mesh(reelGeom, reelMat);
        reel2.rotation.x = Math.PI / 2;
        reel2.position.set(0.4, 1.2, 0);
        group.add(reel2);
        
        // Tape (brown)
        const tapeMat = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
        const tape1 = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 16), tapeMat);
        tape1.rotation.y = Math.PI / 2;
        tape1.position.set(-0.4, 1.2, 0);
        group.add(tape1);
    }
    
    addRobotArmArtifact(group, color) {
        const armMat = new THREE.MeshLambertMaterial({ color: 0x90A4AE });
        
        // Base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.3, 16), armMat);
        base.position.set(0, 0.65, 0);
        group.add(base);
        
        // Arm segments
        const seg1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 0.15), armMat);
        seg1.position.set(0, 1.2, 0);
        group.add(seg1);
        
        const seg2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), armMat);
        seg2.position.set(0.2, 1.5, 0);
        seg2.rotation.z = -0.5;
        group.add(seg2);
        
        // Gripper
        const gripper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.1), new THREE.MeshLambertMaterial({ color: color }));
        gripper.position.set(0.45, 1.6, 0);
        group.add(gripper);
    }
    
    addPapersArtifact(group, color) {
        // Stack of research papers
        for (let i = 0; i < 8; i++) {
            const paperGeom = new THREE.BoxGeometry(0.7, 0.02, 0.9);
            const paperMat = new THREE.MeshLambertMaterial({ color: 0xFFFDE7 });
            const paper = new THREE.Mesh(paperGeom, paperMat);
            paper.position.set((Math.random() - 0.5) * 0.15, 0.55 + i * 0.025, (Math.random() - 0.5) * 0.1);
            paper.rotation.y = (Math.random() - 0.5) * 0.15;
            group.add(paper);
        }
        
        // Pencil on top
        const pencilMat = new THREE.MeshLambertMaterial({ color: 0xFFEB3B });
        const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), pencilMat);
        pencil.rotation.z = Math.PI / 2;
        pencil.position.set(0, 0.8, 0.2);
        group.add(pencil);
    }
    
    addDesktopArtifact(group, color) {
        // Monitor
        const monitorGeom = new THREE.BoxGeometry(0.9, 0.7, 0.3);
        const monitorMat = new THREE.MeshLambertMaterial({ color: 0xE0E0E0 });
        const monitor = new THREE.Mesh(monitorGeom, monitorMat);
        monitor.position.set(0, 1.2, 0);
        group.add(monitor);
        
        // Screen
        const screenGeom = new THREE.BoxGeometry(0.75, 0.55, 0.02);
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x2196F3 });
        const screen = new THREE.Mesh(screenGeom, screenMat);
        screen.position.set(0, 1.2, 0.17);
        group.add(screen);
        
        // Stand
        const standGeom = new THREE.BoxGeometry(0.15, 0.3, 0.15);
        const stand = new THREE.Mesh(standGeom, monitorMat);
        stand.position.set(0, 0.7, 0);
        group.add(stand);
        
        // Keyboard
        const kbGeom = new THREE.BoxGeometry(0.6, 0.05, 0.2);
        const kb = new THREE.Mesh(kbGeom, monitorMat);
        kb.position.set(0, 0.55, 0.35);
        group.add(kb);
    }
    
    addFloppyArtifact(group, color) {
        // 3.5" floppy disk
        const floppyGeom = new THREE.BoxGeometry(0.7, 0.05, 0.7);
        const floppyMat = new THREE.MeshLambertMaterial({ color: 0x1A237E });
        const floppy = new THREE.Mesh(floppyGeom, floppyMat);
        floppy.position.set(0, 0.8, 0);
        floppy.rotation.x = -0.3;
        group.add(floppy);
        
        // Metal slider
        const sliderGeom = new THREE.BoxGeometry(0.5, 0.06, 0.15);
        const sliderMat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });
        const slider = new THREE.Mesh(sliderGeom, sliderMat);
        slider.position.set(0, 0.82, -0.2);
        slider.rotation.x = -0.3;
        group.add(slider);
        
        // Label
        const labelGeom = new THREE.BoxGeometry(0.5, 0.06, 0.3);
        const labelMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const label = new THREE.Mesh(labelGeom, labelMat);
        label.position.set(0, 0.82, 0.15);
        label.rotation.x = -0.3;
        group.add(label);
    }
    
    addKeyboardArtifact(group, color) {
        // Large keyboard
        const kbGeom = new THREE.BoxGeometry(1.2, 0.1, 0.5);
        const kbMat = new THREE.MeshLambertMaterial({ color: 0xE0E0E0 });
        const kb = new THREE.Mesh(kbGeom, kbMat);
        kb.position.set(0, 0.75, 0);
        kb.rotation.x = -0.1;
        group.add(kb);
        
        // Keys
        const keyMat = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 10; c++) {
                const key = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), keyMat);
                key.position.set(-0.45 + c * 0.1, 0.82, -0.12 + r * 0.12);
                group.add(key);
            }
        }
    }
    
    addLaptopArtifact(group, color) {
        // Base
        const baseGeom = new THREE.BoxGeometry(1, 0.05, 0.7);
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.position.set(0, 0.55, 0);
        group.add(base);
        
        // Screen
        const screenGeom = new THREE.BoxGeometry(1, 0.7, 0.03);
        const screen = new THREE.Mesh(screenGeom, baseMat);
        screen.position.set(0, 0.9, -0.33);
        screen.rotation.x = 0.2;
        group.add(screen);
        
        // Display
        const displayGeom = new THREE.BoxGeometry(0.9, 0.55, 0.01);
        const displayMat = new THREE.MeshBasicMaterial({ color: color });
        const display = new THREE.Mesh(displayGeom, displayMat);
        display.position.set(0, 0.9, -0.31);
        display.rotation.x = 0.2;
        group.add(display);
    }
    
    addNetworkArtifact(group, color) {
        // Hub with connections
        const hubGeom = new THREE.BoxGeometry(0.6, 0.15, 0.4);
        const hubMat = new THREE.MeshLambertMaterial({ color: 0x424242 });
        const hub = new THREE.Mesh(hubGeom, hubMat);
        hub.position.set(0, 0.7, 0);
        group.add(hub);
        
        // Network cables (curved lines going out)
        const cableMat = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
        for (let i = 0; i < 4; i++) {
            const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), cableMat);
            cable.position.set(-0.3 + i * 0.2, 0.9, 0.3);
            cable.rotation.x = 0.5;
            cable.rotation.z = (i - 1.5) * 0.2;
            group.add(cable);
        }
        
        // Blinking lights
        for (let i = 0; i < 4; i++) {
            const light = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: 0x4CAF50 }));
            light.position.set(-0.2 + i * 0.13, 0.79, 0.22);
            group.add(light);
        }
    }
    
    addServerArtifact(group, color) {
        // Server rack
        const rackMat = new THREE.MeshLambertMaterial({ color: 0x37474F });
        const rack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2, 0.6), rackMat);
        rack.position.set(0, 1.5, 0);
        group.add(rack);
        
        // Server units
        for (let i = 0; i < 5; i++) {
            const unit = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.55), new THREE.MeshLambertMaterial({ color: 0x263238 }));
            unit.position.set(0, 0.65 + i * 0.35, 0.03);
            group.add(unit);
            
            // LED
            const led = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x4CAF50 : 0x2196F3 }));
            led.position.set(0.3, 0.65 + i * 0.35, 0.31);
            group.add(led);
        }
    }
    
    addGlobeArtifact(group, color) {
        // Earth globe
        const globeGeom = new THREE.SphereGeometry(0.5, 16, 16);
        const globeMat = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
        const globe = new THREE.Mesh(globeGeom, globeMat);
        globe.position.set(0, 1.2, 0);
        group.add(globe);
        
        // Continents (simplified)
        const landMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
        for (let i = 0; i < 5; i++) {
            const land = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), landMat);
            const angle = (i / 5) * Math.PI * 2;
            land.position.set(
                Math.cos(angle) * 0.4,
                1.2 + Math.sin(i) * 0.2,
                Math.sin(angle) * 0.4
            );
            group.add(land);
        }
        
        // Stand
        const standGeom = new THREE.CylinderGeometry(0.1, 0.2, 0.5, 8);
        const stand = new THREE.Mesh(standGeom, new THREE.MeshLambertMaterial({ color: 0x6D4C41 }));
        stand.position.set(0, 0.55, 0);
        group.add(stand);
    }
    
    addDataArtifact(group, color) {
        // Floating data blocks
        const dataMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
        
        for (let i = 0; i < 8; i++) {
            const size = 0.1 + Math.random() * 0.2;
            const block = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), dataMat);
            block.position.set(
                (Math.random() - 0.5) * 0.8,
                0.8 + Math.random() * 0.8,
                (Math.random() - 0.5) * 0.8
            );
            block.rotation.set(Math.random(), Math.random(), Math.random());
            group.add(block);
        }
        
        // Binary digits floating
        const binMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
        for (let i = 0; i < 4; i++) {
            const digit = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.02), binMat);
            digit.position.set(-0.3 + i * 0.2, 1.5, 0.4);
            group.add(digit);
        }
    }
    
    addGpuArtifact(group, color) {
        // Graphics card
        const cardGeom = new THREE.BoxGeometry(1.2, 0.1, 0.6);
        const cardMat = new THREE.MeshLambertMaterial({ color: 0x1B5E20 });
        const card = new THREE.Mesh(cardGeom, cardMat);
        card.position.set(0, 0.9, 0);
        card.rotation.x = -0.4;
        group.add(card);
        
        // GPU chip
        const chipMat = new THREE.MeshLambertMaterial({ color: 0x424242 });
        const chip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.3), chipMat);
        chip.position.set(0, 0.98, 0);
        chip.rotation.x = -0.4;
        group.add(chip);
        
        // Heatsink
        const hsMat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });
        for (let i = 0; i < 8; i++) {
            const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.25), hsMat);
            fin.position.set(-0.15 + i * 0.04, 1.05, 0);
            fin.rotation.x = -0.4;
            group.add(fin);
        }
        
        // LED accent
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 0.05), new THREE.MeshBasicMaterial({ color: color }));
        led.position.set(0, 0.92, 0.28);
        led.rotation.x = -0.4;
        group.add(led);
    }
    
    addSmartphoneArtifact(group, color) {
        // Phone body
        const phoneGeom = new THREE.BoxGeometry(0.4, 0.8, 0.05);
        const phoneMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
        const phone = new THREE.Mesh(phoneGeom, phoneMat);
        phone.position.set(0, 1, 0);
        phone.rotation.x = -0.3;
        group.add(phone);
        
        // Screen
        const screenGeom = new THREE.BoxGeometry(0.35, 0.7, 0.01);
        const screenMat = new THREE.MeshBasicMaterial({ color: color });
        const screen = new THREE.Mesh(screenGeom, screenMat);
        screen.position.set(0, 1, 0.03);
        screen.rotation.x = -0.3;
        group.add(screen);
        
        // App icons
        const iconMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const icon = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.005), iconMat);
                icon.position.set(-0.1 + c * 0.1, 1.1 - r * 0.12, 0.04);
                icon.rotation.x = -0.3;
                group.add(icon);
            }
        }
    }
    
    addNeuralArtifact(group, color) {
        // Neural network nodes
        const nodeMat = new THREE.MeshBasicMaterial({ color: color });
        const connMat = new THREE.MeshBasicMaterial({ color: 0x90A4AE, transparent: true, opacity: 0.5 });
        
        const layers = [3, 4, 4, 2];
        const nodePositions = [];
        
        layers.forEach((count, layerIdx) => {
            nodePositions[layerIdx] = [];
            for (let i = 0; i < count; i++) {
                const node = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), nodeMat);
                const y = 0.7 + (i - (count - 1) / 2) * 0.25;
                const z = -0.4 + layerIdx * 0.3;
                node.position.set(0, y, z);
                nodePositions[layerIdx].push({ y, z });
                group.add(node);
            }
        });
    }
    
    addCloudArtifact(group, color) {
        // Cloud shape (multiple spheres)
        const cloudMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        
        const positions = [
            { x: 0, y: 1.2, z: 0, s: 0.4 },
            { x: 0.3, y: 1.1, z: 0, s: 0.3 },
            { x: -0.3, y: 1.15, z: 0, s: 0.3 },
            { x: 0.15, y: 1.35, z: 0, s: 0.25 },
            { x: -0.1, y: 1.3, z: 0.1, s: 0.2 }
        ];
        
        positions.forEach(p => {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(p.s, 8, 8), cloudMat);
            sphere.position.set(p.x, p.y, p.z);
            group.add(sphere);
        });
        
        // Upload arrow
        const arrowMat = new THREE.MeshBasicMaterial({ color: color });
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 8), arrowMat);
        arrow.position.set(0, 0.85, 0);
        group.add(arrow);
        
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), arrowMat);
        stem.position.set(0, 0.6, 0);
        group.add(stem);
    }
    
    addBrainArtifact(group, color) {
        // Stylized brain (sphere with bumps)
        const brainMat = new THREE.MeshLambertMaterial({ color: 0xF48FB1 });
        
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), brainMat);
        core.position.set(0, 1.1, 0);
        core.scale.set(1, 0.9, 0.8);
        group.add(core);
        
        // Brain folds
        for (let i = 0; i < 6; i++) {
            const fold = new THREE.Mesh(new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 8, 8), brainMat);
            const angle = (i / 6) * Math.PI * 2;
            fold.position.set(
                Math.cos(angle) * 0.25,
                1.1 + Math.sin(i * 2) * 0.15,
                Math.sin(angle) * 0.2
            );
            group.add(fold);
        }
        
        // Electric sparks
        const sparkMat = new THREE.MeshBasicMaterial({ color: color });
        for (let i = 0; i < 3; i++) {
            const spark = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), sparkMat);
            spark.position.set(
                (Math.random() - 0.5) * 0.6,
                1.3 + Math.random() * 0.3,
                (Math.random() - 0.5) * 0.4
            );
            group.add(spark);
        }
    }
    
    addChipArtifact(group, color) {
        // Processor chip
        const chipGeom = new THREE.BoxGeometry(0.6, 0.1, 0.6);
        const chipMat = new THREE.MeshLambertMaterial({ color: 0x1A237E });
        const chip = new THREE.Mesh(chipGeom, chipMat);
        chip.position.set(0, 0.8, 0);
        group.add(chip);
        
        // Die
        const dieMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
        const die = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.35), dieMat);
        die.position.set(0, 0.86, 0);
        group.add(die);
        
        // Pins
        const pinMat = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        for (let side = 0; side < 4; side++) {
            for (let i = 0; i < 6; i++) {
                const pin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.02), pinMat);
                const offset = -0.25 + i * 0.1;
                switch(side) {
                    case 0: pin.position.set(offset, 0.7, 0.35); break;
                    case 1: pin.position.set(offset, 0.7, -0.35); break;
                    case 2: pin.position.set(0.35, 0.7, offset); break;
                    case 3: pin.position.set(-0.35, 0.7, offset); break;
                }
                group.add(pin);
            }
        }
    }
    
    addRobotArtifact(group, color) {
        const robotMat = new THREE.MeshLambertMaterial({ color: 0x90A4AE });
        
        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), robotMat);
        body.position.set(0, 1.1, 0);
        group.add(body);
        
        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.35), robotMat);
        head.position.set(0, 1.75, 0);
        group.add(head);
        
        // Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: color });
        const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
        eye1.position.set(-0.12, 1.8, 0.18);
        group.add(eye1);
        
        const eye2 = eye1.clone();
        eye2.position.set(0.12, 1.8, 0.18);
        group.add(eye2);
        
        // Antenna
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), robotMat);
        antenna.position.set(0, 2.1, 0);
        group.add(antenna);
        
        const antennaTop = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
        antennaTop.position.set(0, 2.28, 0);
        group.add(antennaTop);
        
        // Arms
        const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), robotMat);
        arm1.position.set(-0.42, 1, 0);
        group.add(arm1);
        
        const arm2 = arm1.clone();
        arm2.position.set(0.42, 1, 0);
        group.add(arm2);
    }
    
    addChatArtifact(group, color) {
        // Chat bubble
        const bubbleMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const bubble = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 0.1), bubbleMat);
        bubble.position.set(0, 1.2, 0);
        group.add(bubble);
        
        // Rounded corners (spheres)
        const cornerMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const corners = [[-0.45, 1.4], [0.45, 1.4], [-0.45, 1], [0.45, 1]];
        corners.forEach(([x, y]) => {
            const corner = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), cornerMat);
            corner.position.set(x, y, 0);
            group.add(corner);
        });
        
        // Chat tail
        const tailGeom = new THREE.ConeGeometry(0.1, 0.2, 3);
        const tail = new THREE.Mesh(tailGeom, bubbleMat);
        tail.position.set(-0.3, 0.82, 0);
        tail.rotation.z = Math.PI;
        group.add(tail);
        
        // Text lines
        const textMat = new THREE.MeshBasicMaterial({ color: color });
        for (let i = 0; i < 3; i++) {
            const line = new THREE.Mesh(new THREE.BoxGeometry(0.6 - i * 0.15, 0.06, 0.02), textMat);
            line.position.set(-0.1 + i * 0.05, 1.3 - i * 0.12, 0.06);
            group.add(line);
        }
    }
    
    addSparkleArtifact(group, color) {
        // Magical AI sparkles
        const sparkleMat = new THREE.MeshBasicMaterial({ color: color });
        const starMat = new THREE.MeshBasicMaterial({ color: 0xFFEB3B });
        
        // Central star
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), starMat);
        star.position.set(0, 1.2, 0);
        group.add(star);
        
        // Orbiting sparkles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const sparkle = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), sparkleMat);
            sparkle.position.set(
                Math.cos(angle) * 0.6,
                1.2 + Math.sin(angle * 2) * 0.3,
                Math.sin(angle) * 0.6
            );
            group.add(sparkle);
        }
        
        // Light rays
        const rayMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.5 });
        for (let i = 0; i < 6; i++) {
            const ray = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.03, 0.5, 8), rayMat);
            const angle = (i / 6) * Math.PI * 2;
            ray.position.set(Math.cos(angle) * 0.15, 1.2, Math.sin(angle) * 0.15);
            ray.rotation.z = angle + Math.PI / 2;
            group.add(ray);
        }
    }
    
    addDefaultArtifact(group, color) {
        // Generic cube artifact
        const cubeGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const cubeMat = new THREE.MeshLambertMaterial({ color: color });
        const cube = new THREE.Mesh(cubeGeom, cubeMat);
        cube.position.set(0, 0.8, 0);
        cube.rotation.y = Math.PI / 4;
        group.add(cube);
    }
    
    addArtifactLabel(group, label, color) {
        // Create a large floating text sprite above the artifact
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Background with rounded corners
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.roundRect(ctx, 10, 10, canvas.width - 20, canvas.height - 20, 20);
        ctx.fill();
        
        // Color accent bar at top
        const hexColor = '#' + color.toString(16).padStart(6, '0');
        ctx.fillStyle = hexColor;
        ctx.fillRect(10, 10, canvas.width - 20, 15);
        
        // Border
        ctx.strokeStyle = hexColor;
        ctx.lineWidth = 4;
        this.roundRect(ctx, 10, 10, canvas.width - 20, canvas.height - 20, 20);
        ctx.stroke();
        
        // Text
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 48px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 10);
        
        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const spriteMat = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(4, 1, 1); // Wide label
        sprite.position.set(0, 3.5, 0); // Float above the artifact
        group.add(sprite);
        
        // Add a small pointer/arrow pointing down to the artifact
        const pointerMat = new THREE.MeshBasicMaterial({ color: color });
        const pointer = new THREE.Mesh(
            new THREE.ConeGeometry(0.2, 0.5, 8),
            pointerMat
        );
        pointer.position.set(0, 2.7, 0);
        pointer.rotation.x = Math.PI; // Point downward
        group.add(pointer);
    }
    
    // Helper for rounded rectangles
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    setupDOM() {
        this.progressFill = document.getElementById('progress-fill');
        this.progressGlow = document.getElementById('progress-glow');
        this.progressYear = document.getElementById('progress-year');
        this.eraLegend = document.getElementById('era-legend');
        this.eventPanel = document.getElementById('event-panel');
        this.panelContent = document.getElementById('panel-content');
        this.instructions = document.getElementById('instructions');
        
        // HUD elements
        this.hudYear = document.getElementById('hud-year');
        this.hudTitle = document.getElementById('hud-title');
        this.hudSubtitle = document.getElementById('hud-subtitle');
        this.hudNext = document.getElementById('hud-next');
        this.hudEra = document.getElementById('hud-era');
        this.speedValue = document.getElementById('speed-value');
        this.speedoArc = document.getElementById('speedo-arc');
        this.eventsPassed = document.getElementById('events-passed');
        this.eventsTotal = document.getElementById('events-total');
        
        // Minimap SVG elements
        this.minimapSvg = document.getElementById('minimap-svg');
        this.minimapRoad = document.getElementById('minimap-road');
        this.minimapRoadEdge = document.getElementById('minimap-road-edge');
        this.minimapPlayer = document.getElementById('minimap-player');
        this.minimapArrow = document.getElementById('minimap-arrow');
        this.minimapTrees = document.getElementById('minimap-trees');
        
        this.eventsTotal.textContent = this.events.length;
        
        // Add SVG gradient for speedometer (nature colors)
        this.addSpeedoGradient();
        
        // Initialize minimap
        this.initMinimap();
    }
    
    initMinimap() {
        if (!this.roadPath || !this.minimapRoad) return;
        
        const mapSize = 130;
        const padding = 15;
        const usableSize = mapSize - padding * 2;
        
        // Sample points from the road path to create minimap path
        const numPoints = 100;
        const pathPoints = [];
        
        // Get bounds of the path
        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const point = this.roadPath.getPoint(t);
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minZ = Math.min(minZ, point.z);
            maxZ = Math.max(maxZ, point.z);
        }
        
        const rangeX = maxX - minX || 1;
        const rangeZ = maxZ - minZ || 1;
        const scale = Math.min(usableSize / rangeX, usableSize / rangeZ);
        
        // Store mapping info for player position updates
        this.minimapMapping = {
            minX, maxX, minZ, maxZ,
            scale, padding, mapSize,
            centerX: mapSize / 2,
            centerY: mapSize / 2
        };
        
        // Create SVG path data
        let pathData = '';
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const point = this.roadPath.getPoint(t);
            
            // Map 3D coords to minimap coords (top-down view)
            const x = padding + ((point.x - minX) / rangeX) * usableSize;
            const y = padding + ((point.z - minZ) / rangeZ) * usableSize;
            
            pathPoints.push({ x, y, t });
            
            if (i === 0) {
                pathData += `M ${x} ${y}`;
            } else {
                pathData += ` L ${x} ${y}`;
            }
        }
        
        // Store path points for player position lookup
        this.minimapPathPoints = pathPoints;
        
        // Set the road paths
        this.minimapRoad.setAttribute('d', pathData);
        this.minimapRoadEdge.setAttribute('d', pathData);
        
        // Add some tree decorations
        this.addMinimapTrees();
    }
    
    addMinimapTrees() {
        if (!this.minimapTrees || !this.minimapMapping) return;
        
        const { padding, mapSize } = this.minimapMapping;
        
        // Add random tree dots around the path
        let treesHtml = '';
        for (let i = 0; i < 25; i++) {
            const x = padding + Math.random() * (mapSize - padding * 2);
            const y = padding + Math.random() * (mapSize - padding * 2);
            const size = 2 + Math.random() * 2;
            
            // Check if not too close to center (path area)
            const distFromCenter = Math.sqrt(Math.pow(x - mapSize/2, 2) + Math.pow(y - mapSize/2, 2));
            if (distFromCenter > 20) {
                treesHtml += `<circle class="minimap-tree" cx="${x}" cy="${y}" r="${size}"/>`;
            }
        }
        this.minimapTrees.innerHTML = treesHtml;
    }
    
    updateMinimapPlayer() {
        if (!this.minimapPathPoints || !this.minimapPlayer || !this.roadPath) return;
        
        // Find position on minimap path
        const numPoints = this.minimapPathPoints.length;
        const index = Math.floor(this.currentPosition * (numPoints - 1));
        const nextIndex = Math.min(index + 1, numPoints - 1);
        
        const point = this.minimapPathPoints[index];
        const nextPoint = this.minimapPathPoints[nextIndex];
        
        if (!point) return;
        
        // Interpolate between points for smooth movement
        const localT = (this.currentPosition * (numPoints - 1)) - index;
        const x = point.x + (nextPoint.x - point.x) * localT;
        const y = point.y + (nextPoint.y - point.y) * localT;
        
        // Update player position
        this.minimapPlayer.setAttribute('cx', x);
        this.minimapPlayer.setAttribute('cy', y);
        
        // Update direction arrow
        if (this.minimapArrow) {
            const dx = nextPoint.x - point.x;
            const dy = nextPoint.y - point.y;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            this.minimapArrow.setAttribute('transform', `translate(${x}, ${y}) rotate(${angle})`);
        }
    }
    
    addSpeedoGradient() {
        const svg = document.querySelector('.speedo-ring svg');
        if (svg) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            defs.innerHTML = `
                <linearGradient id="speedoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#66BB6A"/>
                    <stop offset="50%" style="stop-color:#81C784"/>
                    <stop offset="100%" style="stop-color:#A5D6A7"/>
                </linearGradient>
            `;
            svg.insertBefore(defs, svg.firstChild);
        }
    }
    
    renderEraLegend() {
        let html = '<h4>🌳 Eras</h4>';
        html += '<div class="era-items">';
        this.eras.forEach(era => {
            html += `
                <div class="era-item" data-era="${era.id}">
                    <span class="era-dot" style="background: ${era.color}"></span>
                    <span class="era-name">${era.name}</span>
                </div>
            `;
        });
        html += '</div>';
        this.eraLegend.innerHTML = html;
        
        // Add collapse toggle to header
        const header = this.eraLegend.querySelector('h4');
        if (header) {
            header.addEventListener('click', () => {
                this.eraLegend.classList.toggle('collapsed');
            });
        }
    }
    
    setupEventListeners() {
        // Wheel/scroll for movement - but not when panel is open and scrolling inside it
        window.addEventListener('wheel', (e) => {
            // Check if scrolling inside the event panel
            const eventPanel = document.getElementById('event-panel');
            if (eventPanel && eventPanel.classList.contains('open')) {
                // Check if the scroll target is inside the panel
                if (eventPanel.contains(e.target)) {
                    // Allow normal scrolling inside panel
                    return;
                }
            }
            
            e.preventDefault();
            // Reduced acceleration (was 0.0008, now 0.0004)
            const delta = e.deltaY * 0.0004;
            this.targetPosition = Math.max(0, Math.min(1, this.targetPosition + delta));
        }, { passive: false });
        
        // Touch support
        let touchStartY = 0;
        let touchTarget = null;
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchTarget = e.target;
        });
        
        window.addEventListener('touchmove', (e) => {
            // Check if touching inside the event panel
            const eventPanel = document.getElementById('event-panel');
            if (eventPanel && eventPanel.classList.contains('open')) {
                if (eventPanel.contains(touchTarget)) {
                    return; // Allow normal scrolling inside panel
                }
            }
            
            // Reduced acceleration (was 0.0005, now 0.00025)
            const delta = (touchStartY - e.touches[0].clientY) * 0.00025;
            this.targetPosition = Math.max(0, Math.min(1, this.targetPosition + delta));
            touchStartY = e.touches[0].clientY;
        });
        
        // Keyboard
        document.addEventListener('keydown', (e) => {
            // Don't handle keyboard when panel is open (except Escape)
            const eventPanel = document.getElementById('event-panel');
            const panelOpen = eventPanel && eventPanel.classList.contains('open');
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    if (panelOpen) return;
                    e.preventDefault();
                    // Reduced step (was 0.01, now 0.005)
                    this.targetPosition = Math.min(1, this.targetPosition + 0.005);
                    break;
                case 'ArrowDown':
                case 's':
                    if (panelOpen) return;
                    e.preventDefault();
                    // Reduced step (was 0.01, now 0.005)
                    this.targetPosition = Math.max(0, this.targetPosition - 0.005);
                    break;
                case ' ':
                    e.preventDefault();
                    this.showEventDetail(this.currentEventIndex);
                    break;
                case 'Escape':
                    this.closePanel();
                    break;
            }
        });
        
        // HUD click to show details
        const hudCurrent = document.getElementById('hud-current');
        if (hudCurrent) {
            hudCurrent.addEventListener('click', () => {
                this.showEventDetail(this.currentEventIndex);
            });
        }
        
        // Close panel
        const panelClose = document.getElementById('panel-close');
        if (panelClose) {
            panelClose.addEventListener('click', () => this.closePanel());
        }
        
        // Auto-play toggle
        const toggleAuto = document.getElementById('toggle-auto');
        if (toggleAuto) {
            toggleAuto.addEventListener('click', () => this.toggleAutoPlay());
        }
        
        // Reset journey
        const resetBtn = document.getElementById('reset-journey');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.targetPosition = 0;
                this.stopAutoPlay();
            });
        }
        
        // Start journey button
        const startBtn = document.getElementById('start-journey');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.instructions.classList.add('hidden');
            });
        }
        
        // Era legend clicks
        this.eraLegend.addEventListener('click', (e) => {
            const eraItem = e.target.closest('.era-item');
            if (eraItem) {
                const eraId = eraItem.dataset.era;
                const era = this.eras.find(e => e.id === eraId);
                if (era) {
                    const eventIndex = this.events.findIndex(ev => 
                        ev.year >= era.start_year && ev.year <= era.end_year
                    );
                    if (eventIndex >= 0) {
                        this.targetPosition = eventIndex / this.events.length;
                    }
                }
            }
        });
    }
    
    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }
    
    startAutoPlay() {
        this.isAutoPlaying = true;
        const toggleBtn = document.getElementById('toggle-auto');
        if (toggleBtn) {
            toggleBtn.classList.add('active');
            toggleBtn.querySelector('.btn-icon').textContent = '⏸';
        }
        
        // Reduced auto-play speed (was 0.001, now 0.0005)
        this.autoPlayInterval = setInterval(() => {
            if (this.targetPosition >= 1) {
                this.stopAutoPlay();
            } else {
                this.targetPosition = Math.min(1, this.targetPosition + 0.0005);
            }
        }, 50);
    }
    
    stopAutoPlay() {
        this.isAutoPlaying = false;
        const toggleBtn = document.getElementById('toggle-auto');
        if (toggleBtn) {
            toggleBtn.classList.remove('active');
            toggleBtn.querySelector('.btn-icon').textContent = '▶';
        }
        
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    showEventDetail(index) {
        if (index < 0 || index >= this.events.length) return;
        
        const event = this.events[index];
        const era = this.getEra(event);
        
        // Helper to get icon for resource type
        const getTypeIcon = (type) => {
            const icons = {
                'video': '🎬',
                'tutorial': '📖',
                'course': '🎓',
                'book': '📚',
                'paper': '📄',
                'encyclopedia': '📜',
                'documentation': '📋',
                'article': '📰',
                'podcast': '🎧',
                'tool': '🔧'
            };
            return icons[type] || '🔗';
        };
        
        // Helper to get difficulty badge
        const getDifficultyBadge = (difficulty) => {
            const badges = {
                'beginner': '<span class="difficulty-badge beginner">🌱 Beginner</span>',
                'intermediate': '<span class="difficulty-badge intermediate">🌿 Intermediate</span>',
                'advanced': '<span class="difficulty-badge advanced">🌳 Advanced</span>'
            };
            return badges[difficulty] || '';
        };
        
        let html = `
            <div class="panel-header">
                <div class="panel-icon" style="background: ${era?.color || '#81C784'}20; border-color: ${era?.color || '#81C784'}">
                    ${event.icon || '📚'}
                </div>
                <div class="panel-title-area">
                    <h2>${event.title}</h2>
                    <div class="panel-meta">
                        <span class="panel-year">${event.year}${event.month ? ` (${event.month})` : ''}</span>
                        ${event.type ? `<span class="panel-type">${event.type}</span>` : ''}
                        ${era ? `<span class="panel-tag" style="background: ${era.color}20; color: ${era.color}; border-color: ${era.color}">${era.name}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Tags
        if (event.tags && event.tags.length > 0) {
            html += `
                <div class="panel-tags">
                    ${event.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            `;
        }
        
        // What happened
        html += `
            <div class="panel-section">
                <h3>📌 What Happened</h3>
                <p>${event.what || event.description || 'A significant milestone in AI history.'}</p>
            </div>
        `;
        
        // Why it matters
        if (event.why_it_matters) {
            html += `
                <div class="panel-section highlight">
                    <h3>💡 Why It Matters</h3>
                    <p>${event.why_it_matters}</p>
                </div>
            `;
        }
        
        // Impact
        if (event.impact) {
            html += `
                <div class="panel-section">
                    <h3>🌍 Impact</h3>
                    <p>${event.impact}</p>
                </div>
            `;
        }
        
        // Original Work (paper/book)
        if (event.work) {
            html += `
                <div class="panel-section work-section">
                    <h3>📜 Original Work</h3>
                    <div class="work-card">
                        <div class="work-type">${event.work.type || 'publication'}</div>
                        <div class="work-title">${event.work.title}</div>
                        <div class="work-meta">
                            ${event.work.year ? `<span>📅 ${event.work.year}</span>` : ''}
                            ${event.work.published_in ? `<span>📰 ${event.work.published_in}</span>` : ''}
                            ${event.work.venue ? `<span>📍 ${event.work.venue}</span>` : ''}
                        </div>
                        ${event.work.url ? `<a href="${event.work.url}" target="_blank" rel="noopener" class="work-link">View Original →</a>` : ''}
                    </div>
                </div>
            `;
        }
        
        // Authors with full details
        if (event.authors && event.authors.length > 0) {
            html += `
                <div class="panel-section authors-section">
                    <h3>👥 Key Contributors</h3>
                    <div class="authors-grid">
                        ${event.authors.map(author => {
                            const name = author.name || author;
                            const isDetailed = typeof author === 'object';
                            
                            if (isDetailed) {
                                return `
                                    <div class="author-card">
                                        <div class="author-header">
                                            <div class="author-avatar">${name.charAt(0)}</div>
                                            <div class="author-info">
                                                <div class="author-name">${name}</div>
                                                ${author.role ? `<div class="author-role">${author.role}</div>` : ''}
                                            </div>
                                        </div>
                                        <div class="author-details">
                                            ${author.born || author.died ? `<div class="author-dates">📅 ${author.born || '?'} - ${author.died || 'present'}</div>` : ''}
                                            ${author.nationality ? `<div class="author-nationality">🌍 ${author.nationality}</div>` : ''}
                                            ${author.affiliation ? `<div class="author-affiliation">🏛️ ${author.affiliation}</div>` : ''}
                                            ${author.background ? `<div class="author-background">${author.background}</div>` : ''}
                                            ${author.contribution ? `<div class="author-contribution"><strong>Contribution:</strong> ${author.contribution}</div>` : ''}
                                        </div>
                                    </div>
                                `;
                            } else {
                                return `
                                    <div class="author-chip">
                                        <div class="avatar">${name.charAt(0)}</div>
                                        <span>${name}</span>
                                    </div>
                                `;
                            }
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        // Learning Resources
        if (event.learn && event.learn.length > 0) {
            html += `
                <div class="panel-section learn-section">
                    <h3>📚 Learn More</h3>
                    <div class="learn-grid">
                        ${event.learn.map(resource => `
                            <a href="${resource.url}" target="_blank" rel="noopener" class="learn-card">
                                <div class="learn-icon">${getTypeIcon(resource.type)}</div>
                                <div class="learn-content">
                                    <div class="learn-title">${resource.title}</div>
                                    <div class="learn-meta">
                                        ${resource.type ? `<span class="learn-type">${resource.type}</span>` : ''}
                                        ${resource.duration ? `<span class="learn-duration">⏱️ ${resource.duration}</span>` : ''}
                                    </div>
                                    ${getDifficultyBadge(resource.difficulty)}
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // References
        if (event.references && event.references.length > 0) {
            html += `
                <div class="panel-section references-section">
                    <h3>📖 References</h3>
                    <div class="references-list">
                        ${event.references.map(ref => `
                            <a href="${ref.url}" target="_blank" rel="noopener" class="reference-link">
                                ${getTypeIcon(ref.type)} ${ref.title}
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Legacy links (backward compatibility)
        if (event.links && event.links.length > 0) {
            html += `
                <div class="panel-section">
                    <h3>🔗 Related Links</h3>
                    <div class="panel-links">
                        ${event.links.map(link => `
                            <a href="${link.url}" target="_blank" rel="noopener" class="panel-link">
                                🔗 ${link.title}
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        html += `
            <div class="panel-nav">
                <button class="panel-nav-btn" onclick="journey.navigateEvent(-1)" ${index === 0 ? 'disabled' : ''}>
                    ← Previous
                </button>
                <span class="panel-nav-counter">${index + 1} / ${this.events.length}</span>
                <button class="panel-nav-btn" onclick="journey.navigateEvent(1)" ${index === this.events.length - 1 ? 'disabled' : ''}>
                    Next →
                </button>
            </div>
        `;
        
        this.panelContent.innerHTML = html;
        this.eventPanel.classList.add('open');
    }
    
    navigateEvent(direction) {
        const newIndex = this.currentEventIndex + direction;
        if (newIndex >= 0 && newIndex < this.events.length) {
            this.targetPosition = newIndex / this.events.length;
            this.showEventDetail(newIndex);
        }
    }
    
    closePanel() {
        this.eventPanel.classList.remove('open');
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Smooth camera movement
        const smoothing = 0.08;
        this.currentPosition += (this.targetPosition - this.currentPosition) * smoothing;
        
        // Update camera position along path
        if (this.roadPath) {
            const point = this.roadPath.getPoint(this.currentPosition);

            // Calculate a smoother tangent for camera placement
            // We want the camera to "trail" behind the current position
            // But we must stick to the path's curve, otherwise we go off-road and clip objects
            const tangent = this.roadPath.getTangent(this.currentPosition).normalize();

            // Place camera 12 units "behind" the current point along the tangent
            // and 4 units up for better view over objects
            const cameraOffset = tangent.clone().negate().multiplyScalar(12);
            this.camera.position.copy(point).add(cameraOffset);
            this.camera.position.y += 4;

            // Look ahead significantly
            const lookAheadDist = Math.min(1, this.currentPosition + 0.03);
            const lookAhead = this.roadPath.getPoint(lookAheadDist);
            // Correct look target: specific point on path
            this.camera.lookAt(lookAhead.x, 1.5, lookAhead.z);
        }
        
        // Animate butterflies
        if (this.butterflies) {
            const time = Date.now() * 0.001;
            this.butterflies.forEach(butterfly => {
                butterfly.position.y = butterfly.userData.baseY + 
                    Math.sin(time * butterfly.userData.speed + butterfly.userData.phase) * 0.5;
                butterfly.rotation.y = Math.sin(time * 2) * 0.3;
            });
        }
        
        // Animate artifact beacons (pulse and bob)
        if (this.artifactBeacons) {
            const time = Date.now() * 0.001;
            this.artifactBeacons.forEach((beacon, i) => {
                // Bob up and down (higher base position)
                beacon.position.y = 8 + Math.sin(time * 2 + i * 0.5) * 0.8;
                // Pulse scale (bigger pulse)
                const pulse = 1.2 + Math.sin(time * 3 + i) * 0.3;
                beacon.scale.setScalar(pulse);
                // Rotate slowly
                beacon.rotation.y = time * 0.5;
            });
        }
        
        // Animate era environment elements (futuristic rings, holograms, orbs)
        if (this.eraElements) {
            const time = Date.now() * 0.001;
            this.eraElements.forEach((elem, i) => {
                switch(elem.type) {
                    case 'ring':
                        elem.mesh.rotation.z = time * 0.5 + i;
                        break;
                    case 'floatRing':
                        elem.mesh.position.y = elem.baseY + Math.sin(time + elem.offset) * 0.5;
                        elem.mesh.rotation.z = time * 0.3;
                        break;
                    case 'holo':
                        elem.mesh.rotation.y = time * 2;
                        elem.mesh.rotation.x = Math.sin(time) * 0.3;
                        break;
                    case 'orb':
                        elem.mesh.position.y = elem.baseY + Math.sin(time * 1.5 + elem.angle) * 1;
                        break;
                }
            });
        }
        
        // Update current event index
        const newEventIndex = Math.floor(this.currentPosition * this.events.length);
        if (newEventIndex !== this.currentEventIndex && newEventIndex < this.events.length) {
            this.currentEventIndex = newEventIndex;
            this.updateHUD();
        }
        
        // Update speed display
        const speed = Math.abs(this.targetPosition - this.currentPosition) * 1000;
        if (this.speedValue) {
            this.speedValue.textContent = Math.round(speed);
        }
        
        // Update speedometer arc
        if (this.speedoArc) {
            const maxSpeed = 50;
            const normalizedSpeed = Math.min(speed / maxSpeed, 1);
            const circumference = 283;
            this.speedoArc.style.strokeDashoffset = circumference * (1 - normalizedSpeed);
        }
        
        // Update minimap player position (smooth updates)
        this.updateMinimapPlayer();
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateHUD() {
        if (this.currentEventIndex < 0 || this.currentEventIndex >= this.events.length) return;
        
        const event = this.events[this.currentEventIndex];
        const era = this.getEra(event);
        
        // Update year display
        if (this.hudYear) this.hudYear.textContent = event.year;
        if (this.progressYear) this.progressYear.textContent = event.year;
        
        // Update event info
        if (this.hudTitle) this.hudTitle.textContent = event.title;
        if (this.hudSubtitle) this.hudSubtitle.textContent = event.authors?.[0]?.name || '';
        
        // Update next event
        if (this.hudNext && this.currentEventIndex < this.events.length - 1) {
            this.hudNext.textContent = this.events[this.currentEventIndex + 1].title;
        }
        
        // Update era indicator
        if (this.hudEra && era) {
            this.hudEra.style.background = era.color;
        }
        
        // Update progress bar
        const progress = (this.currentEventIndex / (this.events.length - 1)) * 100;
        if (this.progressFill) this.progressFill.style.width = `${progress}%`;
        if (this.progressGlow) this.progressGlow.style.width = `${progress}%`;
        
        // Update milestone counter
        if (this.eventsPassed) this.eventsPassed.textContent = this.currentEventIndex + 1;
        
        // Update minimap player position
        this.updateMinimapPlayer();
        
        // Update era legend active state
        const eraItems = this.eraLegend.querySelectorAll('.era-item');
        eraItems.forEach(item => {
            item.classList.toggle('active', item.dataset.era === era?.id);
        });
    }
}

// Initialize journey
let journey;
document.addEventListener('DOMContentLoaded', () => {
    journey = new AIJourney3D();
});
