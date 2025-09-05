// Screen data storage with position data
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
            scale: 100,
            rotation: 0
        },
        layerOrder: 'front', // 'front' = screenshot on top, 'back' = text on top
        screenshotOpacity: 100,
        overlayOpacity: 90,
        bgColor: '#ffffff'
    }
];

let currentScreen = 0;
let currentDevice = 'iphone';
let currentLang = 'en';
let showGrid = false;
let snapToGrid = false;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let imageStart = { x: 0, y: 0 };

// Translations
const translations = {
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

// Global functions for inline handlers
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
    const scaleValue = document.getElementById('scaleValue');
    if (scaleValue) scaleValue.textContent = value + '%';
    updatePreview();
}

function updatePosition(axis, value) {
    if (!screens[currentScreen]) return;
    screens[currentScreen].imagePosition[axis] = value;
    const axisValue = document.getElementById(axis + 'Value');
    if (axisValue) axisValue.textContent = value + '%';
    updatePreview();
}

function updateRotation(value) {
    if (!screens[currentScreen]) return;
    screens[currentScreen].imagePosition.rotation = value;
    const rotateValue = document.getElementById('rotateValue');
    if (rotateValue) rotateValue.textContent = value + '°';
    updatePreview();
}

function handleScreenshotUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Check dimensions
                const validDimensions = [
                    {width: 1320, height: 2868}, // iPhone 6.9" Display
                    {width: 2868, height: 1320}, // iPhone 6.9" Display (landscape)
                    {width: 1290, height: 2796}, // iPhone 6.7" Display  
                    {width: 2796, height: 1290}, // iPhone 6.7" Display (landscape)
                    {width: 1179, height: 2556}, // iPhone 6.5" Display
                    {width: 2556, height: 1179}, // iPhone 6.5" Display (landscape)
                    {width: 1284, height: 2778}, // iPhone 6.1" Display
                    {width: 2778, height: 1284}  // iPhone 6.1" Display (landscape)
                ];
                
                const isValidDimension = validDimensions.some(dim => 
                    (img.width === dim.width && img.height === dim.height)
                );
                
                // Update dimension indicator
                const dimensionIndicator = document.getElementById('dimensionIndicator');
                if (dimensionIndicator) {
                    if (isValidDimension) {
                        dimensionIndicator.className = 'dimension-indicator valid';
                        dimensionIndicator.textContent = `✓ ${img.width}×${img.height}px - App Store Ready`;
                    } else {
                        dimensionIndicator.className = 'dimension-indicator invalid';
                        dimensionIndicator.textContent = `⚠ ${img.width}×${img.height}px - Invalid for App Store`;
                        alert(`Warning: Screenshot dimensions (${img.width}×${img.height}px) don't match App Store requirements.\n\nRequired dimensions:\n• 1320×2868px or 2868×1320px (6.9" display)\n• 1290×2796px or 2796×1290px (6.7" display)\n• 1284×2778px or 2778×1284px (6.1" display)\n• 1179×2556px or 2556×1179px (6.5" display)\n\nThe image will still be loaded but may not be accepted by App Store.`);
                    }
                }
                
                screens[currentScreen].screenshot = e.target.result;
                screens[currentScreen].originalDimensions = {
                    width: img.width,
                    height: img.height
                };
                screens[currentScreen].isValidDimension = isValidDimension;
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
    screens[currentScreen].imagePosition = { x: 0, y: 0, scale: 100, rotation: 0 };
    screens[currentScreen].layerOrder = 'front'; // Reset to default
    screens[currentScreen].screenshotOpacity = 100;
    screens[currentScreen].overlayOpacity = 90;
    document.getElementById('screenshotPreview').style.display = 'none';
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('uploadArea').classList.remove('has-image');
    document.getElementById('screenshotInput').value = '';
    
    // Clear dimension indicator
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
    screens[currentScreen].imagePosition = { x: 0, y: 0, scale: 100, rotation: 0 };
    resetControls();
    updatePreview();
}

function fillFrame() {
    if (!screens[currentScreen]) return;
    screens[currentScreen].imagePosition = { x: 0, y: 0, scale: 120, rotation: 0 };
    const scaleControl = document.getElementById('scaleControl');
    const scaleValue = document.getElementById('scaleValue');
    if (scaleControl) scaleControl.value = 120;
    if (scaleValue) scaleValue.textContent = '120%';
    resetControls();
    updatePreview();
}

function resetPosition() {
    if (!screens[currentScreen]) return;
    screens[currentScreen].imagePosition = { x: 0, y: 0, scale: 100, rotation: 0 };
    resetControls();
    updatePreview();
}

function centerImage() {
    if (!screens[currentScreen]) return;
    screens[currentScreen].imagePosition.x = 0;
    screens[currentScreen].imagePosition.y = 0;
    const xControl = document.getElementById('xControl');
    const yControl = document.getElementById('yControl');
    const xValue = document.getElementById('xValue');
    const yValue = document.getElementById('yValue');
    if (xControl) xControl.value = 0;
    if (yControl) yControl.value = 0;
    if (xValue) xValue.textContent = '0%';
    if (yValue) yValue.textContent = '0%';
    updatePreview();
}

function toggleGrid() {
    showGrid = !showGrid;
    const gridToggle = document.getElementById('gridToggle');
    if (gridToggle) gridToggle.classList.toggle('active');
    updatePreview();
}

