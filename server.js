const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

// --- THE ROBUST PROXY ---
const proxyOptions = {
    target: 'https://www.google.com', 
    changeOrigin: true,
    ws: true, 
    router: function(req) {
        const urlStr = req.url.replace('/proxy/', '');
        if (!urlStr) return 'https://www.google.com';
        if (urlStr.startsWith('http')) return urlStr;
        return 'https://' + urlStr;
    },
    pathRewrite: { '^/proxy/': '' },
    onProxyRes: function (proxyRes, req, res) {
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    },
    onError: function(err, req, res) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Proxy Error: Site blocked. Use the "Browser" app.');
    }
};

app.use('/proxy', createProxyMiddleware(proxyOptions));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Reliable OS running on ${PORT}`));
