const express = require('express');
const path = require('path');
const axios = require('axios'); 
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// --- ADVANCED PROXY HANDLER ---
app.get('/proxy/*', async (req, res) => {
    const targetUrl = req.params[0];
    
    // Quick validation
    if (!targetUrl) return res.status(400).send("No URL specified");
    if (!targetUrl.startsWith('http')) return res.status(400).send("URL must start with http or https");

    try {
        const response = await axios.get(targetUrl, {
            headers: { 
                // Pretend to be a real desktop computer to avoid mobile versions
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
            },
            // Get the raw data so we can modify it
            responseType: 'arraybuffer' 
        });

        // --- THE MAGIC FIX ---
        // 1. Copy the content type (so the browser knows if it's HTML or an image)
        const contentType = response.headers['content-type'];
        res.set('Content-Type', contentType);

        // 2. STRIP SECURITY HEADERS
        // This removes the "Do not put me in an iframe" protection
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('X-Content-Type-Options');

        // 3. HANDLE HTML CONTENT
        if (contentType && contentType.includes('text/html')) {
            // Convert buffer to string to edit HTML
            let html = response.data.toString('utf-8');
            
            // Inject <base> tag so images/css load from the real site, not localhost
            const baseUrl = new URL(targetUrl).origin;
            html = html.replace('<head>', `<head><base href="${targetUrl}">`);
            
            res.send(html);
        } else {
            // If it's an image or other file, just send it directly
            res.send(response.data);
        }

    } catch (error) {
        // If the site blocks us, show a friendly error
        console.error("Proxy Error:", error.message);
        res.status(500).send(`
            <body style="color:white; background:#111; font-family:sans-serif; text-align:center; display:flex; flex-direction:column; justify-content:center; height:100vh; margin:0;">
                <h2 style="color:#ff5f56">Website Blocked</h2>
                <p>The website <b>${targetUrl}</b> detected the proxy and blocked the connection.</p>
                <p style="color:#888; font-size:12px;">Error: ${error.message}</p>
            </body>
        `);
    }
});

// Home Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`WebOS running at http://localhost:${PORT}`);
});
