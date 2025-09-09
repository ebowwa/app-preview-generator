const DEVICE_DIMENSIONS = {
    'iphone-69': { width: 1320, height: 2868 },
    'iphone-69-landscape': { width: 2868, height: 1320 },
    'iphone-67': { width: 1290, height: 2796 },
    'iphone-67-landscape': { width: 2796, height: 1290 },
    'iphone-65': { width: 1179, height: 2556 },
    'iphone-65-landscape': { width: 2556, height: 1179 },
    'iphone-61': { width: 1284, height: 2778 },
    'iphone-61-landscape': { width: 2778, height: 1284 },
    'ipad-129': { width: 2048, height: 2732 },
    'ipad-129-landscape': { width: 2732, height: 2048 },
    'ipad-11': { width: 2064, height: 2752 },
    'ipad-11-landscape': { width: 2752, height: 2064 }
};

const CONSTANTS = {
    EXPORT_DELAY: 500,
    LANGUAGE_SWITCH_DELAY: 100,
    POSITION_LIMITS: { min: -50, max: 50 },
    DEFAULT_SCALE: 100,
    FILL_FRAME_SCALE: 120,
    GRID_SNAP_SIZE: 10,
    PREVIEW_SCALE: 0.3,
    DRAG_SCALE_FACTOR: 3,
    DEFAULT_COLORS: {
        primary: '#667eea',
        secondary: '#764ba2',
        background: '#ffffff'
    }
};

let screens = [
    {
        screenshot: null,
        overlayTitle: '',
        overlaySubtitle: '',
        overlayDescription: '',
        overlayStyle: 'none',
        textPosition: 'top',
        language: 'en',
        imagePosition: {
            x: 0,
            y: 0,
            scale: CONSTANTS.DEFAULT_SCALE,
            rotation: 0
        },
        layerOrder: 'front',
        screenshotOpacity: CONSTANTS.DEFAULT_SCALE,
        overlayOpacity: 90,
        bgColor: CONSTANTS.DEFAULT_COLORS.background
    }
];

let currentScreen = 0;
let currentDevice = 'iphone-69';
let currentLang = 'en';
let showGrid = false;
let snapToGrid = false;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let imageStart = { x: 0, y: 0 };

const TRANSLATIONS = {
    en: {
        chat: "CHAT",
        share: "SHARE",
        discover: "DISCOVER",
        create: "CREATE",
        subtitle: "Stay connected with friends",
        description: "Send messages, photos, and videos instantly"
    },
    es: {
        chat: "CHATEAR",
        share: "COMPARTIR",
        discover: "DESCUBRIR",
        create: "CREAR",
        subtitle: "Mantente conectado con amigos",
        description: "Envía mensajes, fotos y videos al instante"
    },
    fr: {
        chat: "DISCUTER",
        share: "PARTAGER",
        discover: "DÉCOUVRIR",
        create: "CRÉER",
        subtitle: "Restez connecté avec vos amis",
        description: "Envoyez des messages, photos et vidéos instantanément"
    },
    de: {
        chat: "CHATTEN",
        share: "TEILEN",
        discover: "ENTDECKEN",
        create: "ERSTELLEN",
        subtitle: "Bleibe mit Freunden in Verbindung",
        description: "Sende sofort Nachrichten, Fotos und Videos"
    }
};

function updateElementValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value;
}

function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}

function toggleElementClass(id, className, condition) {
    const element = document.getElementById(id);
    if (element) {
        if (condition) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    }
}

function getTranslation(key, lang = currentLang) {
    return TRANSLATIONS[lang] && TRANSLATIONS[lang][key] ? TRANSLATIONS[lang][key] : key;
}

function createDefaultImagePosition() {
    return { x: 0, y: 0, scale: CONSTANTS.DEFAULT_SCALE, rotation: 0 };
}

function setLayerOrder(order) {
    if (!screens[currentScreen]) return;
    screens[currentScreen].layerOrder = order;
    const layerFront = document.getElementById('layerFront');
    const layerBack = document.getElementById('layerBack');
    if (layerFront) layerFront.classList.toggle('active', order === 'front');
    if (layerBack) layerBack.classList.toggle('active', order === 'back');
    updatePreview();
}

