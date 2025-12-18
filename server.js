const express = require('express');
const path = require('path');
const axios = require('axios'); 
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// --- IMPROVED PROXY HANDLER ---
app.get('/proxy/*', async (req, res) => {
    const targetUrl = req.params[0];
    if (!targetUrl) return res.status(400).send("No URL specified");

    try {
        // 1. Fetch the website content as text (not a stream)
        const response = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
            }
        });
        
        let html = response.data;

        // 2. INJECT BASE TAG (The Fix)
        // This tells the browser to load images/css from the real website, not localhost
        if (typeof html === 'string' && html.includes('<head>')) {
            html = html.replace('<head>', `<head><base href="${targetUrl}">`);
        }

        res.send(html);

    } catch (error) {
        console.error("Proxy Error:", error.message);
        res.status(500).send(`
            <body style="color:white; background:#222; font-family:sans-serif; text-align:center; padding-top:50px;">
                <h2>⚠️ Could not load website</h2>
                <p>Target: ${targetUrl}</p>
                <p>Error: ${error.message}</p>
            </body>
        `);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`WebOS running at http://localhost:${PORT}`);
});
