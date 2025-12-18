/* --- CONFIGURATION & APPS --- */
const apps = [
    {
        name: "Browser",
        icon: "fa-compass",
        color: "#007AFF",
        type: "proxy",
        url: "https://en.wikipedia.org/wiki/Main_Page" // Changed to Wikipedia for better testing
    },
    {
        name: "AI Chat",
        icon: "fa-robot",
        color: "#AF52DE",
        type: "proxy",
        url: "https://chatbotchatapp.com/"
    },
    {
        name: "Math Game",
        icon: "fa-calculator",
        color: "#FF9500",
        type: "proxy",
        url: "https://gn-math2-16737703.codehs.me/"
    },
    {
        name: "Python",
        icon: "fa-brands fa-python",
        color: "#306998",
        type: "iframe",
        url: "https://trinket.io/embed/python3/a5bd54189b"
    },
    {
        name: "JS Exec",
        icon: "fa-brands fa-js",
        color: "#F7DF1E",
        type: "internal",
        appName: "js-exec"
    },
    {
        name: "Beech Watch",
        icon: "fa-shield-cat",
        color: "#FF2D55",
        type: "newtab", 
        url: "https://beech.watch/"
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

    renderDock();
    renderDesktopIcons();
    updateClock();

    setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('boot-screen').style.display = 'none';
            document.getElementById('desktop').style.opacity = '1';
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
        el.style.backgroundColor = app.color;
        el.innerHTML = `<i class="fa-solid ${app.icon}"></i><div class="dock-tooltip">${app.name}</div>`;
        el.onclick = () => launchApp(app);
        dock.appendChild(el);
    });
}

function renderDesktopIcons() {
    const grid = document.getElementById('desktop-grid');
    grid.innerHTML = '';
    apps.forEach(app => {
        let el = document.createElement('div');
        el.className = 'app-icon';
        el.innerHTML = `
            <div class="icon-img" style="color:${app.color}"><i class="fa-solid ${app.icon}"></i></div>
            <span class="icon-label">${app.name}</span>
        `;
        el.onclick = () => launchApp(app);
        grid.appendChild(el);
    });
}

// --- LAUNCHER LOGIC ---
function launchApp(app) {
    if (app.type === 'newtab') {
        window.open(app.url, '_blank');
        return;
    }

    let content = '';
    
    // TYPE: PROXY
    if (app.type === 'proxy') {
        content = `<iframe src="/proxy/${app.url}"></iframe>`;
    }
    // TYPE: IFRAME
    else if (app.type === 'iframe') {
        content = `<iframe src="${app.url}"></iframe>`;
    }
    // TYPE: INTERNAL
    else if (app.type === 'internal') {
        content = getInternalApp(app.appName);
    }

    createWindow(app.name, content);
}

// --- INTERNAL APP CONTENTS ---
function getInternalApp(name) {
    if (name === 'js-exec') {
        return `
            <div class="terminal">
                <div id="js-out">VM JS Console v1.0</div>
                <div style="margin-top:10px; display:flex;">
                    <span style="color:lime; margin-right:5px;">></span>
                    <input type="text" onkeydown="if(event.key==='Enter') runJS(this)">
                </div>
            </div>`;
    }
    if (name === 'files') {
        return `
            <div style="padding:10px; display:flex; flex-direction:column; height:100%;">
                <div style="border-bottom:1px solid #ccc; padding-bottom:5px;">
                    <button onclick="document.getElementById('f-up').click()">Upload File</button>
                    <input type="file" id="f-up" hidden onchange="handleUpload(this)">
                </div>
                <div class="file-grid" id="file-area"></div>
                <script>setTimeout(renderFiles, 100)</script>
            </div>`;
    }
    if (name === 'about') {
        return `
            <div style="padding:40px; text-align:center;">
                <h1>VM</h1>
                <p>VM is a proxy based game made for school.</p>
                <h3>Made by TikTok Pr0xy</h3>
                <p>Credits to Luminal OS for inspiration.</p>
            </div>`;
    }
    if (name === 'settings') {
        return `
            <div style="padding:20px;">
                <h3>Wallpaper Settings</h3>
                <input type="text" id="wp-in" placeholder="Image URL..." style="width:100%; padding:8px;">
                <button onclick="saveWP()" style="margin-top:10px;">Save Wallpaper</button>
            </div>`;
    }
}

// --- WINDOW MANAGEMENT ---
let zIndex = 100;
function createWindow(title, content) {
    zIndex++;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.zIndex = zIndex;
    win.style.top = (50 + Math.random() * 50) + 'px';
    win.style.left = (50 + Math.random() * 50) + 'px';

    win.innerHTML = `
        <div class="title-bar" onmousedown="dragStart(event, this.parentElement)">
            <div class="traffic-lights">
                <div class="light close" onclick="this.closest('.window').remove()"></div>
                <div class="light min"></div>
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

// --- DRAG LOGIC ---
function dragStart(e, win) {
    let shiftX = e.clientX - win.getBoundingClientRect().left;
    let shiftY = e.clientY - win.getBoundingClientRect().top;
    
    function moveAt(pageX, pageY) {
        win.style.left = pageX - shiftX + 'px';
        win.style.top = pageY - shiftY + 'px';
    }
    function onMouseMove(event) { moveAt(event.pageX, event.pageY); }
    
    document.addEventListener('mousemove', onMouseMove);
    document.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        document.onmouseup = null;
    };
}

function toggleMax(win) {
    if(win.style.width === '100%') {
        win.style.width = '700px'; win.style.height = '500px'; win.style.top = '50px'; win.style.left = '50px';
    } else {
        win.style.width = '100%'; win.style.height = 'calc(100vh - 40px)'; win.style.top = '28px'; win.style.left = '0';
    }
}

// --- UTILS & FILES ---
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const mins = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('clock').innerText = `${hours}:${mins} ${ampm}`;
    setTimeout(updateClock, 1000);
}

function saveWP() {
    const url = document.getElementById('wp-in').value;
    localStorage.setItem('vm_wallpaper', url);
    document.getElementById('desktop').style.backgroundImage = `url('${url}')`;
}

function runJS(input) {
    const out = document.getElementById('js-out');
    try {
        out.innerHTML += `<div style="color:white">> ${input.value}</div>`;
        const res = eval(input.value);
        out.innerHTML += `<div style="color:#aaa">< ${res}</div>`;
    } catch(e) {
        out.innerHTML += `<div style="color:red">Error: ${e.message}</div>`;
    }
    input.value = '';
}

// File System Simulation
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
        div.innerHTML = `<i class="fa-solid fa-file" style="font-size:30px;color:#007AFF"></i><br><span>${f.name}</span>`;
        div.onclick = () => {
            let a = document.createElement('a'); a.href = f.data; a.download = f.name; a.click();
        };
        area.appendChild(div);
    });
}
