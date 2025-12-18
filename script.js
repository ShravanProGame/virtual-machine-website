/* --- APPS CONFIGURATION --- */
const apps = [
    {
        name: "Browser",
        iconImg: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg",
        type: "proxy",
        url: "https://www.google.com/search?igu=1" // Google "I'm Feeling Lucky" mode often works in iframes
    },
    {
        name: "Roblox",
        iconImg: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Roblox_Logo_2022.jpg", 
        type: "proxy",
        url: "https://now.gg/apps/roblox-corporation/5349/roblox.html" // Cloud Gaming link (better chance of working)
    },
    {
        name: "Terminal", // Python-ish
        icon: "fa-terminal",
        color: "#000",
        type: "internal",
        appName: "terminal"
    },
    {
        name: "Java", // JS Console
        icon: "fa-code",
        color: "#FE7C00",
        type: "internal",
        appName: "java"
    },
    {
        name: "Games",
        icon: "fa-gamepad",
        color: "#7E57C2",
        type: "proxy",
        url: "https://v6p9d9t4.ssl.hwcdn.net/html/1865529/index.html" // A generic game link example
    },
    {
        name: "Files",
        icon: "fa-folder",
        color: "#29B6F6",
        type: "internal",
        appName: "files"
    },
    {
        name: "Add App",
        icon: "fa-plus",
        color: "#66BB6A",
        type: "internal",
        appName: "creator"
    },
    {
        name: "Settings",
        icon: "fa-gear",
        color: "#78909C",
        type: "internal",
        appName: "settings"
    },
    {
        name: "About",
        icon: "fa-info-circle",
        color: "#333",
        type: "internal",
        appName: "about"
    }
];

// --- INIT ---
window.onload = function() {
    const savedWP = localStorage.getItem('vm_wallpaper');
    if(savedWP) document.getElementById('desktop').style.backgroundImage = `url('${savedWP}')`;
    
    // Load custom apps
    const userApps = JSON.parse(localStorage.getItem('vm_user_apps') || '[]');
    userApps.forEach(a => apps.push(a));

    renderDesktopIcons();
    renderDock();
    updateClock();

    // Boot Animation
    setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('boot-screen').style.display = 'none';
            document.getElementById('desktop').style.opacity = '1';
        }, 1000);
    }, 2000);
};

