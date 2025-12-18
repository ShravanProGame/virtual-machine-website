const express = require('express');
const Unblocker = require('unblocker');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// 1. Initialize the Proxy Engine
// This creates a new 'Unblocker' instance that rewrites URLs
const unblocker = new Unblocker({
    prefix: '/proxy/' 
});

// 2. Connect the Proxy to Express
// This tells your server: "If a request comes for /proxy, let the Unblocker handle it."
app.use(unblocker);

// 3. Serve your Desktop (VM) files
// Standard static file serving for your index.html, style.css, etc.
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 4. Start the System
app.listen(PORT, () => {
    console.log(`\n=== VM SYSTEM ONLINE ===`);
    console.log(`Proxy Engine: ACTIVE`);
    console.log(`Listening on port ${PORT}`);
});
