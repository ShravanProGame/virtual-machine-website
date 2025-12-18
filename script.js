// VM 3.0 - Complete System
// Features: Persistent Savings, Proxy Browser, New Tab Mode, Boot Sequence

const state = {
    wallpaper: localStorage.getItem('vm_wallpaper') || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    isBooting: true
};

const apps = [
    {
        name: "Browser",
        icon: "🌐",
        type: "window", // Opens inside the VM
        url: "/proxy/https://duckduckgo.com" // Uses your new proxy!
    },
    {
        name: "Notepad",
        icon: "📝",
        type: "window",
        content: "<textarea style='width:100%; height:100%; border:none; outline:none; padding:10px; background: transparent; color: white;' placeholder='Start typing...'></textarea>"
    },
    {
        name: "Settings",
        icon: "⚙️",
        type: "window",
        content: `
            <div style="padding: 20px; color: white;">
                <h3>Display Settings</h3>
                <p>Paste an Image URL to change wallpaper:</p>
                <input type="text" id="wp-input" placeholder="https://..." style="width: 100%; padding: 5px; margin-bottom: 10px;">
                <button onclick="changeWallpaper()" style="padding: 5px 10px; cursor: pointer;">Apply & Save</button>
            </div>
        `
    },
    {
        name: "Math Game",
        icon: "➗",
        type: "link", // Launches in new tab
        url: "https://www.mathplayground.com/" 
    },
    {
        name: "AI Chat",
        icon: "🤖",
        type: "link", // Launches in new tab
        url: "https://chatgpt.com/" 
    }
];

// 1. Boot Sequence
window.onload = function() {
    const bootScreen = document.getElementById('boot-screen');
    const desktop = document.getElementById('desktop');
    
    // Apply saved wallpaper immediately
    document.body.style.backgroundImage = `url('${state.wallpaper}')`;

    setTimeout(() => {
        bootScreen.style.opacity = '0';
        setTimeout(() => {
            bootScreen.style.display = 'none';
            desktop.style.opacity = '1';
            renderDesktopIcons();
            renderDock();
        }, 1000);
    }, 2000); // 2 second boot time
};

// 2. Desktop Icons (New Feature!)
function renderDesktopIcons() {
    const grid = document.getElementById('app-grid');
    grid.innerHTML = '';
    
    apps.forEach((app, index) => {
        const icon = document.createElement('div');
        icon.className = 'app-icon';
        icon.innerHTML = `
            <div style="font-size: 30px;">${app.icon}</div>
            <span>${app.name}</span>
        `;
        icon.onclick = () => openApp(index);
        grid.appendChild(icon);
    });
}

// 3. Dock Icons
function renderDock() {
    const dock = document.getElementById('dock');
    dock.innerHTML = '';
    apps.forEach((app, index) => {
        const icon = document.createElement('div');
        icon.className = 'dock-icon';
        icon.innerText = app.icon;
        icon.onclick = () => openApp(index);
        dock.appendChild(icon);
    });
}

// 4. App Launcher
function openApp(index) {
    const app = apps[index];

    // If it's a "link" type (like Games), open in new tab
    if (app.type === 'link') {
        window.open(app.url, '_blank');
        return;
    }

    // Otherwise, open internal window
    createWindow(app);
}

function createWindow(app) {
    const win = document.createElement('div');
    win.className = 'window';
    win.style.left = '100px';
    win.style.top = '100px';
    
    // Header
    const header = document.createElement('div');
    header.className = 'window-header';
    header.innerHTML = `
        <span>${app.name}</span>
        <span class="close-btn" onclick="this.parentElement.parentElement.remove()">✕</span>
    `;
    
    // Content
    const content = document.createElement('div');
    content.className = 'window-content';
    
    if (app.url) {
        // If it's the Browser, use iframe with Proxy URL
        content.innerHTML = `<iframe src="${app.url}" style="width:100%; height:100%; border:none;"></iframe>`;
    } else if (app.content) {
        content.innerHTML = app.content;
    }

    win.appendChild(header);
    win.appendChild(content);
    document.getElementById('desktop').appendChild(win);
    
    makeDraggable(win);
}

// 5. Wallpaper Saver
window.changeWallpaper = function() {
    const url = document.getElementById('wp-input').value;
    if (url) {
        document.body.style.backgroundImage = `url('${url}')`;
        localStorage.setItem('vm_wallpaper', url); // Saves to memory
        alert("Wallpaper Saved!");
    }
};

// 6. Draggable Windows Logic
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.querySelector('.window-header').onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
