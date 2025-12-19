/* --- CONFIGURATION --- */
const apps = [
    {
        name: "Google", // Changed to Google as it's often more stable in proxies
        iconImg: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png",
        type: "proxy",
        url: "https://www.google.com/search?igu=1"
    },
    {
        name: "Bing",
        iconImg: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Bing_Fluent_Logo.svg",
        type: "proxy",
        url: "https://www.bing.com"
    },
    {
        name: "DuckDuckGo",
        iconImg: "https://upload.wikimedia.org/wikipedia/commons/d/d2/DuckDuckGo_Logo.svg",
        type: "proxy",
        url: "https://duckduckgo.com"
    },
    {
        name: "Games",
        icon: "fa-gamepad",
        color: "#9C27B0", // Purple
        type: "proxy",
        url: "https://v6p9d9t4.ssl.hwcdn.net/html/1865529/index.html"
    },
    {
        name: "Terminal", // Python
        icon: "fa-terminal",
        color: "#212121",
        type: "internal",
        appName: "terminal"
    },
    {
        name: "Java Code",
        icon: "fa-code",
        color: "#F57F17", // Orange
        type: "internal",
        appName: "java"
    },
    {
        name: "Add Link",
        icon: "fa-plus",
        color: "#4CAF50", // Green
        type: "internal",
        appName: "creator"
    },
    {
        name: "File Explorer",
        icon: "fa-folder-open",
        color: "#03A9F4", // Blue
        type: "internal",
        appName: "files"
    },
    {
        name: "Settings",
        icon: "fa-gear",
        color: "#607D8B", // Grey
        type: "internal",
        appName: "settings"
    },
    {
        name: "About",
        icon: "fa-circle-info",
        color: "#333",
        type: "internal",
        appName: "about"
    }
];

// --- INIT ---
window.onload = function() {
    // Load Wallpaper
    const savedWP = localStorage.getItem('vm_wallpaper');
    if(savedWP) document.getElementById('desktop').style.backgroundImage = `url('${savedWP}')`;

    // Load User Apps
    const userApps = JSON.parse(localStorage.getItem('vm_user_apps') || '[]');
    userApps.forEach(a => apps.push(a));

    renderDesktop();
    renderDock();
    updateClock();

    // Boot Sequence
    setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('boot-screen').style.display = 'none';
            document.getElementById('desktop').style.opacity = '1';
        }, 1000);
    }, 1500);
};

// --- GRID SYSTEM (Left Aligned, Top-to-Bottom) ---
function renderDesktop() {
    const area = document.getElementById('desktop-area');
    area.innerHTML = '';
    
    // Grid Math
    const startX = 20;
    const startY = 60;
    const cellW = 90;
    const cellH = 110;
    const maxRows = Math.floor((window.innerHeight - 100) / cellH);

    apps.forEach((app, index) => {
        // Calculate Column and Row
        const col = Math.floor(index / maxRows);
        const row = index % maxRows;

        const el = document.createElement('div');
        el.className = 'app-icon';
        el.style.left = (startX + (col * cellW)) + 'px';
        el.style.top = (startY + (row * cellH)) + 'px';

        // Render Icon (Image or FontAwesome)
        let iconHtml = '';
        if(app.iconImg) {
            iconHtml = `<div class="icon-img" style="background-image: url('${app.iconImg}'); background-color: white;"></div>`;
        } else {
            iconHtml = `<div class="icon-img" style="background-color: ${app.color}"><i class="fa-solid ${app.icon}"></i></div>`;
        }

        el.innerHTML = `${iconHtml}<span class="icon-label">${app.name}</span>`;
        
        // Drag Handling
        let isDragging = false;
        el.onmousedown = (e) => { 
            isDragging = false; 
            dragElement(e, el, () => isDragging = true); 
        };
        el.onclick = () => { if(!isDragging) launchApp(app); };

        area.appendChild(el);
    });
}

