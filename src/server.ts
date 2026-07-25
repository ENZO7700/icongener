import express from 'express';
import path from 'path';

import { fileURLToPath } from 'url';
// @ts-ignore - import.meta is valid in Node.js ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env['PORT'] || 3001;

// Middleware for parsing JSON
app.use(express.json({ limit: '10mb' }));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    hasMistral: !!process.env['MISTRAL_API_KEY'],
    hasGemini: !!process.env['GEMINI_API_KEY']
  });
});

// Enhance preset endpoint
app.post('/api/enhance-preset', async (req, res): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }
    
    const enhancedDescription = prompt;
    
    res.json({ enhancedDescription });
  } catch (error: any) {
    console.error('Error enhancing preset:', error);
    res.status(500).json({ error: error.message || 'Failed to enhance preset' });
  }
});

// Generate SVG endpoint
app.post('/api/generate-svg', async (req, res): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }
    
    const svgCode = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#00d4ff"/></svg>';
    
    res.json({ svgCode });
  } catch (error: any) {
    console.error('Error generating SVG:', error);
    res.status(500).json({ error: error.message || 'Failed to generate SVG' });
  }
});

// Serve static files from Angular build output
app.use(express.static(path.join(__dirname, '../dist'), {
  maxAge: '1y',
  index: 'index.html',
  fallthrough: false
}));

// Catch-all: serve index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Listen on designated port if run directly
if (process.env['NODE_ENV'] !== 'test') {
  const server = app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the other process or set PORT.`);
      process.exit(1);
    }
    console.error('API server error:', err);
    process.exit(1);
  });
}

export { app };
export default app;