function updateScreenshotOpacity(value) {
    if (!screens[currentScreen]) return;
    screens[currentScreen].screenshotOpacity = value;
    const opacityValue = document.getElementById('screenshotOpacityValue');
    if (opacityValue) opacityValue.textContent = value + '%';
    updatePreview();
}

function updateOverlayOpacity(value) {
    if (!screens[currentScreen]) return;
    screens[currentScreen].overlayOpacity = value;
    const opacityValue = document.getElementById('overlayOpacityValue');
    if (opacityValue) opacityValue.textContent = value + '%';
    updatePreview();
}

function updateScale(value) {
    if (!screens[currentScreen]) return;
    screens[currentScreen].imagePosition.scale = value;
    updateElementText('scaleValue', value + '%');
    updatePreview();
}

function updatePosition(axis, value) {
    if (!screens[currentScreen]) return;
    screens[currentScreen].imagePosition[axis] = value;
    updateElementText(axis + 'Value', value + '%');
    updatePreview();
}

function updateRotation(value) {
    if (!screens[currentScreen]) return;
    screens[currentScreen].imagePosition.rotation = value;
    updateElementText('rotateValue', value + '°');
    updatePreview();
}

function handleScreenshotUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Store dimensions for display
                const dimensionIndicator = document.getElementById('dimensionIndicator');
                if (dimensionIndicator) {
                    dimensionIndicator.className = 'dimension-indicator valid';
                    dimensionIndicator.textContent = `📐 ${img.width}×${img.height}px uploaded`;
                }
                
                screens[currentScreen].screenshot = e.target.result;
                screens[currentScreen].originalDimensions = {
                    width: img.width,
                    height: img.height
                };
                screens[currentScreen].layerOrder = 'front'; // Set screenshot to front by default
                document.getElementById('screenshotPreview').src = e.target.result;
                document.getElementById('screenshotPreview').style.display = 'block';
                document.getElementById('uploadPlaceholder').style.display = 'none';
                document.getElementById('uploadArea').classList.add('has-image');
                
                // Update layer button states (with null checks)
                const layerFront = document.getElementById('layerFront');
                const layerBack = document.getElementById('layerBack');
                if (layerFront) layerFront.classList.add('active');
                if (layerBack) layerBack.classList.remove('active');
                
                updatePreview();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function removeScreenshot(event) {
    event.stopPropagation();
    screens[currentScreen].screenshot = null;
    screens[currentScreen].originalDimensions = null;
    screens[currentScreen].isValidDimension = null;
    screens[currentScreen].imagePosition = createDefaultImagePosition();
    screens[currentScreen].layerOrder = 'front';
    screens[currentScreen].screenshotOpacity = CONSTANTS.DEFAULT_SCALE;
    screens[currentScreen].overlayOpacity = 90;
    document.getElementById('screenshotPreview').style.display = 'none';
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('uploadArea').classList.remove('has-image');
    document.getElementById('screenshotInput').value = '';
    
    const dimensionIndicator = document.getElementById('dimensionIndicator');
    if (dimensionIndicator) {
        dimensionIndicator.className = 'dimension-indicator';
        dimensionIndicator.textContent = '';
    }
    
    resetControls();
    updatePreview();
}

function fitToFrame() {
    if (!screens[currentScreen]) return;
    screens[currentScreen].imagePosition = createDefaultImagePosition();
    resetControls();
    updatePreview();
}

function fillFrame() {
    if (!screens[currentScreen]) return;
    screens[currentScreen].imagePosition = { x: 0, y: 0, scale: CONSTANTS.FILL_FRAME_SCALE, rotation: 0 };
    updateElementValue('scaleControl', CONSTANTS.FILL_FRAME_SCALE);
    updateElementText('scaleValue', CONSTANTS.FILL_FRAME_SCALE + '%');
    resetControls();
    updatePreview();
}

function resetPosition() {
    if (!screens[currentScreen]) return;
    screens[currentScreen].imagePosition = createDefaultImagePosition();
    resetControls();
    updatePreview();
}

function centerImage() {
    if (!screens[currentScreen]) return;
    screens[currentScreen].imagePosition.x = 0;
    screens[currentScreen].imagePosition.y = 0;
    updateElementValue('xControl', 0);
    updateElementValue('yControl', 0);
    updateElementText('xValue', '0%');
    updateElementText('yValue', '0%');
    updatePreview();
}

