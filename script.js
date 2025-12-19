/* --- CONFIGURATION --- */
const apps = [
    {
        name: "Browser",
        icon: "fa-globe",
        color: "#29B6F6",
        type: "iframe", // Direct iframe for external proxy
        url: "https://skibidiboi333.zjhmz.cn/"
    },
    {
        name: "Games",
        icon: "fa-gamepad",
        color: "#7E57C2",
        type: "iframe",
        url: "https://gn-math2-16737703.codehs.me/"
    },
    {
        name: "YouTube",
        icon: "fa-brands fa-youtube",
        color: "#FF0000",
        type: "iframe",
        // Using the skibidi proxy to load YouTube safely
        url: "https://skibidiboi333.zjhmz.cn/service/hvtrs8%2F-wuw%2Cymuvu%60e%2Ccmm-"
    },
    {
        name: "FN Tracker",
        icon: "fa-crosshairs",
        color: "#FDD835", 
        type: "proxy", // Use OUR proxy for this standard site
        url: "https://fortnitetracker.com/"
    },
    {
        name: "Add App",
        icon: "fa-plus",
        color: "#4CAF50",
        type: "internal",
        appName: "creator"
    },
    {
        name: "Files",
        icon: "fa-folder",
        color: "#FFA726",
        type: "internal",
        appName: "files"
    },
    {
        name: "Settings",
        icon: "fa-gear",
        color: "#546E7A",
        type: "internal",
        appName: "settings"
    },
    {
        name: "About",
        icon: "fa-info",
        color: "#333",
        type: "internal",
        appName: "about"
    }
];

// --- INIT ---
window.onload = function() {
    const savedWP = localStorage.getItem('vm_wallpaper');
    if(savedWP) document.getElementById('desktop').style.backgroundImage = `url('${savedWP}')`;
    
    // Load User Apps
    const userApps = JSON.parse(localStorage.getItem('vm_user_apps') || '[]');
    userApps.forEach(a => apps.push(a));

    renderDesktop();
    renderDock();
    updateClock();

    // Fade In
    setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('boot-screen').style.display = 'none';
        }, 1000);
    }, 1500);
};

// --- DESKTOP RENDER (Double Click Logic) ---
function renderDesktop() {
    const area = document.getElementById('desktop-area');
    area.innerHTML = '';
    
    // Grid Logic
    const startX = 20; const startY = 20;
    const cellH = 100; const maxRows = Math.floor((window.innerHeight - 80) / cellH);

    apps.forEach((app, index) => {
        const col = Math.floor(index / maxRows);
        const row = index % maxRows;

        const el = document.createElement('div');
        el.className = 'app-icon';
        el.style.left = (startX + (col * 100)) + 'px';
        el.style.top = (startY + (row * cellH)) + 'px';

        let iconHtml = app.iconImg 
            ? `<div class="icon-img" style="background-image: url('${app.iconImg}'); background-color: white;"></div>`
            : `<div class="icon-img" style="background-color: ${app.color}"><i class="fa-solid ${app.icon}"></i></div>`;

        el.innerHTML = `${iconHtml}<span class="icon-label">${app.name}</span>`;
        
        // DRAG LOGIC
        let isDragging = false;
        el.onmousedown = (e) => { isDragging = false; dragElement(e, el, () => isDragging = true); };
        
        // DOUBLE CLICK TO OPEN
        el.ondblclick = () => { if(!isDragging) launchApp(app); };

        area.appendChild(el);
    });
}

function renderDock() {
    const dock = document.getElementById('dock-icons');
    dock.innerHTML = '';
    apps.slice(0, 6).forEach(app => {
        const el = document.createElement('div');
        el.className = 'dock-item';
        el.innerHTML = `<i class="fa-solid ${app.icon}" style="color:${app.color}"></i>`;
        // Dock is SINGLE click
        el.onclick = () => launchApp(app);
        dock.appendChild(el);
    });
}

