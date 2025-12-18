// --- 1. App Configuration ---
// Defines all apps in the system
const defaultApps = [
    { name: "Browser", url: "https://skibidiboi333.zjhmz.cn/", icon: "fa-compass", color: "#007AFF" },
    { name: "Chat", url: "https://canvas-x68p.onrender.com/", icon: "fa-message", color: "#34C759" },
    { name: "AI Chat", url: "https://chatbotchatapp.com/", icon: "fa-robot", color: "#AF52DE" },
    { name: "Math Game", url: "https://gn-math2-16737703.codehs.me/", icon: "fa-gamepad", color: "#FF9500" },
    { name: "Beech Proxy", url: "https://beech.watch/", icon: "fa-shield-cat", color: "#FF2D55" }, // Might be blocked by X-Frame
    { name: "JS Exec", type: "js-exec", icon: "fa-code", color: "#FFCC00" },
    { name: "Python", type: "python-exec", icon: "fa-brands fa-python", color: "#306998" },
    { name: "File Explorer", type: "files", icon: "fa-folder", color: "#007AFF" },
    { name: "Settings", type: "settings", icon: "fa-gear", color: "#8E8E93" },
    { name: "Theme Builder", type: "theme", icon: "fa-paintbrush", color: "#5856D6" },
    { name: "About", type: "about", icon: "fa-circle-info", color: "#000000" }
];

// --- 2. Initialization ---
window.onload = function() {
    renderDock();
    updateClock();
    loadFiles(); // Load saved files from local storage
    
    // Auto-open About on first visit
    if(!localStorage.getItem('vm-visited')) {
        openWindow(defaultApps.find(a => a.name === 'About'));
        localStorage.setItem('vm-visited', 'true');
    }
};

// --- 3. Rendering the Dock ---
function renderDock() {
    const dock = document.getElementById('dock');
    dock.innerHTML = '';

    defaultApps.forEach(app => {
        let el = document.createElement('div');
        el.className = 'dock-icon';
        el.style.background = app.color || '#333';
        el.innerHTML = `<i class="fa-solid ${app.icon}"></i><div class="tooltip">${app.name}</div>`;
        el.onclick = () => openWindow(app);
        dock.appendChild(el);
    });
}

// --- 4. Window Management System ---
let zIndex = 100;

function openWindow(app) {
    // 1. Check if window already exists (Simulate single instance)
    // Removed strict check to allow multiple browser windows if needed, but safe to keep simple.
    
    zIndex++;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.zIndex = zIndex;
    
    // Random Position
    const top = 50 + (Math.random() * 50);
    const left = 50 + (Math.random() * 100);
    win.style.top = top + 'px';
    win.style.left = left + 'px';

    // 2. Generate Content based on Type
    let content = '';
    
    if (app.type === 'js-exec') {
        content = `
            <div class="terminal-bg">
                <div style="flex-grow:1; font-size:14px; white-space:pre-wrap;" id="js-output">Welcome to JS Terminal v1.0\nType code and execute.</div>
                <div style="display:flex; border-top:1px solid #333; padding-top:5px;">
                    <span style="color:#0f0; margin-right:10px;">➜</span>
                    <input type="text" class="terminal-input" placeholder="alert('Hello')" onkeydown="if(event.key==='Enter') runJS(this)">
                </div>
            </div>`;
    } else if (app.type === 'python-exec') {
        // Embedding a lightweight python compiler
        content = `<iframe src="https://trinket.io/embed/python3/a5bd54189b" allowfullscreen></iframe>`;
    } else if (app.type === 'files') {
        content = `
            <div style="display:flex; flex-direction:column; height:100%;">
                <div style="padding:10px; background:#f0f0f0; border-bottom:1px solid #ccc;">
                    <button class="mac-btn" onclick="document.getElementById('file-upload').click()">+ Upload File</button>
                    <input type="file" id="file-upload" style="display:none" onchange="uploadFile(this)">
                </div>
                <div class="file-grid" id="file-grid"></div>
            </div>`;
        setTimeout(renderFiles, 100); // Render after DOM insertion
    } else if (app.type === 'settings') {
        content = `
            <div class="settings-panel">
                <div class="settings-group">
                    <label class="settings-label">Wallpaper URL</label>
                    <input type="text" id="wp-url" style="width:100%; padding:5px;" placeholder="https://...">
                    <button class="mac-btn" style="margin-top:10px;" onclick="changeWallpaper()">Apply</button>
                </div>
                <div class="settings-group">
                    <label class="settings-label">Panic Button</label>
                    <button class="mac-btn" onclick="window.location.href='https://google.com'">Emergency Exit</button>
                </div>
            </div>`;
    } else if (app.type === 'about') {
        content = `
            <div style="padding:40px; text-align:center;">
                <h1 style="margin:0;">VM 2.0</h1>
                <p style="color:#888;">Version 2.0 (Proxy Edition)</p>
                <hr style="margin:20px 0; border:0; border-top:1px solid #eee;">
                <p>VM is a proxy based game made for school.</p>
                <p><strong>Created by TikTok Pr0xy</strong></p>
                <p>Credits to Luminal OS for inspiration.</p>
                <br>
                <button class="mac-btn" onclick="this.closest('.window').remove()">Close</button>
            </div>`;
    } else if (app.type === 'theme') {
         content = `
            <div class="settings-panel">
                <h3>Theme Builder</h3>
                <p>Select a Dock Color:</p>
                <input type="color" onchange="document.querySelector('.dock').style.background = this.value">
            </div>`;
    } else {
        // Standard Web App
        content = `<iframe src="${app.url}"></iframe>`;
    }

    // 3. Build Window HTML
    win.innerHTML = `
        <div class="title-bar" onmousedown="dragWindow(event, this.parentElement)">
            <div class="traffic-lights">
                <div class="light close-btn" onclick="closeWindow(this)"></div>
                <div class="light min-btn" onclick="closeWindow(this)"></div>
                <div class="light max-btn" onclick="maximizeWindow(this)"></div>
            </div>
            <div class="window-title">${app.name}</div>
        </div>
        <div class="window-content">${content}</div>
    `;

    document.getElementById('windows-area').appendChild(win);
    win.addEventListener('mousedown', () => win.style.zIndex = ++zIndex);
}