function toggleGrid() {
    showGrid = !showGrid;
    toggleElementClass('gridToggle', 'active', showGrid);
    updatePreview();
}

function toggleSnap() {
    snapToGrid = !snapToGrid;
    toggleElementClass('snapToggle', 'active', snapToGrid);
}

function resetControls() {
    if (!screens[currentScreen]) return;
    const screen = screens[currentScreen];
    const controls = {
        scaleControl: screen.imagePosition.scale,
        xControl: screen.imagePosition.x,
        yControl: screen.imagePosition.y,
        rotateControl: screen.imagePosition.rotation
    };
    
    for (const [id, value] of Object.entries(controls)) {
        updateElementValue(id, value);
    }
    
    const values = {
        scaleValue: screen.imagePosition.scale + '%',
        xValue: screen.imagePosition.x + '%',
        yValue: screen.imagePosition.y + '%',
        rotateValue: screen.imagePosition.rotation + '°'
    };
    
    for (const [id, text] of Object.entries(values)) {
        updateElementText(id, text);
    }
}

function addNewScreen() {
    const newScreen = {
        screenshot: null,
        overlayTitle: '',
        overlaySubtitle: '',
        overlayDescription: '',
        overlayStyle: 'none',
        textPosition: 'top',
        language: currentLang,
        imagePosition: createDefaultImagePosition(),
        layerOrder: 'front',
        screenshotOpacity: CONSTANTS.DEFAULT_SCALE,
        overlayOpacity: 90,
        bgColor: CONSTANTS.DEFAULT_COLORS.background
    };
    screens.push(newScreen);
    currentScreen = screens.length - 1;
    updateScreenTabs();
    loadScreenData(currentScreen);
    updatePreview();
}

function deleteScreen(index, event) {
    if (event) event.stopPropagation();
    if (screens.length > 1) {
        screens.splice(index, 1);
        if (currentScreen >= screens.length) {
            currentScreen = screens.length - 1;
        }
        updateScreenTabs();
        loadScreenData(currentScreen);
        updatePreview();
    } else {
        alert('You must have at least one screen');
    }
}

function selectScreen(index) {
    currentScreen = index;
    document.querySelectorAll('.screen-tab').forEach((tab, i) => {
        if (tab) tab.classList.toggle('active', i === index);
    });
    loadScreenData(index);
}

function updateScreenTabs() {
    const tabsContainer = document.querySelector('.screen-tabs');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = '';
    
    screens.forEach((screen, index) => {
        const tab = document.createElement('button');
        tab.className = `screen-tab ${index === currentScreen ? 'active' : ''}`;
        tab.dataset.screen = index;
        tab.innerHTML = `
            ${screen.overlayTitle || `Screen ${index + 1}`}
            ${screens.length > 1 ? `<span class="delete-btn" onclick="deleteScreen(${index}, event)">×</span>` : ''}
        `;
        tab.onclick = function(e) {
            if (!e.target.classList.contains('delete-btn')) {
                selectScreen(index);
            }
        };
        tabsContainer.appendChild(tab);
    });
    
    const addBtn = document.createElement('button');
    addBtn.className = 'add-screen-btn';
    addBtn.textContent = '+ Add Screen';
    addBtn.onclick = addNewScreen;
    tabsContainer.appendChild(addBtn);
}

