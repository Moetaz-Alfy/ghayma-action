const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_ENV = process.env.APP_ENV || 'local';
const START_TIME = Date.now();

let requestCount = 0;

app.use((req, res, next) => {
  requestCount += 1;
  next();
});

// Serve the landing page (public/index.html + style.css)
app.use(express.static(path.join(__dirname, 'public')));


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/version', (req, res) => {
  res.status(200).json({
    env: APP_ENV,
    uptime_seconds: Math.floor((Date.now() - START_TIME) / 1000),
    request_count: requestCount,
    commit: process.env.GIT_COMMIT || 'unknown',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[${APP_ENV}] listening on port ${PORT}`);
});
