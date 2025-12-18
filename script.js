// --- CONFIGURATION ---
const apps = [
    { id: 'browser', name: 'Browser', icon: '🌍', type: 'browser', url: 'https://www.bing.com', color: '#3498db' },
    { id: 'games', name: 'Games', icon: '🎮', type: 'iframe', url: 'https://poki.com', color: '#e74c3c' },
    { id: 'movies', name: 'Movies', icon: '🍿', type: 'iframe', url: 'https://www.youtube.com/embed/videoseries?list=PLU8wpH_Lfhmsy3Qo5fVf4e7rJ_I_r7_P_', color: '#9b59b6' },
    { id: 'chat', name: 'ChatGPT', icon: '🤖', type: 'iframe', url: 'https://chatgpt.com', color: '#10a37f' },
    { id: 'soundboard', name: 'Soundboard', icon: '🔊', type: 'iframe', url: 'https://soundboardly.com/', color: '#f1c40f' },
    { id: 'notepad', name: 'Notepad', icon: '📝', type: 'notepad', color: '#f39c12' },
    { id: 'files', name: 'Files', icon: '📁', type: 'files', color: '#34495e' },
    { id: 'settings', name: 'Settings', icon: '⚙️', type: 'settings', color: '#7f8c8d' }
];

let highestZ = 100;

// --- BOOT & INIT ---
window.onload = () => {
    // Handle Boot Screen
    const boot = document.getElementById('boot-screen');
    setTimeout(() => {
        boot.style.opacity = '0';
        setTimeout(() => boot.remove(), 1000);
    }, 2500);

    renderIcons();
    renderDock();
    updateClock();
    setInterval(updateClock, 1000);
};

// --- RENDER FUNCTIONS ---
function renderIcons() {
    const container = document.getElementById('icon-container');
    let startX = 20;
    let startY = 50;

    apps.forEach((app) => {
        const el = document.createElement('div');
        el.className = 'app-icon';
        // Set initial positions but leave them absolute for dragging
        el.style.left = startX + 'px';
        el.style.top = startY + 'px';
        el.innerHTML = `
            <div class="app-img" style="color: ${app.color}">${app.icon}</div>
            <div class="app-name">${app.name}</div>
        `;
        
        // Double Click to open
        el.ondblclick = () => openApp(app);
        
        // Make draggable
        makeDraggable(el, true);
        
        container.appendChild(el);
        
        // Simple grid calculation for startup
        startY += 100;
        if (startY > window.innerHeight - 150) {
            startY = 50;
            startX += 90;
        }
    });
}

function renderDock() {
    const dock = document.getElementById('dock');
    apps.forEach(app => {
        const el = document.createElement('div');
        el.className = 'dock-icon';
        el.id = `dock-${app.id}`;
        el.innerHTML = `${app.icon}<div class="dock-dot"></div>`;
        el.onclick = () => openApp(app);
        dock.appendChild(el);
    });
}

// --- APP LOGIC ---
function openApp(app) {
    document.querySelector(`#dock-${app.id}`).classList.add('open');

    const win = document.createElement('div');
    win.className = 'window';
    win.style.left = '100px';
    win.style.top = '50px';
    win.style.width = '600px';
    win.style.height = '400px';
    win.style.zIndex = ++highestZ;
    
    win.onmousedown = () => win.style.zIndex = ++highestZ;

    // Window Header
    const header = document.createElement('div');
    header.className = 'title-bar';
    header.innerHTML = `
        <div class="window-controls">
            <div class="control close"></div>
            <div class="control minimize"></div>
            <div class="control maximize"></div>
        </div>
        <div style="flex:1; text-align:center; font-size:12px; color:#555;">${app.name}</div>
    `;
    
    // Header Controls
    header.querySelector('.close').onclick = () => {
        win.remove();
        document.querySelector(`#dock-${app.id}`).classList.remove('open');
    };
    
    let isMaxed = false;
    header.querySelector('.maximize').onclick = () => {
        if(!isMaxed) {
            win.style.top = '30px'; win.style.left = '0'; win.style.width = '100%'; win.style.height = 'calc(100% - 80px)';
            isMaxed = true;
        } else {
            win.style.top = '50px'; win.style.left = '100px'; win.style.width = '600px'; win.style.height = '400px';
            isMaxed = false;
        }
    };

    // Window Content
    const content = document.createElement('div');
    content.className = 'window-content';

    if (app.type === 'browser') {
        content.innerHTML = `
            <div class="browser-bar">
                <button onclick="document.getElementById('if-${app.id}').src = document.getElementById('url-${app.id}').value">Go</button>
                <input id="url-${app.id}" type="text" value="${app.url}" placeholder="URL">
            </div>
            <iframe id="if-${app.id}" src="${app.url}"></iframe>
        `;
    } else if (app.type === 'iframe') {
        content.innerHTML = `<iframe src="${app.url}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else if (app.type === 'notepad') {
        const savedNote = localStorage.getItem('webos-note') || '';
        content.innerHTML = `
            <div class="notepad-toolbar"><button class="btn" id="save-btn-${app.id}">Save</button></div>
            <textarea class="notepad-area" id="note-${app.id}">${savedNote}</textarea>
        `;
        setTimeout(() => {
            document.getElementById(`save-btn-${app.id}`).onclick = () => {
                const text = document.getElementById(`note-${app.id}`).value;
                localStorage.setItem('webos-note', text);
                alert('Saved!');
            };
        }, 100);
    } else if (app.type === 'files') {
        const savedNote = localStorage.getItem('webos-note');
        if (savedNote) {
            content.innerHTML = `
                <div class="file-grid">
                    <div class="file-item" id="file-open-note">
                        <div class="file-icon">📄</div>
                        <div class="file-name">notes.txt</div>
                    </div>
                </div>
            `;
            setTimeout(() => {
                document.getElementById('file-open-note').onclick = () => openApp(apps.find(a=>a.id==='notepad'));
            }, 100);
        } else {
            content.innerHTML = `<div style="padding:20px; text-align:center;">Empty Disk</div>`;
        }
    } else if (app.type === 'settings') {
        content.innerHTML = `
            <div class="settings-layout">
                <div class="settings-sidebar">
                    <div class="settings-item active">General</div>
                    <div class="settings-item">Display</div>
                </div>
                <div class="settings-main">
                    <h3>Settings</h3>
                    <div class="setting-row"><span>Dark Mode</span><input type="checkbox" checked></div>
                </div>
            </div>
        `;
    }

    win.appendChild(header);
    win.appendChild(content);
    document.getElementById('windows-area').appendChild(win);
    makeDraggable(win, false);
}

// --- DRAG UTILS ---
function makeDraggable(elmnt, isIcon) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const dragHandle = isIcon ? elmnt : elmnt.querySelector('.title-bar');
    
    dragHandle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