function loadScreenData(index) {
    const screen = screens[index];
    
    // Update screenshot preview
    if (screen.screenshot) {
        document.getElementById('screenshotPreview').src = screen.screenshot;
        document.getElementById('screenshotPreview').style.display = 'block';
        document.getElementById('uploadPlaceholder').style.display = 'none';
        document.getElementById('uploadArea').classList.add('has-image');
    } else {
        document.getElementById('screenshotPreview').style.display = 'none';
        document.getElementById('uploadPlaceholder').style.display = 'block';
        document.getElementById('uploadArea').classList.remove('has-image');
    }
    
    // Update text fields
    document.getElementById('overlayTitle').value = screen.overlayTitle || '';
    document.getElementById('overlaySubtitle').value = screen.overlaySubtitle || '';
    document.getElementById('overlayDescription').value = screen.overlayDescription || '';
    
    // Update overlay style
    document.querySelector(`input[name="overlay"][value="${screen.overlayStyle}"]`).checked = true;
    
    // Update text position
    document.querySelectorAll('.position-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.position === screen.textPosition);
    });
    
    // Update layer controls (with null checks)
    const layerFront = document.getElementById('layerFront');
    const layerBack = document.getElementById('layerBack');
    const screenshotOpacity = document.getElementById('screenshotOpacity');
    const screenshotOpacityValue = document.getElementById('screenshotOpacityValue');
    const overlayOpacity = document.getElementById('overlayOpacity');
    const overlayOpacityValue = document.getElementById('overlayOpacityValue');
    const bgColor = document.getElementById('bgColor');
    const bgHex = document.getElementById('bgHex');
    
    if (layerFront && layerBack) {
        layerFront.classList.toggle('active', screen.layerOrder === 'front');
        layerBack.classList.toggle('active', screen.layerOrder !== 'front');
    }
    
    if (screenshotOpacity) {
        screenshotOpacity.value = screen.screenshotOpacity || 100;
    }
    if (screenshotOpacityValue) {
        screenshotOpacityValue.textContent = (screen.screenshotOpacity || 100) + '%';
    }
    
    if (overlayOpacity) {
        overlayOpacity.value = screen.overlayOpacity || 90;
    }
    if (overlayOpacityValue) {
        overlayOpacityValue.textContent = (screen.overlayOpacity || 90) + '%';
    }
    
    if (bgColor) {
        bgColor.value = screen.bgColor || '#ffffff';
    }
    if (bgHex) {
        bgHex.value = screen.bgColor || '#ffffff';
    }
    
    // Update position controls
    resetControls();
    
    updatePreview();
}

