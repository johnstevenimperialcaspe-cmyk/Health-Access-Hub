const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // FIXED: Proxy configuration that preserves /api prefix
  // The proxy matches /api/* and forwards to http://localhost:5000/api/*
  // pathRewrite with "^/api": "/api" ensures /api is preserved
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5000",
      changeOrigin: true,
      secure: false,
      timeout: 30000,
      proxyTimeout: 30000,
      logLevel: "debug",
      // CRITICAL: http-proxy-middleware strips the matched prefix by default
      // When matching "/api", it strips "/api" before passing to pathRewrite
      // So /api/users becomes /users here, and we need to add /api back
      pathRewrite: function (path, req) {
        // path here is ALREADY stripped of /api (e.g., "/users" not "/api/users")
        // So we need to add /api back: /users -> /api/users
        const newPath = `/api${path}`;
        console.log(`[PROXY] Rewriting: ${path} -> ${newPath}`);
        return newPath;
      },
      onProxyReq: (proxyReq, req, res) => {
        const originalUrl = req.originalUrl || req.path;
        console.log(`[PROXY] ${req.method} ${originalUrl} -> http://localhost:5000${req.originalUrl || req.path}`);
        
        // Forward Authorization header
        if (req.headers.authorization) {
          proxyReq.setHeader("Authorization", req.headers.authorization);
        }
        // Forward Content-Type
        if (req.headers["content-type"]) {
          proxyReq.setHeader("Content-Type", req.headers["content-type"]);
        }
        // Log what path we're actually forwarding
        console.log(`[PROXY] Forwarding to: http://localhost:5000${proxyReq.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`[PROXY] Response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl || req.path}`);
      },
      onError: (err, req, res) => {
        console.error("[PROXY ERROR]", err.message);
        console.error("[PROXY ERROR] Request:", req.method, req.originalUrl || req.path);
        console.error("[PROXY ERROR] Error stack:", err.stack);
        
        if (!res.headersSent) {
          res.status(504).json({ 
            message: "Backend server is not responding. Please ensure the backend server is running on port 5000.",
            error: err.message,
            target: "http://localhost:5000",
            path: req.path,
            originalUrl: req.originalUrl
          });
        }
      },
      xfwd: true,
    })
  );
};
