const http = require('http');
const httpProxy = require('http-proxy-middleware');
const express = require('express');

const app = express();
const SUPABASE_URL = 'http://91.98.132.37:54320';
const LOCAL_PORT = 54321;

// Create a proxy middleware
const proxy = httpProxy.createProxyMiddleware({
  target: SUPABASE_URL,
  changeOrigin: true,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error: ' + err.message);
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} -> ${SUPABASE_URL}${req.url}`);
  }
});

// Use the proxy for all requests
app.use('/', proxy);

app.listen(LOCAL_PORT, () => {
  console.log(`Proxy server running on http://localhost:${LOCAL_PORT}`);
  console.log(`Forwarding requests to ${SUPABASE_URL}`);
  console.log('\nTo use this proxy:');
  console.log(`1. Update NEXT_PUBLIC_SUPABASE_URL to http://localhost:${LOCAL_PORT}`);
  console.log('2. Restart your Next.js app');
});