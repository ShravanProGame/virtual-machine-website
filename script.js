// --- 1. Configuration & Storage ---
let defaultApps = JSON.parse(localStorage.getItem('userApps')) || [
    { name: "Browser", url: "https://skibidiboi333.zjhmz.cn/", icon: "fa-globe" },
    { name: "Bing", url: "https://www.bing.com/search?q=search", icon: "fa-search" },
    { name: "Soundboard", url: "https://soundboardly.com/", icon: "fa-music" },
    { name: "Chat", url: "https://canvas-x68p.onrender.com/", icon: "fa-comments" },
    { name: "Drawing", type: "drawing", icon: "fa-paint-brush" },
    { name: "Add App", action: "toggleAddApp", icon: "fa-plus" }
];

// --- 2. Startup (Auto Launch) ---
window.onload = function() {
    renderIcons();
    updateClock();
    
    // Auto-open the main browser on load
    openWindow(defaultApps[0]);
};

// --- 3. Rendering Apps ---
function renderIcons() {
    const grid = document.getElementById('app-grid');
    const taskbar = document.getElementById('taskbar-apps');
    
    grid.innerHTML = '';
    taskbar.innerHTML = '';

    defaultApps.forEach(app => {
        let iconHtml = app.icon.startsWith('fa') ? 
            `<i class="fa-solid ${app.icon}"></i>` : 
            `<img src="${app.icon}">`;
        
        // Desktop Icon
        let el = document.createElement('div');
        el.className = 'app-icon';
        el.innerHTML = `${iconHtml}<span>${app.name}</span>`;
        el.onclick = () => app.action ? window[app.action]() : openWindow(app);
        grid.appendChild(el);

        // Taskbar Icon (only if it's a real app)
        if (!app.action) {
            let tbEl = document.createElement('button');
            tbEl.innerHTML = iconHtml;
            tbEl.onclick = () => openWindow(app);
            taskbar.appendChild(tbEl);
        }
    });
}

// --- 4. Window System ---
let zIndex = 100;

function openWindow(app) {
    zIndex++;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.zIndex = zIndex;
    // Random offset so windows don't stack perfectly on top of each other
    win.style.top = (50 + (Math.random() * 50)) + 'px';
    win.style.left = (50 + (Math.random() * 50)) + 'px';

    let content = '';
    if (app.type === 'drawing') {
        content = `
            <div style="height:100%; display:flex; flex-direction:column;">
                <div style="background:#eee; padding:5px; border-bottom:1px solid #ccc;">
                    <button onclick="saveDrawing(this)">Download</button>
                    <button onclick="clearCanvas(this)">Clear</button>
                </div>
                <canvas class="draw-canvas" style="flex-grow:1; background:white; cursor:crosshair; width:100%; height:100%;"></canvas>
            </div>`;
    } else {
        content = `<iframe src="${app.url}"></iframe>`;
    }

    win.innerHTML = `
        <div class="title-bar" onmousedown="dragWindow(event, this.parentElement)">
            <div class="controls">
                <div class="circle red" onclick="this.closest('.window').remove()"></div>
                <div class="circle yellow" onclick="this.closest('.window').style.display='none'"></div>
                <div class="circle green" onclick="maximizeWindow(this)"></div>
            </div>
            <div class="window-title">${app.name}</div>
        </div>
        <div class="window-content">${content}</div>
    `;

    document.getElementById('windows-area').appendChild(win);
    win.addEventListener('mousedown', () => win.style.zIndex = ++zIndex);

    if (app.type === 'drawing') {
        setTimeout(() => initCanvas(win.querySelector('canvas')), 50);
    }
}

function maximizeWindow(btn) {
    const win = btn.closest('.window');
    if (win.style.width === '100vw') {
        win.style.width = '700px'; 
        win.style.height = '500px'; 
        win.style.top = '50px'; 
        win.style.left = '50px';
    } else {
        win.style.width = '100vw'; 
        win.style.height = 'calc(100vh - 45px)'; 
        win.style.top = '0'; 
        win.style.left = '0';
    }
}

// --- 5. Dragging Logic ---
function dragWindow(e, win) {
    if(e.target.classList.contains('circle')) return;
    
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

// --- 6. Settings & Cloaking ---
document.getElementById('start-btn').onclick = () => {
    document.getElementById('settings-menu').classList.toggle('visible');
};

window.cloak = function(type) {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);

    if (type === 'Google Drive') {
        document.title = "My Drive - Google Drive";
        link.href = "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png";
    } else if (type === 'Gmail') {
        document.title = "Inbox (1) - Gmail";
        link.href = "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico";
    } else if (type === 'Canvas') {
        document.title = "Dashboard";
        link.href = "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico";
    }
    // Hide menu after clicking
    document.getElementById('settings-menu').classList.remove('visible');
};

// --- 7. Custom App & Drawing ---
window.toggleAddApp = () => document.getElementById('add-app-modal').classList.toggle('hidden');

window.saveNewApp = function() {
    const name = document.getElementById('new-app-name').value;
    const url = document.getElementById('new-app-url').value;
    if(name && url) {
        defaultApps.push({ name: name, url: url, icon: "fa-globe" });
        localStorage.setItem('userApps', JSON.stringify(defaultApps));
        renderIcons();
        toggleAddApp();
    }
}

function initCanvas(canvas) {
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    let painting = false;

    canvas.onmousedown = (e) => { painting = true; draw(e); };
    canvas.onmouseup = () => { painting = false; ctx.beginPath(); };
    canvas.onmousemove = draw;

    function draw(e) {
        if (!painting) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
}

window.saveDrawing = function(btn) {
    const canvas = btn.parentElement.nextElementSibling;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
}

window.clearCanvas = function(btn) {
    const canvas = btn.parentElement.nextElementSibling;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateClock() {
    const el = document.getElementById('clock');
    if (el) el.innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setTimeout(updateClock, 1000);
}
