// --- CONFIGURATION ---
const apps = [
    { name: "Browser", icon: "🌐", type: "proxy", url: "https://duckduckgo.com" },
    { name: "Games", icon: "🎮", type: "newtab", url: "https://poki.com" },
    { name: "Math", icon: "➗", type: "newtab", url: "https://www.mathplayground.com/" },
    { name: "AI Chat", icon: "🤖", type: "newtab", url: "https://chatgpt.com/" },
    { name: "Notepad", icon: "📝", type: "internal", content: "<textarea style='width:100%;height:100%;border:none;padding:10px;' placeholder='Write here...'></textarea>" },
    { name: "Settings", icon: "⚙️", type: "internal", content: `
        <div style="padding:20px;">
            <h3>Wallpaper</h3>
            <input type="text" id="wp-url" placeholder="Image URL..." style="width:100%; padding:5px;">
            <br><br>
            <button onclick="saveWallpaper()">Save Wallpaper</button>
        </div>` 
    }
];

// --- BOOT SEQUENCE ---
window.onload = function() {
    // 1. Load Saved Wallpaper
    const savedBg = localStorage.getItem('vm_wallpaper');
    if(savedBg) document.getElementById('desktop').style.backgroundImage = `url('${savedBg}')`;

    // 2. Render Apps (Grid & Dock)
    renderApps();
    startTime();

    // 3. Play Boot Animation
    setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('boot-screen').style.display = 'none';
            document.getElementById('desktop').style.opacity = '1';
        }, 1000);
    }, 2000);
};

// --- RENDERING ---
function renderApps() {
    const grid = document.getElementById('app-grid');
    const dock = document.getElementById('dock');
    
    grid.innerHTML = '';
    dock.innerHTML = '';

    apps.forEach((app, index) => {
        // Create Desktop Icon
        let icon = document.createElement('div');
        icon.className = 'app-icon';
        icon.innerHTML = `<div class="app-icon-img">${app.icon}</div><span>${app.name}</span>`;
        icon.onclick = () => openApp(app);
        grid.appendChild(icon);

        // Create Dock Icon
        let dockIcon = document.createElement('div');
        dockIcon.className = 'dock-icon';
        dockIcon.innerText = app.icon;
        dockIcon.onclick = () => openApp(app);
        dock.appendChild(dockIcon);
    });
}

// --- OPENING APPS ---
function openApp(app) {
    if (app.type === 'newtab') {
        window.open(app.url, '_blank');
    } 
    else if (app.type === 'proxy') {
        createWindow(app.name, `<iframe src="/proxy/${app.url}" style="width:100%;height:100%;border:none;"></iframe>`);
    }
    else if (app.type === 'internal') {
        createWindow(app.name, app.content);
    }
}

// --- WINDOW SYSTEM ---
let zIndex = 100;
function createWindow(title, content) {
    zIndex++;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.zIndex = zIndex;
    win.style.top = '50px';
    win.style.left = '50px';

    win.innerHTML = `
        <div class="window-header" onmousedown="dragWindow(event, this.parentElement)">
            <span>${title}</span>
            <span class="close-btn" onclick="this.closest('.window').remove()">✕</span>
        </div>
        <div style="flex-grow:1; position:relative;">${content}</div>
    `;

    document.getElementById('windows-area').appendChild(win);
    win.onmousedown = () => win.style.zIndex = ++zIndex;
}

// --- DRAGGING ---
function dragWindow(e, win) {
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

// --- UTILS ---
window.saveWallpaper = function() {
    const url = document.getElementById('wp-url').value;
    if(url) {
        localStorage.setItem('vm_wallpaper', url);
        document.getElementById('desktop').style.backgroundImage = `url('${url}')`;
    }
}

function startTime() {
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; h = h ? h : 12;
    m = m < 10 ? '0'+m : m;
    document.getElementById('clock').innerHTML = h + ":" + m + " " + ampm;
    setTimeout(startTime, 1000);
}