// --- 5. Window Actions ---
function closeWindow(btn) {
    const win = btn.closest('.window');
    win.classList.add('closing');
    setTimeout(() => win.remove(), 200);
}

function maximizeWindow(btn) {
    const win = btn.closest('.window');
    if (win.style.width === '100vw') {
        win.style.width = '800px'; win.style.height = '550px'; 
        win.style.top = '50px'; win.style.left = '50px';
    } else {
        win.style.width = '100vw'; win.style.height = 'calc(100vh - 28px)'; 
        win.style.top = '28px'; win.style.left = '0';
    }
}

function dragWindow(e, win) {
    if(e.target.classList.contains('light')) return;
    let shiftX = e.clientX - win.getBoundingClientRect().left;
    let shiftY = e.clientY - win.getBoundingClientRect().top;
    
    function moveAt(pageX, pageY) {
        // Prevent dragging above top bar
        let newTop = pageY - shiftY;
        if(newTop < 28) newTop = 28;
        
        win.style.left = pageX - shiftX + 'px';
        win.style.top = newTop + 'px';
    }
    
    function onMouseMove(event) { moveAt(event.pageX, event.pageY); }
    document.addEventListener('mousemove', onMouseMove);
    document.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        document.onmouseup = null;
    };
}

// --- 6. JS Executor Logic ---
function runJS(input) {
    const code = input.value;
    const output = input.parentElement.previousElementSibling;
    
    try {
        output.innerHTML += `\n<span style="color:#fff;">➜ ${code}</span>`;
        // Safe-ish eval (Warning: Still allows anything, but it's a VM simulator so it's fine)
        let result = eval(code); 
        output.innerHTML += `\n<span style="color:#aaa;">< ${result}</span>`;
    } catch (e) {
        output.innerHTML += `\n<span style="color:red;">Error: ${e.message}</span>`;
    }
    input.value = '';
    output.scrollTop = output.scrollHeight;
}

// --- 7. File Explorer Logic (Simulated) ---
let myFiles = [];

function loadFiles() {
    const saved = localStorage.getItem('vm-files');
    if(saved) myFiles = JSON.parse(saved);
}

function uploadFile(input) {
    const file = input.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const fileObj = {
            name: file.name,
            type: file.type,
            data: e.target.result,
            date: new Date().toLocaleDateString()
        };
        myFiles.push(fileObj);
        localStorage.setItem('vm-files', JSON.stringify(myFiles));
        renderFiles();
    };
    reader.readAsDataURL(file);
}

function renderFiles() {
    const grid = document.getElementById('file-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    myFiles.forEach((file, index) => {
        let el = document.createElement('div');
        el.className = 'file-item';
        el.innerHTML = `
            <div class="file-icon"><i class="fa-solid fa-file-lines"></i></div>
            <div style="font-size:12px;">${file.name}</div>
        `;
        el.onclick = () => downloadFile(index);
        el.oncontextmenu = (e) => {
            e.preventDefault();
            if(confirm('Delete ' + file.name + '?')) {
                myFiles.splice(index, 1);
                localStorage.setItem('vm-files', JSON.stringify(myFiles));
                renderFiles();
            }
        };
        grid.appendChild(el);
    });
}

function downloadFile(index) {
    const file = myFiles[index];
    const a = document.createElement('a');
    a.href = file.data;
    a.download = file.name;
    a.click();
}

// --- 8. Spotlight Search ---
function openSearch() {
    const el = document.getElementById('search-overlay');
    if(el.style.display === 'flex') {
        el.style.display = 'none';
    } else {
        el.style.display = 'flex';
        document.getElementById('search-input').focus();
    }
}

function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';
    
    if(!query) return;

    const hits = defaultApps.filter(app => app.name.toLowerCase().includes(query));
    
    hits.forEach(app => {
        let div = document.createElement('div');
        div.className = 'search-result';
        div.innerHTML = `<i class="fa-solid ${app.icon}"></i> <span>${app.name}</span>`;
        div.onclick = () => {
            openWindow(app);
            document.getElementById('search-overlay').style.display = 'none';
        }
        resultsDiv.appendChild(div);
    });
}

// --- 9. System Utilities ---
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const day = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    document.getElementById('clock').innerText = `${day}  ${hours}:${minutes} ${ampm}`;
    setTimeout(updateClock, 1000);
}

function changeWallpaper() {
    const url = document.getElementById('wp-url').value;
    if(url) {
        document.getElementById('desktop-container').style.backgroundImage = `url('${url}')`;
    }
}