function setupDragAndDrop(container, screenIndex) {
    const img = container.querySelector('.screenshot-img');
    if (!img) return;

    let localDragging = false;
    let startPos = { x: 0, y: 0 };
    let startImagePos = { x: 0, y: 0 };

    container.addEventListener('mousedown', function(e) {
        if (e.target === img) {
            localDragging = true;
            container.classList.add('dragging');
            startPos = { x: e.clientX, y: e.clientY };
            startImagePos = { 
                x: screens[screenIndex].imagePosition.x, 
                y: screens[screenIndex].imagePosition.y 
            };
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (localDragging && screenIndex === currentScreen) {
            const deltaX = (e.clientX - startPos.x) / CONSTANTS.DRAG_SCALE_FACTOR;
            const deltaY = (e.clientY - startPos.y) / CONSTANTS.DRAG_SCALE_FACTOR;
            
            let newX = startImagePos.x + deltaX;
            let newY = startImagePos.y + deltaY;
            
            if (snapToGrid) {
                newX = Math.round(newX / CONSTANTS.GRID_SNAP_SIZE) * CONSTANTS.GRID_SNAP_SIZE;
                newY = Math.round(newY / CONSTANTS.GRID_SNAP_SIZE) * CONSTANTS.GRID_SNAP_SIZE;
            }
            
            screens[screenIndex].imagePosition.x = Math.max(CONSTANTS.POSITION_LIMITS.min, Math.min(CONSTANTS.POSITION_LIMITS.max, newX));
            screens[screenIndex].imagePosition.y = Math.max(CONSTANTS.POSITION_LIMITS.min, Math.min(CONSTANTS.POSITION_LIMITS.max, newY));
            
            document.getElementById('xControl').value = screens[screenIndex].imagePosition.x;
            document.getElementById('yControl').value = screens[screenIndex].imagePosition.y;
            document.getElementById('xValue').textContent = screens[screenIndex].imagePosition.x + '%';
            document.getElementById('yValue').textContent = screens[screenIndex].imagePosition.y + '%';
            
            updatePreview();
        }
    });

    document.addEventListener('mouseup', function() {
        if (localDragging) {
            localDragging = false;
            container.classList.remove('dragging');
        }
    });

    // Touch support
    container.addEventListener('touchstart', function(e) {
        if (e.target === img) {
            localDragging = true;
            container.classList.add('dragging');
            startPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            startImagePos = { 
                x: screens[screenIndex].imagePosition.x, 
                y: screens[screenIndex].imagePosition.y 
            };
            e.preventDefault();
        }
    });

    container.addEventListener('touchmove', function(e) {
        if (localDragging && screenIndex === currentScreen) {
            const deltaX = (e.touches[0].clientX - startPos.x) / CONSTANTS.DRAG_SCALE_FACTOR;
            const deltaY = (e.touches[0].clientY - startPos.y) / CONSTANTS.DRAG_SCALE_FACTOR;
            
            let newX = startImagePos.x + deltaX;
            let newY = startImagePos.y + deltaY;
            
            if (snapToGrid) {
                newX = Math.round(newX / CONSTANTS.GRID_SNAP_SIZE) * CONSTANTS.GRID_SNAP_SIZE;
                newY = Math.round(newY / CONSTANTS.GRID_SNAP_SIZE) * CONSTANTS.GRID_SNAP_SIZE;
            }
            
            screens[screenIndex].imagePosition.x = Math.max(CONSTANTS.POSITION_LIMITS.min, Math.min(CONSTANTS.POSITION_LIMITS.max, newX));
            screens[screenIndex].imagePosition.y = Math.max(CONSTANTS.POSITION_LIMITS.min, Math.min(CONSTANTS.POSITION_LIMITS.max, newY));
            
            document.getElementById('xControl').value = screens[screenIndex].imagePosition.x;
            document.getElementById('yControl').value = screens[screenIndex].imagePosition.y;
            document.getElementById('xValue').textContent = screens[screenIndex].imagePosition.x + '%';
            document.getElementById('yValue').textContent = screens[screenIndex].imagePosition.y + '%';
            
            updatePreview();
            e.preventDefault();
        }
    });

    container.addEventListener('touchend', function() {
        if (localDragging) {
            localDragging = false;
            container.classList.remove('dragging');
        }
    });
}

function updatePreview() {
    const carousel = document.getElementById('screensCarousel');
    if (!carousel) return;
    
    carousel.innerHTML = '';
    
    screens.forEach((screen, index) => {
        const frameDiv = document.createElement('div');
        frameDiv.className = `phone-frame ${currentDevice}`;
        frameDiv.innerHTML = `
            <span class="screen-number">${index + 1}</span>
            <div class="screen-content">
                ${getScreenContent(screen, index)}
            </div>
        `;
        carousel.appendChild(frameDiv);
        
        // Setup drag and drop for this screen
        const container = frameDiv.querySelector('.screenshot-container');
        if (container) {
            setupDragAndDrop(container, index);
        }
    });
}

function getScreenContent(screen, index) {
    const primaryColorEl = document.getElementById('primaryColor');
    const secondaryColorEl = document.getElementById('secondaryColor');
    const primaryColor = primaryColorEl ? primaryColorEl.value : CONSTANTS.DEFAULT_COLORS.primary;
    const secondaryColor = secondaryColorEl ? secondaryColorEl.value : CONSTANTS.DEFAULT_COLORS.secondary;
    
    const bgColorValue = screen.bgColor || CONSTANTS.DEFAULT_COLORS.background;
    const screenshotOpacityValue = (screen.screenshotOpacity !== undefined ? screen.screenshotOpacity : CONSTANTS.DEFAULT_SCALE) / CONSTANTS.DEFAULT_SCALE;
    const overlayOpacityValue = (screen.overlayOpacity !== undefined ? screen.overlayOpacity : 90) / CONSTANTS.DEFAULT_SCALE;
    const layerOrderValue = screen.layerOrder || 'front';
    
    if (!screen.screenshot) {
        return `
            <div class="screenshot-container no-screenshot" style="background: ${bgColorValue};">
                <div class="upload-placeholder-content">
                    <div class="placeholder-icon">📱</div>
                    <div class="placeholder-text">No screenshot uploaded</div>
                </div>
            </div>
        `;
    }
    
    const pos = screen.imagePosition || createDefaultImagePosition();
    const imgStyle = `
        transform: translate(${pos.x}%, ${pos.y}%) scale(${pos.scale / CONSTANTS.DEFAULT_SCALE}) rotate(${pos.rotation}deg);
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: ${screenshotOpacityValue};
    `;
    
    let overlayClass = `screenshot-overlay overlay-${screen.overlayStyle} overlay-${screen.textPosition}`;
    let overlayStyle = `opacity: ${overlayOpacityValue};`;
    
    if (screen.overlayStyle === 'gradient') {
        overlayStyle += `background: linear-gradient(135deg, rgba(${hexToRgb(primaryColor).join(',')},0.9) 0%, rgba(${hexToRgb(secondaryColor).join(',')},0.9) 100%);`;
    }
    
    const hasOverlay = screen.overlayStyle !== 'none' || screen.overlayTitle || screen.overlaySubtitle || screen.overlayDescription;
    
    // Layer order: 'front' = screenshot on top, 'back' = text on top
    if (layerOrderValue === 'front') {
        // Screenshot in front (on top)
        return `
            <div class="screenshot-container" data-index="${index}" style="background: ${bgColorValue};">
                ${showGrid ? '<div class="grid-overlay show"></div>' : ''}
                ${hasOverlay ? `
                    <div class="${overlayClass}" style="${overlayStyle}">
                        <div class="overlay-content">
                            ${screen.overlayTitle ? `<div class="overlay-title">${screen.overlayTitle}</div>` : ''}
                            ${screen.overlaySubtitle ? `<div class="overlay-subtitle">${screen.overlaySubtitle}</div>` : ''}
                            ${screen.overlayDescription ? `<div class="overlay-description">${screen.overlayDescription}</div>` : ''}
                        </div>
                    </div>
                ` : ''}
                <img src="${screen.screenshot}" class="screenshot-img" style="${imgStyle}; position: absolute; z-index: 10;" alt="Screenshot" draggable="false">
            </div>
        `;
    } else {
        // Text in front (default/traditional)
        return `
            <div class="screenshot-container" data-index="${index}" style="background: ${bgColorValue};">
                ${showGrid ? '<div class="grid-overlay show"></div>' : ''}
                <img src="${screen.screenshot}" class="screenshot-img" style="${imgStyle}" alt="Screenshot" draggable="false">
                ${hasOverlay ? `
                    <div class="${overlayClass}" style="${overlayStyle}">
                        <div class="overlay-content">
                            ${screen.overlayTitle ? `<div class="overlay-title">${screen.overlayTitle}</div>` : ''}
                            ${screen.overlaySubtitle ? `<div class="overlay-subtitle">${screen.overlaySubtitle}</div>` : ''}
                            ${screen.overlayDescription ? `<div class="overlay-description">${screen.overlayDescription}</div>` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0, 0, 0];
}

function createExportCanvas(screen, dimensions, filename) {
    return new Promise((resolve) => {
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = dimensions.width + 'px';
        tempContainer.style.height = dimensions.height + 'px';
        document.body.appendChild(tempContainer);
        
        const frameDiv = document.createElement('div');
        frameDiv.style.width = dimensions.width + 'px';
        frameDiv.style.height = dimensions.height + 'px';
        frameDiv.style.position = 'relative';
        frameDiv.style.overflow = 'hidden';
        frameDiv.innerHTML = getScreenContent(screen, 0);
        tempContainer.appendChild(frameDiv);
        
        setTimeout(() => {
            html2canvas(frameDiv, {
                width: dimensions.width,
                height: dimensions.height,
                scale: 1,
                backgroundColor: null,
                useCORS: true,
                allowTaint: true
            }).then(canvas => {
                document.body.removeChild(tempContainer);
                
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                    resolve();
                });
            });
        }, CONSTANTS.EXPORT_DELAY);
    });
}