function renderDock() {
    const dock = document.getElementById('dock');
    dock.innerHTML = '';
    // Show first 7 apps
    apps.slice(0, 7).forEach(app => {
        const el = document.createElement('div');
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
        // Clean URL to ensure it works
        const cleanUrl = app.url.startsWith('http') ? app.url : 'https://' + app.url;
        content = `<iframe src="/proxy/${cleanUrl}" style="background:white;"></iframe>`;
    } 
    else if (app.type === 'internal') {
        content = getInternalApp(app.appName);
    }

    createWindow(app.name, content);
}

// --- INTERNAL APPS ---
function getInternalApp(name) {
    if(name === 'terminal') return `<div style="background:black; color:#0f0; height:100%; padding:10px; font-family:monospace;">Welcome to PyTerm<br>> <input style="background:transparent; border:none; color:#0f0; outline:none;" onkeydown="if(event.key=='Enter') this.parentElement.innerHTML += '<br>> ' + this.value + '<br>Command not found<br>> '"></div>`;
    
    if(name === 'java') return `<div style="display:flex; flex-direction:column; height:100%;"><textarea id="js-code" style="flex:1; background:#282c34; color:#abb2bf; padding:10px; border:none;">alert("Hello");</textarea><button onclick="try{eval(document.getElementById('js-code').value)}catch(e){alert(e)}" style="padding:10px; background:#e06c75; color:white; border:none;">RUN</button></div>`;
    
    if(name === 'creator') return `<div style="padding:20px; text-align:center;"><h3>Add App</h3><input id="new-name" placeholder="Name" style="padding:5px;"><br><br><input id="new-url" placeholder="URL" style="padding:5px;"><br><br><button onclick="addApp()" style="padding:8px 20px; background:green; color:white; border:none;">ADD</button></div>`;
    
    if(name === 'settings') return `<div style="padding:20px;"><h3>Settings</h3><button onclick="localStorage.clear(); location.reload()" style="background:red; color:white; padding:10px; border:none; width:100%;">RESET EVERYTHING</button></div>`;
    
    if(name === 'files') return `<div style="padding:20px;"><h3>Files</h3><input type="file" onchange="const r=new FileReader();r.onload=e=>{let d=document.createElement('div');d.innerHTML=this.files[0].name;document.getElementById('flist').appendChild(d)};r.readAsDataURL(this.files[0])"><div id="flist" style="margin-top:20px;"></div></div>`;
    
    return `<div style="padding:20px;">App Error</div>`;
}

function addApp() {
    const n = document.getElementById('new-name').value;
    const u = document.getElementById('new-url').value;
    if(n && u) {
        const newApp = { name: n, icon: "fa-globe", color: "#555", type: "proxy", url: u };
        apps.push(newApp);
        let store = JSON.parse(localStorage.getItem('vm_user_apps') || '[]');
        store.push(newApp);
        localStorage.setItem('vm_user_apps', JSON.stringify(store));
        renderDesktop();
        renderDock();
        alert("App Added!");
    }
}

// --- WINDOWS ---
let zIdx = 100;
function createWindow(title, content) {
    zIdx++;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.zIndex = zIdx;
    win.style.top = '100px'; win.style.left = '150px';
    win.innerHTML = `
        <div class="title-bar" onmousedown="dragElement(event, this.parentElement)">
            <div class="traffic-lights">
                <div class="light close" onclick="this.closest('.window').remove()"></div>
                <div class="light min" onclick="this.closest('.window').style.display='none'"></div>
                <div class="light max" onclick="toggleMax(this.closest('.window'))"></div>
            </div>
            <div class="win-title">${title}</div>
        </div>
        <div class="win-content">${content}</div>
    `;
    document.getElementById('windows-area').appendChild(win);
    win.onmousedown = () => win.style.zIndex = ++zIdx;
}

function toggleMax(win) {
    if(win.style.width==='100%') {
        win.style.width='700px'; win.style.height='500px'; win.style.top='100px'; win.style.left='150px';
    } else {
        win.style.width='100%'; win.style.height='calc(100vh - 30px)'; win.style.top='30px'; win.style.left='0';
    }
}

function dragElement(e, el, cb) {
    let pos3=e.clientX, pos4=e.clientY;
    document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
    document.onmousemove = (ev) => {
        ev.preventDefault();
        let x = pos3 - ev.clientX;
        let y = pos4 - ev.clientY;
        pos3 = ev.clientX;
        pos4 = ev.clientY;
        el.style.top = (el.offsetTop - y) + "px";
        el.style.left = (el.offsetLeft - x) + "px";
        if(cb) cb();
    };
}

function updateClock() {
    const d = new Date();
    document.getElementById('clock').innerText = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    setTimeout(updateClock, 1000);
}