// --- GRID LAYOUT LOGIC (Fixes the "One Row" bug) ---
function renderDesktopIcons() {
    const area = document.getElementById('desktop-area') || createDesktopArea();
    area.innerHTML = '';

    const startX = 20;
    const startY = 50;
    const cellWidth = 100;
    const cellHeight = 110;
    const columns = Math.floor((window.innerHeight - 100) / cellHeight); // Calculate how many fit vertically

    apps.forEach((app, index) => {
        let el = document.createElement('div');
        el.className = 'app-icon';
        
        // Math to place them in columns wrapping to the right
        // If you want Rows: swap logic. This does "Top-Down, then Next Column" (Like Windows default is Top-Down)
        let col = Math.floor(index / columns);
        let row = index % columns;

        el.style.left = (startX + (col * cellWidth)) + 'px';
        el.style.top = (startY + (row * cellHeight)) + 'px';

        // Icon Rendering
        let iconHtml = app.iconImg 
            ? `<div class="icon-img" style="background-image: url('${app.iconImg}'); background-color:white;"></div>`
            : `<div class="icon-img" style="background-color: ${app.color}"><i class="fa-solid ${app.icon}"></i></div>`;

        el.innerHTML = `${iconHtml}<span class="icon-label">${app.name}</span>`;
        
        // Launch vs Drag
        let isDragging = false;
        el.onmousedown = (e) => { isDragging = false; dragElement(e, el, () => isDragging = true); };
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

// --- DOCK ---
function renderDock() {
    const dock = document.getElementById('dock');
    dock.innerHTML = '';
    // Only show first 6 apps in dock to keep it clean
    apps.slice(0, 6).forEach(app => {
        let el = document.createElement('div');
        el.className = 'dock-item';
        if(app.iconImg) {
            el.style.backgroundImage = `url('${app.iconImg}')`;
            el.style.backgroundColor = 'white';
        } else {
            el.style.backgroundColor = app.color;
            el.innerHTML = `<i class="fa-solid ${app.icon}"></i>`;
        }
        el.onclick = () => launchApp(app);
        dock.appendChild(el);
    });
}

// --- APP LAUNCHER ---
function launchApp(app) {
    let content = '';
    
    if (app.type === 'proxy') {
        content = `<iframe src="/proxy/${app.url}" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>`;
    } 
    else if (app.type === 'internal') {
        content = getInternalApp(app.appName);
    }

    createWindow(app.name, content, app.appName === 'settings' ? 400 : 800, app.appName === 'settings' ? 500 : 600);
}

// --- INTERNAL APPS ---
function getInternalApp(name) {
    if (name === 'terminal') return `<div class="terminal" id="term-out" style="background:black; color:#0f0; padding:10px; font-family:monospace; height:100%;">Welcome to PyTerm v1.0<br>> <input id="term-in" style="background:transparent; border:none; color:#0f0; outline:none;" onkeydown="runTerm(this)"></div>`;
    
    if (name === 'java') return `<div style="display:flex; flex-direction:column; height:100%;"><textarea id="js-code" style="flex:1; background:#282c34; color:#abb2bf; padding:10px; border:none;">console.log("Hello World");</textarea><button onclick="runJS()" style="padding:10px; background:#e06c75; color:white; border:none;">RUN CODE</button></div>`;

    if (name === 'creator') return `<div style="padding:20px; text-align:center;"><h3>Add Web App</h3><input id="new-name" placeholder="Name"><br><br><input id="new-url" placeholder="example.com"><br><br><button onclick="saveApp()">Create</button></div>`;
    
    if (name === 'settings') return `<div style="padding:20px;"><h3>Settings</h3><button onclick="localStorage.clear(); location.reload();" style="background:red; color:white; padding:10px; border:none; border-radius:5px; width:100%;">Reset OS</button></div>`;
    
    if (name === 'about') return `<div style="padding:50px; text-align:center;"><h1>WebTop OS</h1><p>Made by You</p></div>`;
    
    if (name === 'files') return `<div id="file-sys" style="padding:20px;"><h3>File Explorer</h3><input type="file" onchange="uploadFile(this)"><div id="file-list" style="margin-top:20px;"></div></div>`;
    
    return "App Error";
}

// --- APP LOGIC (Python/JS) ---
function runTerm(input) {
    if(event.key === 'Enter') {
        const val = input.value;
        const out = document.getElementById('term-out');
        out.innerHTML += val + '<br>';
        
        if(val === 'help') out.innerHTML += 'Commands: help, clear, hello<br>';
        else if(val === 'clear') out.innerHTML = '> ';
        else if(val === 'hello') out.innerHTML += 'Hello User!<br>';
        else out.innerHTML += 'Command not found<br>';
        
        input.value = '';
        out.innerHTML += '> ';
        // Re-append input to keep it at bottom logic could be added here
    }
}

function runJS() {
    const code = document.getElementById('js-code').value;
    try { eval(code); alert("Code Ran! Check Console (F12) if needed."); } 
    catch(e) { alert("Error: " + e.message); }
}

function saveApp() {
    const name = document.getElementById('new-name').value;
    const url = document.getElementById('new-url').value;
    if(name && url) {
        let newApp = { name: name, icon: "fa-globe", color: "#555", type: "proxy", url: url };
        let uApps = JSON.parse(localStorage.getItem('vm_user_apps') || '[]');
        uApps.push(newApp);
        localStorage.setItem('vm_user_apps', JSON.stringify(uApps));
        apps.push(newApp);
        renderDesktopIcons();
        alert("App Created!");
    }
}

// --- WINDOW SYSTEM ---
let zIndex = 100;
function createWindow(title, content, w=700, h=500) {
    zIndex++;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.width = w + 'px'; win.style.height = h + 'px';
    win.style.zIndex = zIndex;
    win.style.top = '50px'; win.style.left = '100px';

    win.innerHTML = `
        <div class="title-bar" onmousedown="dragElement(event, this.parentElement)">
            <div class="traffic-lights">
                <div class="light close" onclick="this.closest('.window').remove()"></div>
            </div>
            <div class="window-title">${title}</div>
        </div>
        <div class="window-content">${content}</div>
    `;
    document.getElementById('windows-area').appendChild(win);
    win.onmousedown = () => win.style.zIndex = ++zIndex;
}

// --- DRAGGING UTILS ---
function dragElement(e, elmnt, cb) {
    let pos1=0, pos2=0, pos3=e.clientX, pos4=e.clientY;
    document.onmouseup = closeDrag;
    document.onmousemove = elementDrag;

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        if(cb) cb();
    }
    function closeDrag() { document.onmouseup = null; document.onmousemove = null; }
}

function updateClock() {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    setTimeout(updateClock, 1000);
}