// --- APP LAUNCHER ---
function launchApp(app) {
    let content = '';
    if (app.type === 'iframe') content = `<iframe src="${app.url}"></iframe>`;
    else if (app.type === 'proxy') content = `<iframe src="/proxy/${app.url}"></iframe>`;
    else if (app.type === 'internal') content = getInternalApp(app.appName);

    createWindow(app.name, content);
}

function getInternalApp(name) {
    if(name === 'creator') return `<div class="p-20 center"><h3>Add App</h3><input id="n" placeholder="Name"><br><br><input id="u" placeholder="URL"><br><br><button onclick="saveApp()">Add</button></div>`;
    if(name === 'settings') return `<div class="p-20"><h3>Settings</h3><p>Theme: Dark (Locked)</p><button onclick="localStorage.clear();location.reload()" style="background:red;color:white;border:none;padding:10px;">Reset OS</button></div>`;
    if(name === 'about') return `<div class="p-20 center"><h1>WebOS Luminal</h1><p>Created by TikTok Pr0xy</p></div>`;
    if(name === 'files') return `<div class="p-20"><h3>Files</h3><input type="file" onchange="uploadFile(this)"></div>`;
    return 'Error';
}

function saveApp() {
    const n = document.getElementById('n').value;
    const u = document.getElementById('u').value;
    if(n && u) {
        const a = {name:n, icon:"fa-globe", color:"#555", type:"proxy", url:u};
        apps.push(a);
        localStorage.setItem('vm_user_apps', JSON.stringify([...JSON.parse(localStorage.getItem('vm_user_apps')||'[]'), a]));
        renderDesktop();
        alert("App Added!");
    }
}

// --- WINDOWS ---
let z = 100;
function createWindow(title, content) {
    z++;
    const id = 'win-' + Date.now();
    const win = document.createElement('div');
    win.className = 'window pop-in';
    win.id = id;
    win.style.zIndex = z;
    win.style.top = '100px'; win.style.left = '200px';
    
    // Right-side controls
    win.innerHTML = `
        <div class="title-bar" onmousedown="dragElement(event, this.parentElement)">
            <div class="win-title">${title}</div>
            <div class="controls">
                <div class="btn min" onclick="toggleWin('${id}')"></div>
                <div class="btn max" onclick="maxWin('${id}')"></div>
                <div class="btn close" onclick="closeWin('${id}')"></div>
            </div>
        </div>
        <div class="content">${content}</div>
    `;
    document.getElementById('desktop').appendChild(win);
    win.onmousedown = () => win.style.zIndex = ++z;
}

function closeWin(id) {
    const win = document.getElementById(id);
    win.classList.remove('pop-in');
    win.classList.add('pop-out');
    setTimeout(() => win.remove(), 200);
}

function maxWin(id) {
    const win = document.getElementById(id);
    if(win.style.width === '100%') {
        win.style.width = '800px'; win.style.height = '600px'; win.style.top='100px'; win.style.left='200px';
    } else {
        win.style.width = '100%'; win.style.height = 'calc(100vh - 45px)'; win.style.top='0'; win.style.left='0';
    }
}

function toggleWin(id) {
    const win = document.getElementById(id);
    win.style.display = 'none'; // Simple hide for now
}

// --- UTILS ---
function dragElement(e, el, cb) {
    let pos3=e.clientX, pos4=e.clientY;
    document.onmouseup = () => { document.onmouseup=null; document.onmousemove=null; };
    document.onmousemove = (ev) => {
        ev.preventDefault();
        el.style.top = (el.offsetTop - (pos4 - ev.clientY)) + "px";
        el.style.left = (el.offsetLeft - (pos3 - ev.clientX)) + "px";
        pos3 = ev.clientX; pos4 = ev.clientY;
        if(cb) cb();
    };
}

function uploadFile(input) {
    const reader = new FileReader();
    reader.onload = e => {
        localStorage.setItem('vm_wallpaper', e.target.result);
        document.getElementById('desktop').style.backgroundImage = `url('${e.target.result}')`;
    };
    reader.readAsDataURL(input.files[0]);
}

function updateClock() {
    const d = new Date();
    document.getElementById('task-clock').innerText = d.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
    setTimeout(updateClock, 1000);
}