function toggleSnap() {
    snapToGrid = !snapToGrid;
    const snapToggle = document.getElementById('snapToggle');
    if (snapToggle) snapToggle.classList.toggle('active');
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
        const element = document.getElementById(id);
        if (element) element.value = value;
    }
    
    const values = {
        scaleValue: screen.imagePosition.scale + '%',
        xValue: screen.imagePosition.x + '%',
        yValue: screen.imagePosition.y + '%',
        rotateValue: screen.imagePosition.rotation + '°'
    };
    
    for (const [id, text] of Object.entries(values)) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
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
        imagePosition: { x: 0, y: 0, scale: 100, rotation: 0 },
        layerOrder: 'front',
        screenshotOpacity: 100,
        overlayOpacity: 90,
        bgColor: '#ffffff'
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
            const deltaX = (e.clientX - startPos.x) / 3;
            const deltaY = (e.clientY - startPos.y) / 3;
            
            let newX = startImagePos.x + deltaX;
            let newY = startImagePos.y + deltaY;
            
            if (snapToGrid) {
                newX = Math.round(newX / 10) * 10;
                newY = Math.round(newY / 10) * 10;
            }
            
            screens[screenIndex].imagePosition.x = Math.max(-50, Math.min(50, newX));
            screens[screenIndex].imagePosition.y = Math.max(-50, Math.min(50, newY));
            
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
            const deltaX = (e.touches[0].clientX - startPos.x) / 3;
            const deltaY = (e.touches[0].clientY - startPos.y) / 3;
            
            let newX = startImagePos.x + deltaX;
            let newY = startImagePos.y + deltaY;
            
            if (snapToGrid) {
                newX = Math.round(newX / 10) * 10;
                newY = Math.round(newY / 10) * 10;
            }
            
            screens[screenIndex].imagePosition.x = Math.max(-50, Math.min(50, newX));
            screens[screenIndex].imagePosition.y = Math.max(-50, Math.min(50, newY));
            
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
    const primaryColor = primaryColorEl ? primaryColorEl.value : '#667eea';
    const secondaryColor = secondaryColorEl ? secondaryColorEl.value : '#764ba2';
    
    // Ensure we have default values
    const bgColorValue = screen.bgColor || '#ffffff';
    const screenshotOpacityValue = (screen.screenshotOpacity !== undefined ? screen.screenshotOpacity : 100) / 100;
    const overlayOpacityValue = (screen.overlayOpacity !== undefined ? screen.overlayOpacity : 90) / 100;
    const layerOrderValue = screen.layerOrder || 'front';
    
    if (!screen.screenshot) {
        return `
            <div class="screenshot-container" style="background: ${bgColorValue}; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center; color: #999;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📱</div>
                    <div>No screenshot uploaded</div>
                </div>
            </div>
        `;
    }
    
    const pos = screen.imagePosition || { x: 0, y: 0, scale: 100, rotation: 0 };
    const imgStyle = `
        transform: translate(${pos.x}%, ${pos.y}%) scale(${pos.scale / 100}) rotate(${pos.rotation}deg);
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

async function exportCurrentScreen() {
    const screen = screens[currentScreen];
    if (!screen.originalDimensions) {
        alert('Please upload a screenshot first');
        return;
    }
    
    // Create a temporary container with exact App Store dimensions
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = screen.originalDimensions.width + 'px';
    tempContainer.style.height = screen.originalDimensions.height + 'px';
    document.body.appendChild(tempContainer);
    
    // Clone the current screen content at original dimensions
    const frames = document.querySelectorAll('.phone-frame');
    if (frames[currentScreen]) {
        const clonedFrame = frames[currentScreen].cloneNode(true);
        // Set to original screenshot dimensions
        clonedFrame.style.width = screen.originalDimensions.width + 'px';
        clonedFrame.style.height = screen.originalDimensions.height + 'px';
        tempContainer.appendChild(clonedFrame);
        
        const canvas = await html2canvas(clonedFrame, {
            width: screen.originalDimensions.width,
            height: screen.originalDimensions.height,
            scale: 1,
            backgroundColor: null,
            useCORS: true,
            allowTaint: true
        });
        
        // Clean up
        document.body.removeChild(tempContainer);
        
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `appstore-${screen.originalDimensions.width}x${screen.originalDimensions.height}-screen-${currentScreen + 1}-${currentLang}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
}

async function exportAllScreens() {
    for (let i = 0; i < screens.length; i++) {
        const frames = document.querySelectorAll('.phone-frame');
        const canvas = await html2canvas(frames[i], {
            scale: 2,
            backgroundColor: null,
            useCORS: true,
            allowTaint: true
        });
        
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentDevice}-screen-${i + 1}-${currentLang}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

async function exportForAllLanguages() {
    const languages = document.querySelectorAll('.lang-btn');
    alert(`This will export ${screens.length} screens × ${languages.length} languages = ${screens.length * languages.length} files.`);
    
    for (let langBtn of languages) {
        langBtn.click();
        await new Promise(resolve => setTimeout(resolve, 100));
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
                    screenshotOpacity: screen.screenshotOpacity !== undefined ? screen.screenshotOpacity : 100,
                    overlayOpacity: screen.overlayOpacity !== undefined ? screen.overlayOpacity : 90,
                    bgColor: screen.bgColor || '#ffffff'
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
    // Delay initial preview to ensure all elements are loaded
    setTimeout(() => {
        updatePreview();
    }, 100);
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

    document.getElementById('secondaryColor').addEventListener('input', function() {
        document.getElementById('secondaryHex').value = this.value;
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