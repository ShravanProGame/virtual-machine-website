const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

// --- ROBUST PROXY HANDLER ---
app.get('/proxy/*', async (req, res) => {
    // 1. Reconstruct the URL correctly (fixes the "https:/google" bugs)
    let targetUrl = req.url.replace('/proxy/', '');
    
    // If the browser stripped the slashes, put them back
    if (targetUrl.match(/^https?:\/[^/]/)) {
        targetUrl = targetUrl.replace(':/', '://');
    }
    
    // Add protocol if missing
    if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
    }

    // Ignore "favicon.ico" requests that might break things
    if (targetUrl.includes('favicon.ico')) return res.sendStatus(404);

    try {
        const response = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            },
            responseType: 'arraybuffer',
            validateStatus: () => true
        });

        // 2. Set Content Type
        res.setHeader('Content-Type', response.headers['content-type']);
        
        // 3. Strip Blocking Headers
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');

        // 4. Inject Link Fixer for HTML pages
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
            let html = response.data.toString('utf-8');
            
            // Add <base> tag so relative links (like /style.css) load from the real site
            // Add script to intercept clicks
            const fixer = `
                <base href="${targetUrl}">
                <script>
                    document.addEventListener('click', e => {
                        const a = e.target.closest('a');
                        if (a && a.href && !a.href.startsWith('javascript')) {
                            e.preventDefault();
                            window.location.href = '/proxy/' + a.href;
                        }
                    });
                </script>
            `;
            html = html.replace('<head>', '<head>' + fixer);
            res.send(html);
        } else {
            res.send(response.data);
        }

    } catch (error) {
        console.error("Proxy Fail:", targetUrl);
        res.status(500).send("Proxy Error: " + error.message);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Luminal OS running on ${PORT}`));
