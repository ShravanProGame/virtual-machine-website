// --- 1. App Configuration ---
// This list defines your default apps
const defaultApps = [
    { name: "Browser", url: "https://skibidiboi333.zjhmz.cn/", icon: "fa-globe" },
    { name: "Bing", url: "https://www.bing.com/search?q=search", icon: "fa-search" }, // Bing might block iframes
    { name: "Soundboard", url: "https://soundboardly.com/", icon: "fa-music" },
    { name: "Chat", url: "https://canvas-x68p.onrender.com/", icon: "fa-comments" },
    { name: "Drawing", type: "drawing", icon: "fa-paint-brush" },
    { name: "Add App", action: "toggleAddApp", icon: "fa-plus" }
];

// --- 2. Startup Logic ---
document.getElementById('launch-btn').addEventListener('click', () => {
    // Basic "in-place" launch. 
    // To do true "about:blank" cloaking requires opening a NEW window and writing HTML to it.
    // For Render deployment, usually sticking to the current tab is more stable, 
    // but here is how we simulate the full screen launch:
    document.getElementById('launcher-screen').style.display = 'none';
    document.getElementById('desktop-container').style.display = 'block';
    
    // Auto-open Browser and add to taskbar
    openWindow(defaultApps[0]);
    
    // Setup Desktop
    renderIcons();
    updateClock();
});

// --- 3. App Rendering ---
function renderIcons() {
    const grid = document.getElementById('app-grid');
    const taskbar = document.getElementById('taskbar-apps');
    grid.innerHTML = '';
    taskbar.innerHTML = '';

    defaultApps.forEach(app => {
        // Desktop Icon
        let iconHtml = app.icon.startsWith('fa') ? `<i class="fa-solid ${app.icon}"></i>` : `<img src="${app.icon}">`;
        
        let el = document.createElement('div');
        el.className = 'app-icon';
        el.innerHTML = `${iconHtml}<span>${app.name}</span>`;
        el.onclick = () => app.action ? window[app.action]() : openWindow(app);
        grid.appendChild(el);

        // Taskbar Icon (Only for main apps, not "Add App")
        if (!app.action) {
            let tbEl = document.createElement('button');
            tbEl.innerHTML = iconHtml;
            tbEl.onclick = () => openWindow(app);
            taskbar.appendChild(tbEl);
        }
    });
}

// --- 4. Window Management (The Mac-style buttons) ---
let zIndex = 100;

function openWindow(app) {
    zIndex++;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.zIndex = zIndex;
    win.style.top = (50 + (zIndex * 5)) + 'px'; // Cascade windows
    win.style.left = (50 + (zIndex * 5)) + 'px';

    // Content: Iframe or Drawing App
    let content = '';
    if (app.type === 'drawing') {
        content = `
            <div style="height:100%; display:flex; flex-direction:column;">
                <div style="background:#eee; padding:5px;">
                    <button onclick="saveDrawing(this)">Save/Download</button>
                    <button onclick="clearCanvas(this)">Clear</button>
                </div>
                <canvas class="draw-canvas" style="flex-grow:1; background:white; cursor:crosshair;"></canvas>
            </div>`;
    } else {
        content = `<iframe src="${app.url}"></iframe>`;
    }

    win.innerHTML = `
        <div class="title-bar" onmousedown="dragWindow(event, this.parentElement)">
            <div class="controls">
                <div class="circle red" onclick="this.closest('.window').remove()"></div>
                <div class="circle yellow" onclick="minimizeWindow(this)"></div>
                <div class="circle green" onclick="maximizeWindow(this)"></div>
            </div>
            <div class="window-title">${app.name}</div>
        </div>
        <div class="window-content">${content}</div>
    `;

    document.getElementById('windows-area').appendChild(win);
    win.addEventListener('mousedown', () => win.style.zIndex = ++zIndex); // Bring to front

    if (app.type === 'drawing') initCanvas(win.querySelector('canvas'));
}

function minimizeWindow(btn) {
    const win = btn.closest('.window');
    win.style.display = 'none'; 
    // In a real OS, clicking the taskbar would bring it back. 
    // For this simple version, just reopen the app.
}

function maximizeWindow(btn) {
    const win = btn.closest('.window');
    if (win.style.width === '100vw') {
        win.style.width = '600px'; win.style.height = '400px'; win.style.top = '50px'; win.style.left = '50px';
    } else {
        win.style.width = '100vw'; win.style.height = '94vh'; win.style.top = '0'; win.style.left = '0';
    }
}

// --- 5. Dragging Logic ---
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

// --- 6. Add Custom App Feature ---
window.toggleAddApp = function() {
    const modal = document.getElementById('add-app-modal');
    modal.classList.toggle('hidden');
}

window.saveNewApp = function() {
    const name = document.getElementById('new-app-name').value;
    const url = document.getElementById('new-app-url').value;
    if(name && url) {
        defaultApps.push({ name: name, url: url, icon: "fa-globe" });
        renderIcons();
        toggleAddApp();
    }
}

// --- 7. Settings & Cloaking ---
document.getElementById('start-btn').addEventListener('click', () => {
    const menu = document.getElementById('settings-menu');
    menu.classList.toggle('visible');
});

window.cloak = function(type) {
    if (type === 'Google Drive') {
        document.title = "My Drive - Google Drive";
        changeFavicon("https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png");
    } else if (type === 'Gmail') {
        document.title = "Inbox (1) - Gmail";
        changeFavicon("https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico");
    } else if (type === 'Canvas') {
        document.title = "Dashboard";
        changeFavicon("https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico");
    } else {
        document.title = "Launchpad";
    }
}

function changeFavicon(src) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = src;
}

// --- 8. Drawing App Logic ---
function initCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    let painting = false;

    function startPosition(e) { painting = true; draw(e); }
    function finishedPosition() { painting = false; ctx.beginPath(); }
    function draw(e) {
        if (!painting) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);
}

window.saveDrawing = function(btn) {
    const canvas = btn.parentElement.nextElementSibling;
    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
}

window.clearCanvas = function(btn) {
    const canvas = btn.parentElement.nextElementSibling;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setTimeout(updateClock, 1000);
}
