// --- 1. Configuration ---
let defaultApps = JSON.parse(localStorage.getItem('userApps')) || [
    { name: "Browser", url: "https://skibidiboi333.zjhmz.cn/", icon: "fa-globe" },
    { name: "Bing", url: "https://www.bing.com/search?q=search", icon: "fa-search" }, 
    { name: "Soundboard", url: "https://soundboardly.com/", icon: "fa-music" },
    { name: "Chat", url: "https://canvas-x68p.onrender.com/", icon: "fa-comments" },
    { name: "Drawing", type: "drawing", icon: "fa-paint-brush" },
    { name: "Add App", action: "toggleAddApp", icon: "fa-plus" }
];

// --- 2. The Bulletproof Launch Logic ---
const launchBtn = document.getElementById('launch-btn');

if (launchBtn) {
    launchBtn.addEventListener('click', async () => {
        // A. Fetch the raw text of the CSS and JS files
        // This ensures we don't rely on broken links in the new tab
        const cssContent = await fetch('style.css').then(res => res.text());
        const jsContent = await fetch('script.js').then(res => res.text());
        const htmlBody = document.body.innerHTML;

        // B. Open the blank tab
        const win = window.open('about:blank', '_blank');
        if (!win) return alert("Please allow popups!");

        // C. Construct the new page entirely from text
        // We set a flag 'window.IS_CLOAKED = true' so the script knows it's inside the cloak
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Google Drive</title>
                <link rel="icon" href="https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                <style>${cssContent}</style>
            </head>
            <body>
                ${htmlBody}
                <script>
                    window.IS_CLOAKED = true;
                    ${jsContent}
                </script>
            </body>
            </html>
        `);
        
        win.document.close();

        // D. Redirect original tab to Google
        window.location.replace("https://google.com");
    });
}

// --- 3. Startup Logic (Runs automatically) ---
// This checks if we are inside the cloaked window or the normal one
if (window.IS_CLOAKED) {
    // We are inside the cloaked tab: Show Desktop immediately
    document.getElementById('launcher-screen').style.display = 'none';
    document.getElementById('desktop-container').style.display = 'block';
    
    // Initialize everything
    renderIcons();
    updateClock();
    openWindow(defaultApps[0]); // Auto-open browser
} else {
    // We are on the main site: Show Launcher
    if(document.getElementById('launcher-screen')) {
        document.getElementById('launcher-screen').style.display = 'flex';
        document.getElementById('desktop-container').style.display = 'none';
    }
}

// --- 4. Core Desktop Functions ---
function renderIcons() {
    const grid = document.getElementById('app-grid');
    const taskbar = document.getElementById('taskbar-apps');
    if(!grid) return;
    
    grid.innerHTML = '';
    taskbar.innerHTML = '';

    defaultApps.forEach(app => {
        let iconHtml = app.icon.startsWith('fa') ? `<i class="fa-solid ${app.icon}"></i>` : `<img src="${app.icon}">`;
        
        let el = document.createElement('div');
        el.className = 'app-icon';
        el.innerHTML = `${iconHtml}<span>${app.name}</span>`;
        // Use a safe onclick handler
        el.onclick = function() {
            if (app.action === 'toggleAddApp') toggleAddApp();
            else openWindow(app);
        };
        grid.appendChild(el);

        if (!app.action) {
            let tbEl = document.createElement('button');
            tbEl.innerHTML = iconHtml;
            tbEl.onclick = function() { openWindow(app); };
            taskbar.appendChild(tbEl);
        }
    });
}

// --- 5. Window System ---
let zIndex = 100;

function openWindow(app) {
    zIndex++;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.zIndex = zIndex;
    win.style.top = (50 + (zIndex % 10 * 20)) + 'px';
    win.style.left = (50 + (zIndex % 10 * 20)) + 'px';

    let content = '';
    if (app.type === 'drawing') {
        content = `
            <div style="height:100%; display:flex; flex-direction:column;">
                <div style="background:#eee; padding:5px;">
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
        setTimeout(() => initCanvas(win.querySelector('canvas')), 100);
    }
}

function maximizeWindow(btn) {
    const win = btn.closest('.window');
    if (win.style.width === '100vw') {
        win.style.width = '600px'; win.style.height = '400px'; 
        win.style.top = '50px'; win.style.left = '50px';
    } else {
        win.style.width = '100vw'; win.style.height = 'calc(100vh - 45px)'; 
        win.style.top = '0'; win.style.left = '0';
    }
}

// --- 6. Helpers (Drag, Clock, Settings) ---
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

function updateClock() {
    const el = document.getElementById('clock');
    if (el) el.innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setTimeout(updateClock, 1000);
}

// Settings Toggle
const startBtn = document.getElementById('start-btn');
if(startBtn) {
    startBtn.onclick = () => {
        const menu = document.getElementById('settings-menu');
        if(menu) menu.classList.toggle('visible');
    };
}

// Cloak Function
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

// Add App Modal
window.toggleAddApp = function() {
    const modal = document.getElementById('add-app-modal');
    if(modal) modal.classList.toggle('hidden');
}

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

// Drawing Logic
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
