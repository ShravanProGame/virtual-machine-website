// --- 1. App Configuration & Persistence ---
let defaultApps = JSON.parse(localStorage.getItem('userApps')) || [
    { name: "Browser", url: "https://skibidiboi333.zjhmz.cn/", icon: "fa-globe" },
    { name: "Bing", url: "https://www.bing.com/search?q=search", icon: "fa-search" },
    { name: "Soundboard", url: "https://soundboardly.com/", icon: "fa-music" },
    { name: "Chat", url: "https://canvas-x68p.onrender.com/", icon: "fa-comments" },
    { name: "Drawing", type: "drawing", icon: "fa-paint-brush" },
    { name: "Add App", action: "toggleAddApp", icon: "fa-plus" }
];

// --- 2. Startup Logic ---
document.getElementById('launch-btn').addEventListener('click', () => {
    // About:Blank Cloak
    const win = window.open('about:blank', '_blank');
    const doc = win.document;
    
    // We clone the current page into the new about:blank tab
    doc.write(document.documentElement.innerHTML);
    doc.close();

    // Redirect the original tab to something "safe"
    window.location.replace("https://www.google.com");
});

// Logic to check if we are currently inside the "cloaked" state
window.onload = () => {
    if (window.location.href.includes("onrender.com")) {
        // We are on the landing page, show the launch button
        document.getElementById('launcher-screen').style.display = 'flex';
        document.getElementById('desktop-container').style.display = 'none';
    } else {
        // We are in the cloaked tab, show the desktop
        document.getElementById('launcher-screen').style.display = 'none';
        document.getElementById('desktop-container').style.display = 'block';
        renderIcons();
        updateClock();
        openWindow(defaultApps[0]); // Auto-open browser
    }
};

// --- 3. App Rendering ---
function renderIcons() {
    const grid = document.getElementById('app-grid');
    const taskbar = document.getElementById('taskbar-apps');
    grid.innerHTML = '';
    taskbar.innerHTML = '';

    defaultApps.forEach(app => {
        let iconHtml = `<i class="fa-solid ${app.icon}"></i>`;
        
        let el = document.createElement('div');
        el.className = 'app-icon';
        el.innerHTML = `${iconHtml}<span>${app.name}</span>`;
        el.onclick = () => app.action ? window[app.action]() : openWindow(app);
        grid.appendChild(el);

        if (!app.action) {
            let tbEl = document.createElement('button');
            tbEl.innerHTML = iconHtml;
            tbEl.onclick = () => openWindow(app);
            taskbar.appendChild(tbEl);
        }
    });
}

// --- 4. Window Management (Apple Style Controls) ---
let zIndex = 100;
function openWindow(app) {
    zIndex++;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.zIndex = zIndex;
    win.style.top = (50 + (zIndex % 20 * 5)) + 'px';
    win.style.left = (50 + (zIndex % 20 * 5)) + 'px';

    let content = app.type === 'drawing' ? 
        `<div style="height:100%; display:flex; flex-direction:column;">
            <div style="background:#eee; padding:5px;">
                <button onclick="saveDrawing(this)">Save</button>
                <button onclick="clearCanvas(this)">Clear</button>
            </div>
            <canvas class="draw-canvas" style="flex-grow:1; background:white; cursor:crosshair;"></canvas>
        </div>` : `<iframe src="${app.url}"></iframe>`;

    win.innerHTML = `
        <div class="title-bar" onmousedown="dragWindow(event, this.parentElement)">
            <div class="controls">
                <div class="circle red" onclick="this.closest('.window').remove()"></div>
                <div class="circle yellow" onclick="this.closest('.window').style.display='none'"></div>
                <div class="circle green" onclick="maximizeWindow(this)"></div>
            </div>
            <div class="window-title">${app.name}</div>
        </div>
        <div class="window-content">${content}</div>`;

    document.getElementById('windows-area').appendChild(win);
    win.addEventListener('mousedown', () => win.style.zIndex = ++zIndex);
    if (app.type === 'drawing') initCanvas(win.querySelector('canvas'));
}

function maximizeWindow(btn) {
    const win = btn.closest('.window');
    win.style.width = win.style.width === '100vw' ? '600px' : '100vw';
    win.style.height = win.style.height === '94vh' ? '400px' : '94vh';
    win.style.top = win.style.top === '0px' ? '50px' : '0px';
    win.style.left = win.style.left === '0px' ? '50px' : '0px';
}

// --- 5. Dragging ---
function dragWindow(e, win) {
    if (e.target.className === 'circle') return;
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
    };
}

// --- 6. Custom Apps ---
window.toggleAddApp = () => document.getElementById('add-app-modal').classList.toggle('hidden');
window.saveNewApp = () => {
    const name = document.getElementById('new-app-name').value;
    const url = document.getElementById('new-app-url').value;
    if(name && url) {
        defaultApps.push({ name, url, icon: "fa-globe" });
        localStorage.setItem('userApps', JSON.stringify(defaultApps));
        renderIcons();
        toggleAddApp();
    }
};

// --- 7. Settings & Cloaking ---
document.getElementById('start-btn').onclick = () => document.getElementById('settings-menu').classList.toggle('visible');

window.cloak = (type) => {
    const data = {
        'Google Drive': ['My Drive - Google Drive', 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png'],
        'Gmail': ['Inbox (1) - Gmail', 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico'],
        'Canvas': ['Dashboard', 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico']
    };
    if (data[type]) {
        document.title = data[type][0];
        changeFavicon(data[type][1]);
    }
};

function changeFavicon(src) {
    let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon'; link.href = src;
    document.getElementsByTagName('head')[0].appendChild(link);
}

// --- 8. Drawing & Clock ---
function initCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    let painting = false;
    canvas.onmousedown = () => painting = true;
    canvas.onmouseup = () => { painting = false; ctx.beginPath(); };
    canvas.onmousemove = (e) => {
        if (!painting) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };
}

function updateClock() {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setTimeout(updateClock, 1000);
}
