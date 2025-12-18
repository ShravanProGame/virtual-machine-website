const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

// Render requires us to use the port they assign, or fallback to 3000
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// --- ADVANCED PROXY HANDLER ---
app.get('/proxy/*', async (req, res) => {
    const targetUrl = req.params[0];

    // Basic validation
    if (!targetUrl) return res.status(400).send("No URL specified");
    if (!targetUrl.startsWith('http')) return res.status(400).send("URL must start with http or https");

    try {
        const response = await axios.get(targetUrl, {
            headers: { 
                // Spoof User-Agent to look like a real Windows PC
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
            },
            responseType: 'arraybuffer', // Get raw data to handle images/videos correctly
            validateStatus: () => true // Don't crash on 404s from the target site
        });

        // 1. Forward the Content-Type (HTML, CSS, Image, etc.)
        const contentType = response.headers['content-type'];
        res.set('Content-Type', contentType);

        // 2. STRIP SECURITY HEADERS (The Unblocker Logic)
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('X-Content-Type-Options');

        // 3. PROCESS HTML (Inject Link Fixer)
        if (contentType && contentType.includes('text/html')) {
            let html = response.data.toString('utf-8');
            
            // A. Inject Base Tag (Fixes broken images/styles)
            const baseUrl = new URL(targetUrl).origin;
            html = html.replace('<head>', `<head><base href="${targetUrl}">`);

            // B. Inject The "Interceptor" Script
            // This forces every link click to go back through your proxy
            const interceptorScript = `
                <script>
                    console.log("VM Proxy Active");
                    
                    // 1. Intercept Link Clicks
                    document.addEventListener('click', function(e) {
                        const link = e.target.closest('a');
                        if (link && link.href && !link.href.startsWith('javascript:')) {
                            e.preventDefault();
                            // Redirect to: /proxy/ + The Original Link
                            window.location.href = '/proxy/' + link.href;
                        }
                    });

                    // 2. Intercept Form Submits (Search bars, etc)
                    document.addEventListener('submit', function(e) {
                        e.preventDefault();
                        const form = e.target;
                        if (form.action) {
                            // Construct the new URL with query parameters
                            const url = new URL(form.action);
                            const params = new URLSearchParams(new FormData(form)).toString();
                            const fullUrl = url.origin + url.pathname + '?' + params;
                            window.location.href = '/proxy/' + fullUrl;
                        }
                    });
                </script>
            `;
            
            // Add script before the body closes
            html = html.replace('</body>', interceptorScript + '</body>');
            
            res.send(html);
        } else {
            // If it's an image/video/css, just send it raw
            res.send(response.data);
        }

    } catch (error) {
        console.error("Proxy Error:", error.message);
        res.status(500).send(`
            <body style="background:#111; color:#fff; font-family:sans-serif; text-align:center; padding-top:20%;">
                <h2>Proxy Error</h2>
                <p>Could not load: ${targetUrl}</p>
                <p>Reason: ${error.message}</p>
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
    console.log(`WebOS running on port ${PORT}`);
});
