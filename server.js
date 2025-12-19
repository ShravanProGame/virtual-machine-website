const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

// --- THE ULTIMATE PROXY ---
app.get('/proxy/*', async (req, res) => {
    // 1. Extract the actual URL you want to visit
    const rawUrl = req.params[0];
    
    // validation
    if (!rawUrl) return res.status(400).send("No URL provided");
    
    // Fix protocol if missing
    let targetUrl = rawUrl;
    if (!targetUrl.startsWith('http')) {
        // Handle cases where the browser sends "www.google.com" without https
        targetUrl = 'https://' + targetUrl;
    }

    try {
        const response = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            },
            responseType: 'arraybuffer', // Important for images
            validateStatus: () => true // Prevent crashing on 404s
        });

        // 2. Clean up headers so the browser accepts the content
        const contentType = response.headers['content-type'];
        res.setHeader('Content-Type', contentType);
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('X-Content-Type-Options');

        // 3. IF HTML: Inject the "Link Fixer" script
        if (contentType && contentType.includes('text/html')) {
            let html = response.data.toString('utf-8');
            const baseUrl = new URL(targetUrl).origin;

            // INJECTION: Base Tag + Link Interceptor
            const fixerScript = `
                <base href="${targetUrl}">
                <script>
                    document.addEventListener('DOMContentLoaded', () => {
                        console.log("VM Proxy Active");
                        
                        // FIX LINKS
                        document.body.addEventListener('click', function(e) {
                            const link = e.target.closest('a');
                            if (link && link.href && !link.href.startsWith('javascript')) {
                                e.preventDefault();
                                // Send back to server proxy
                                window.parent.postMessage({ type: 'navigate', url: link.href }, '*');
                                window.location.href = '/proxy/' + link.href;
                            }
                        });

                        // FIX FORMS (Search bars)
                        document.body.addEventListener('submit', function(e) {
                            e.preventDefault();
                            const form = e.target;
                            if(form.action) {
                                const url = new URL(form.action);
                                const params = new URLSearchParams(new FormData(form)).toString();
                                window.location.href = '/proxy/' + url.origin + url.pathname + '?' + params;
                            }
                        });
                    });
                </script>
            `;
            
            html = html.replace('<head>', `<head>${fixerScript}`);
            res.send(html);
        } else {
            // IF IMAGE/CSS/JS: Send raw
            res.send(response.data);
        }

    } catch (error) {
        // Custom Error Page
        res.send(`
            <body style="background:#111; color:white; font-family:sans-serif; text-align:center; padding-top:20%;">
                <h2>Could not load page</h2>
                <p>Target: ${targetUrl}</p>
                <p>Error: ${error.message}</p>
            </body>
        `);
    }
});

// --- CATCH ALL (Fixes "Cannot GET /") ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