async function exportCurrentScreen() {
    const dimensions = DEVICE_DIMENSIONS[currentDevice] || DEVICE_DIMENSIONS['iphone-69'];
    
    const filename = `appstore-${dimensions.width}x${dimensions.height}-screen-${currentScreen + 1}-${currentLang}.png`;
    await createExportCanvas(screens[currentScreen], dimensions, filename);
}

async function exportAllScreens() {
    const dimensions = DEVICE_DIMENSIONS[currentDevice] || DEVICE_DIMENSIONS['iphone-69'];
    
    for (let i = 0; i < screens.length; i++) {
        const originalScreen = currentScreen;
        currentScreen = i;
        
        const filename = `appstore-${dimensions.width}x${dimensions.height}-screen-${i + 1}-${currentLang}.png`;
        await createExportCanvas(screens[i], dimensions, filename);
        
        currentScreen = originalScreen;
        await new Promise(resolve => setTimeout(resolve, CONSTANTS.EXPORT_DELAY));
    }
}

async function exportForAllLanguages() {
    const languages = document.querySelectorAll('.lang-btn');
    alert(`This will export ${screens.length} screens × ${languages.length} languages = ${screens.length * languages.length} files.`);
    
    for (let langBtn of languages) {
        langBtn.click();
        await new Promise(resolve => setTimeout(resolve, CONSTANTS.LANGUAGE_SWITCH_DELAY));
        await exportAllScreens();
    }
}

