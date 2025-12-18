const express = require('express');
const axios = require('axios');
const app = express();
const path = require('path');

app.use(express.static('public'));

// --- THE "FORCE" PROXY ---
app.get('/proxy/:url*', async (req, res) => {
    let targetUrl = req.params.url + (req.params[0] || '');
    
    // Fix protocol if missing
    if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
    }

    try {
        const response = await axios.get(targetUrl, {
            responseType: 'arraybuffer', // Handle images/files too
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
            }
        });

        // STRIP HEADERS that block iframes
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('X-Content-Type-Options');
        
        // Pass important headers
        res.setHeader('Content-Type', response.headers['content-type']);
        
        // Send data
        res.send(response.data);

    } catch (error) {
        console.error("Proxy Error:", error.message);
        // If it fails, send a polite error page instead of crashing
        res.send(`
            <body style="background:#222; color:white; font-family:sans-serif; text-align:center; padding-top:100px;">
                <h2>🚫 Website Blocked or Unavailable</h2>
                <p>The site <b>${targetUrl}</b> detected the proxy and blocked it.</p>
                <p>Try a different site or use the "Add Link" app to try an unblocked URL.</p>
            </body>
        `);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
