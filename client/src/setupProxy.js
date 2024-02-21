const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:1234', // Update target to match your server port
      changeOrigin: true,
    })
  );
};
