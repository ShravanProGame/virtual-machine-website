// --- 1. App Configuration ---
// Note: We use 'let' so we can update it if the user adds apps
let defaultApps = JSON.parse(localStorage.getItem('userApps')) || [
    { name: "Browser", url: "https://skibidiboi333.zjhmz.cn/", icon: "fa-globe" },
    { name: "Bing", url: "https://www.bing.com/search?q=search", icon: "fa-search" },
    { name: "Soundboard", url: "https://soundboardly.com/", icon: "fa-music" },
    { name: "Chat", url: "https://canvas-x68p.onrender.com/", icon: "fa-comments" },
    { name: "Drawing", type: "drawing", icon: "fa-paint-brush" },
    { name: "Add App", action: "toggleAddApp", icon: "fa-plus" }
];

// --- 2. THE FIX: Smart Launch Logic ---
document.getElementById('launch-btn').addEventListener('click', () => {
    // 1. Get the base URL (e.g., https://your-app.onrender.com/)
    const baseUrl = window.location.origin + '/';

    // 2. Open the blank tab
    const win = window.open('about:blank', '_blank');
    if (!win) return alert("Pop-up blocked! Allow pop-ups for this site.");

    // 3. Construct the HTML for the new tab
    // We MUST add the <base> tag so the new tab can find script.js and style.css
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <base href="${baseUrl}"> ${document.head.innerHTML}
        </head>
        <body>
            ${document.body.innerHTML}
            <script>
                // Force the desktop to show immediately in the new tab
                document.getElementById('launcher-screen').style.display = 'none';
                document.getElementById('desktop-container').style.display = 'block';
            </script>
        </body>
        </html>
    `;

    // 4. Write the content and close the stream
    win.document.write(htmlContent);
    win.document.close();

    // 5. Redirect the original tab (Panic/Cloak)
    window.location.replace("https://google.com");
});

// --- 3. Startup Check ---
// This runs when the page loads. 
window.onload = () => {
    // If we are in the original tab (not about:blank), show the launcher
    // If we are in about:blank, the inline script above handles the switch, 
    // but we need to initialize the listeners.
    
    if (window.location.href !== "about:blank") {
        document.getElementById('launcher-screen').style.display = 'flex';
        document.getElementById('desktop-container').style.display = 'none';
    } else {
        // If for some reason we are here, ensure desktop is visible
        document.getElementById('launcher-screen').style.display = 'none';
        document.getElementById('desktop-container').style.display = 'block';
    }

    // Initialize the desktop
    renderIcons();
    updateClock();
    
    // Re-attach event listeners because document.write wipes them
    document.getElementById('launch-btn').addEventListener('click', () => { /* Prevent recursion */ });
    
    // Setup Taskbar & Menu Listeners
    document.getElementById('start-btn').onclick = () => {
        document.getElementById('settings-menu').classList.toggle('visible');
    };
};

// --- 4. App Rendering ---
function renderIcons() {
    const grid = document.getElementById('app-grid');
    const taskbar = document.getElementById('taskbar-apps');
    
    // Safety check in case HTML didn't load right
    if (!grid || !taskbar) return;

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
        // We use string function calls for onclick to survive document.write transfer better
        el.onclick = () => app.action ? window[app.action]() : openWindow(app);
        grid.appendChild(el);

        // Taskbar Icon
        if (!app.action) {
            let tbEl = document.createElement('button');
            tbEl.innerHTML = iconHtml;
            tbEl.onclick = () => openWindow(app);
            taskbar.appendChild(tbEl);
        }
    });
}

// --- 5. Window Management ---
let zIndex = 100;

function openWindow(app) {
    zIndex++;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.zIndex = zIndex;
    win.style.top = (50 + (zIndex % 10 * 15)) + 'px';
    win.style.left = (50 + (zIndex % 10 * 15)) + 'px';

    let content = '';
    if (app.type === 'drawing') {
        content = `
            <div style="height:100%; display:flex; flex-direction:column;">
                <div style="background:#eee; padding:5px; display:flex; gap:5px;">
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
        // slight delay to let the DOM render
        setTimeout(() => initCanvas(win.querySelector('canvas')), 50);
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

// --- 6. Dragging Logic ---
function dragWindow(e, win) {
    if(e.target.classList.contains('circle') || e.target.classList.contains('controls')) return;
    
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

// --- 7. Custom Apps ---
window.toggleAddApp = function() {
    document.getElementById('add-app-modal').classList.toggle('hidden');
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

// --- 8. Settings & Cloaking ---
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

// --- 9. Drawing Functions ---
function initCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    // Ensure canvas matches container size
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    
    let painting = false;

    canvas.onmousedown = (e) => { painting = true; draw(e); };
    canvas.onmouseup = () => { painting = false; ctx.beginPath(); };
    canvas.onmousemove = draw;

    function draw(e) {
        if (!painting) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 5; 
        ctx.lineCap = 'round';
        ctx.strokeStyle = "black";
        
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
    const now = new Date();
    const el = document.getElementById('clock');
    if(el) el.innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setTimeout(updateClock, 1000);
}
