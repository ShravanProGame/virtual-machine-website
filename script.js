/* --- CONFIGURATION & APPS --- */
// Using real favicons for logos where possible
const apps = [
    {
        name: "DuckDuckGo",
        iconImg: "https://duckduckgo.com/favicon.ico", // Real Logo
        type: "proxy",
        url: "https://duckduckgo.com"
    },
    {
        name: "Bing",
        iconImg: "https://www.bing.com/favicon.ico", // Real Logo
        type: "proxy",
        url: "https://www.bing.com"
    },
    {
        name: "Roblox",
        iconImg: "https://images.rbxcdn.com/23421382939a9f4ae8bbe60dbe2a3e7e.ico.gzip", // Real Roblox Logo
        type: "proxy",
        url: "https://www.roblox.com"
    },
    {
        name: "Games",
        icon: "fa-gamepad", // FontAwesome fallback
        color: "#FF9500",
        type: "proxy",
        url: "https://gn-math2-16737703.codehs.me/"
    },
    {
        name: "Add Link",
        icon: "fa-plus",
        color: "#34C759",
        type: "internal",
        appName: "creator"
    },
    {
        name: "File Explorer",
        icon: "fa-folder-open",
        color: "#5AC8FA",
        type: "internal",
        appName: "files"
    },
    {
        name: "Settings",
        icon: "fa-gear",
        color: "#8E8E93",
        type: "internal",
        appName: "settings"
    },
    {
        name: "About",
        icon: "fa-circle-info",
        color: "#333333",
        type: "internal",
        appName: "about"
    }
];

// --- BOOT & INIT ---
window.onload = function() {
    const savedWP = localStorage.getItem('vm_wallpaper');
    if(savedWP) document.getElementById('desktop').style.backgroundImage = `url('${savedWP}')`;

    // Load user custom apps if any
    const userApps = JSON.parse(localStorage.getItem('vm_user_apps') || '[]');
    userApps.forEach(a => apps.push(a));

    renderDock();
    renderDesktopIcons();
    updateClock();

    // Boot Animation
    setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('boot-screen').style.display = 'none';
            document.getElementById('desktop').style.opacity = '1';
            
            // AUTO-OPEN CREDITS (As requested)
            setTimeout(() => launchApp(apps.find(a => a.name === "About")), 500);
        }, 1000);
    }, 2500);
};

// --- RENDERING ---
function renderDock() {
    const dock = document.getElementById('dock');
    dock.innerHTML = '';
    apps.forEach(app => {
        let el = document.createElement('div');
        el.className = 'dock-item';
        
        // Handle Real Image vs FontAwesome
        if(app.iconImg) {
            el.style.backgroundImage = `url('${app.iconImg}')`;
            el.style.backgroundColor = 'white'; // White bg for transparent pngs
        } else {
            el.style.backgroundColor = app.color;
            el.innerHTML = `<i class="fa-solid ${app.icon}"></i>`;
        }
        
        el.innerHTML += `<div class="dock-tooltip">${app.name}</div>`;
        el.onclick = () => launchApp(app);
        dock.appendChild(el);
    });
}

function renderDesktopIcons() {
    const area = document.getElementById('desktop-area') || createDesktopArea();
    area.innerHTML = '';
    
    // Initial Layout (Grid-like but absolute)
    let startX = 20;
    let startY = 40;
    let gapY = 100;

    apps.forEach((app, index) => {
        let el = document.createElement('div');
        el.className = 'app-icon';
        el.style.left = startX + 'px';
        el.style.top = (startY + (index * gapY)) + 'px'; // Left aligned, stacked vertically
        
        // Icon Look
        let iconContent = '';
        if(app.iconImg) {
            iconContent = `<div class="icon-img" style="background-image: url('${app.iconImg}'); background-color: white;"></div>`;
        } else {
            iconContent = `<div class="icon-img" style="background-color: ${app.color}"><i class="fa-solid ${app.icon}" style="color:white"></i></div>`;
        }
        
        el.innerHTML = `${iconContent}<span class="icon-label">${app.name}</span>`;
        
        // Click to launch, but distinguish from drag
        let isDragging = false;
        el.onmousedown = (e) => {
            isDragging = false;
            dragElement(e, el, () => { isDragging = true; });
        };
        el.onclick = () => { if(!isDragging) launchApp(app); };
        
        area.appendChild(el);
    });
}

function createDesktopArea() {
    let div = document.createElement('div');
    div.id = 'desktop-area';
    document.getElementById('desktop').insertBefore(div, document.getElementById('windows-area'));
    return div;
}

// --- LAUNCHER ---
function launchApp(app) {
    if (app.type === 'newtab') { window.open(app.url, '_blank'); return; }

    let content = '';
    if (app.type === 'proxy') content = `<iframe src="/proxy/${app.url}"></iframe>`;
    else if (app.type === 'internal') content = getInternalApp(app.appName);

    createWindow(app.name, content);
}