function saveProject() {
    const projectData = {
        screens: screens,
        settings: {
            currentDevice: currentDevice,
            currentLang: currentLang,
            primaryColor: document.getElementById('primaryColor').value,
            secondaryColor: document.getElementById('secondaryColor').value,
            showGrid: showGrid,
            snapToGrid: snapToGrid
        },
        version: '2.0' // Updated version for layer support
    };
    
    const dataStr = JSON.stringify(projectData);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-screenshots-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadProject(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const projectData = JSON.parse(e.target.result);
                screens = projectData.screens;
                
                // Add default values for older projects
                screens = screens.map(screen => ({
                    ...screen,
                    layerOrder: screen.layerOrder || 'front',
                    screenshotOpacity: screen.screenshotOpacity !== undefined ? screen.screenshotOpacity : CONSTANTS.DEFAULT_SCALE,
                    overlayOpacity: screen.overlayOpacity !== undefined ? screen.overlayOpacity : 90,
                    bgColor: screen.bgColor || CONSTANTS.DEFAULT_COLORS.background
                }));
                
                currentDevice = projectData.settings.currentDevice;
                currentLang = projectData.settings.currentLang;
                document.getElementById('primaryColor').value = projectData.settings.primaryColor;
                document.getElementById('secondaryColor').value = projectData.settings.secondaryColor;
                showGrid = projectData.settings.showGrid || false;
                snapToGrid = projectData.settings.snapToGrid || false;
                
                const gridToggle = document.getElementById('gridToggle');
                const snapToggle = document.getElementById('snapToggle');
                if (showGrid && gridToggle) gridToggle.classList.add('active');
                if (snapToGrid && snapToggle) snapToggle.classList.add('active');
                
                currentScreen = 0;
                updateScreenTabs();
                loadScreenData(0);
                updatePreview();
            } catch (error) {
                console.error('Error loading project:', error);
                alert('Error loading project file. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateScreenTabs();
    setTimeout(() => {
        updatePreview();
    }, CONSTANTS.LANGUAGE_SWITCH_DELAY);
});

function setupEventListeners() {
    // Text inputs
    ['overlayTitle', 'overlaySubtitle', 'overlayDescription'].forEach(id => {
        document.getElementById(id).addEventListener('input', function() {
            screens[currentScreen][id] = this.value;
            updatePreview();
        });
    });

    // Overlay style selection
    document.querySelectorAll('input[name="overlay"]').forEach(input => {
        input.addEventListener('change', function() {
            screens[currentScreen].overlayStyle = this.value;
            updatePreview();
        });
    });

    // Text position buttons
    document.querySelectorAll('.position-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.position-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            screens[currentScreen].textPosition = this.dataset.position;
            updatePreview();
        });
    });

    // Device selection
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentDevice = this.dataset.device;
            updatePreview();
        });
    });

    // Language selection
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentLang = this.dataset.lang;
            screens[currentScreen].language = currentLang;
            updatePreview();
        });
    });

    // Color inputs
    document.getElementById('primaryColor').addEventListener('input', function() {
        document.getElementById('primaryHex').value = this.value;
        updatePreview();
    });
    
    document.getElementById('primaryHex').addEventListener('input', function() {
        document.getElementById('primaryColor').value = this.value;
        updatePreview();
    });

    document.getElementById('secondaryColor').addEventListener('input', function() {
        document.getElementById('secondaryHex').value = this.value;
        updatePreview();
    });
    
    document.getElementById('secondaryHex').addEventListener('input', function() {
        document.getElementById('secondaryColor').value = this.value;
        updatePreview();
    });

    // Background color (check if exists first)
    const bgColorInput = document.getElementById('bgColor');
    const bgHexInput = document.getElementById('bgHex');
    
    if (bgColorInput) {
        bgColorInput.addEventListener('input', function() {
            if (bgHexInput) bgHexInput.value = this.value;
            screens[currentScreen].bgColor = this.value;
            updatePreview();
        });
    }

    if (bgHexInput) {
        bgHexInput.addEventListener('input', function() {
            if (bgColorInput) bgColorInput.value = this.value;
            screens[currentScreen].bgColor = this.value;
            updatePreview();
        });
    }
}
