const express = require('express');
const path = require('path');
const axios = require('axios'); // Needed for the proxy
const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS) from the current folder
app.use(express.static(__dirname));

// --- PROXY HANDLER (THE FIX) ---
// This allows the browser to fetch the content of other sites
app.get('/proxy/*', async (req, res) => {
    const targetUrl = req.params[0]; // Gets the URL after /proxy/
    
    if (!targetUrl) return res.status(400).send("No URL specified");

    try {
        const response = await axios.get(targetUrl, {
            responseType: 'stream',
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
            }
        });
        
        // Copy the content type (HTML, JSON, etc.) from the website to our response
        res.set('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        console.error("Proxy Error:", error.message);
        res.status(500).send(`
            <body style="color:white; background:black; font-family:sans-serif; text-align:center; padding-top:50px;">
                <h1>Error Loading Page</h1>
                <p>Could not load ${targetUrl}</p>
                <p>Reason: ${error.message}</p>
            </body>
        `);
    }
});

// Send index.html when users go to the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`WebOS running at http://localhost:${PORT}`);
});