// --- INTERNAL APPS ---
function getInternalApp(name) {
    if (name === 'creator') {
        return `
            <div style="padding:20px; text-align:center;">
                <h3>Create Desktop App</h3>
                <input id="new-app-name" placeholder="App Name" style="padding:8px; width:80%; margin-bottom:10px;"><br>
                <input id="new-app-url" placeholder="https://..." style="padding:8px; width:80%; margin-bottom:10px;"><br>
                <button onclick="createCustomApp()" style="padding:8px 20px; background:#34C759; color:white; border:none; border-radius:5px;">Add App</button>
            </div>`;
    }
    if (name === 'files') {
        return `
            <div style="padding:10px; display:flex; flex-direction:column; height:100%;">
                <div style="border-bottom:1px solid #ccc; padding-bottom:5px;">
                    <button onclick="document.getElementById('f-up').click()">Upload</button>
                    <input type="file" id="f-up" hidden onchange="handleUpload(this)">
                </div>
                <div class="file-grid" id="file-area"></div>
                <script>setTimeout(renderFiles, 100)</script>
            </div>`;
    }
    if (name === 'about') {
        return `
            <div style="padding:40px; text-align:center;">
                <h1 style="margin-bottom:0;">VM Pro</h1>
                <p style="color:#888;">Version 2.0</p>
                <hr style="width:50px; margin:20px auto;">
                <h3>Made by TikTok Pr0xy</h3>
                <p>Designed for School</p>
            </div>`;
    }
    if (name === 'settings') {
        return `
            <div style="background:#fff; height:100%;">
                <div class="settings-header">Appearance</div>
                <ul class="settings-list">
                    <li class="settings-item">
                        <span>Wallpaper</span>
                        <span style="color:#888;">Default ></span>
                    </li>
                    <li class="settings-item">
                        <span>Dark Mode</span>
                        <span style="color:#34C759;">On</span>
                    </li>
                </ul>
                <div class="settings-header">System</div>
                <ul class="settings-list">
                    <li class="settings-item" onclick="resetVM()">
                        <span style="color:red;">Reset VM</span>
                    </li>
                </ul>
            </div>`;
    }
}

// --- APP CREATOR LOGIC ---
function createCustomApp() {
    const name = document.getElementById('new-app-name').value;
    const url = document.getElementById('new-app-url').value;
    if(!name || !url) return alert("Enter name and URL!");
    
    const newApp = { name: name, icon: "fa-globe", color: "#666", type: "proxy", url: url };
    apps.push(newApp);
    
    // Save to memory so it stays after refresh
    const currentUsers = JSON.parse(localStorage.getItem('vm_user_apps') || '[]');
    currentUsers.push(newApp);
    localStorage.setItem('vm_user_apps', JSON.stringify(currentUsers));
    
    renderDesktopIcons();
    renderDock();
    alert("App added!");
}

// --- WINDOWS ---
let zIndex = 100;
function createWindow(title, content) {
    zIndex++;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.zIndex = zIndex;
    win.style.top = '100px'; win.style.left = '200px';

    win.innerHTML = `
        <div class="title-bar" onmousedown="dragElement(event, this.parentElement)">
            <div class="traffic-lights">
                <div class="light close" onclick="this.closest('.window').remove()"></div>
                <div class="light min" onclick="this.closest('.window').style.display='none'"></div>
                <div class="light max" onclick="toggleMax(this.closest('.window'))"></div>
            </div>
            <div class="window-title">${title}</div>
        </div>
        <div class="window-content">${content}</div>
    `;

    document.getElementById('windows-area').appendChild(win);
    win.addEventListener('mousedown', () => win.style.zIndex = ++zIndex);
    if(title === 'File Explorer') setTimeout(renderFiles, 200);
}

// --- DRAG SYSTEM (Universal) ---
function dragElement(e, elmnt, onMoveCallback) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;

    function elementDrag(e) {
        e.preventDefault();
        // Calculate new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set element's new position
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        
        if(onMoveCallback) onMoveCallback(); // Notify that we dragged
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function toggleMax(win) {
    if(win.style.width === '100%') {
        win.style.width = '700px'; win.style.height = '500px'; win.style.top = '100px'; win.style.left = '200px';
    } else {
        win.style.width = '100%'; win.style.height = 'calc(100vh - 30px)'; win.style.top = '28px'; win.style.left = '0';
    }
}

// --- UTILS ---
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setTimeout(updateClock, 1000);
}

function resetVM() {
    if(confirm("Reset all settings and files?")) {
        localStorage.clear();
        location.reload();
    }
}

// File System
let myFiles = JSON.parse(localStorage.getItem('vm_files') || '[]');
function handleUpload(input) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = e => {
        myFiles.push({ name: file.name, data: e.target.result });
        localStorage.setItem('vm_files', JSON.stringify(myFiles));
        renderFiles();
    };
    reader.readAsDataURL(file);
}
function renderFiles() {
    const area = document.getElementById('file-area');
    if(!area) return;
    area.innerHTML = '';
    myFiles.forEach(f => {
        let div = document.createElement('div');
        div.className = 'file-card';
        // Add "Set Wallpaper" button for images
        let wpBtn = (f.name.endsWith('.jpg') || f.name.endsWith('.png')) 
            ? `<br><button style="font-size:10px; margin-top:5px;" onclick="setWP('${f.data}')">Set Wallpaper</button>` 
            : '';
        
        div.innerHTML = `<i class="fa-solid fa-file" style="font-size:30px;color:#007AFF"></i><br><span>${f.name}</span>${wpBtn}`;
        div.onclick = (e) => {
            if(e.target.tagName === 'BUTTON') return; // Don't download if clicking Set WP
            let a = document.createElement('a'); a.href = f.data; a.download = f.name; a.click();
        };
        area.appendChild(div);
    });
}
function setWP(data) {
    localStorage.setItem('vm_wallpaper', data);
    document.getElementById('desktop').style.backgroundImage = `url('${data}')`;
}
