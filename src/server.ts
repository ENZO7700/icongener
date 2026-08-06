import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// @ts-ignore - import.meta is valid in Node.js ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manual .env loader to ensure environment variables are populated correctly
try {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index > 0) {
        const key = trimmed.substring(0, index).trim();
        let value = trimmed.substring(index + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    }
  }
} catch (e) {
  console.warn('Failed to manually parse .env file:', e);
}

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
    res.json({ enhancedDescription: prompt });
  } catch (error: any) {
    console.error('Error enhancing preset:', error);
    res.status(500).json({ error: error.message || 'Failed to enhance preset' });
  }
});

/**
 * Smart Local SVG Generator Engine
 * Parses the prompt to detect subject keywords and returns high-quality, fully responsive vector SVG markup.
 */
function generateSmartSvg(prompt: string, primaryColor: string, secondaryColor: string): string {
  const p = prompt.toLowerCase();

  const wrapSvg = (inner: string) => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="${secondaryColor}" stop-opacity="0.8" />
        </linearGradient>
        <filter id="dropGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="${primaryColor}" flood-opacity="0.35" />
        </filter>
      </defs>
      ${inner}
    </svg>
  `.trim();

  // 1. Apple / Mac / iOS / iPhone
  if (p.includes('apple') || p.includes('mac') || p.includes('ios') || p.includes('iphone') || p.includes('jablk')) {
    return wrapSvg(`
      <g transform="translate(10, 10) scale(0.8)">
        <path d="M63 31c-3 3.6-7.8 5.8-12.5 5.3-.6-4.7 1.8-9.4 4.7-12.4 3-3.2 8-5.3 12.1-5.3.7 4.9-1.3 9.4-4.3 12.4z" fill="${secondaryColor}"/>
        <path d="M68.5 51.5c.1-8.3 6.8-12.3 7.1-12.5-3.9-5.7-9.9-6.5-12.1-6.6-5.1-.5-10.1 3-12.7 3-2.6 0-6.7-2.9-11-2.8-5.6.1-10.8 3.2-13.7 8.2-5.8 10.1-1.5 25.1 4.2 33.3 2.8 4 6.1 8.5 10.4 8.3 4.2-.2 5.8-2.7 10.8-2.7 5 0 6.4 2.7 10.8 2.6 4.5-.1 7.3-4.1 10.1-8.1 3.2-4.7 4.5-9.3 4.6-9.5-.1-.1-8.8-3.4-8.9-13.2z" fill="${primaryColor}"/>
      </g>
    `);
  }

  // 2. Rocket / Space / Launch
  if (p.includes('rocket') || p.includes('space') || p.includes('launch') || p.includes('raket') || p.includes('štart')) {
    return wrapSvg(`
      <path d="M50 15C50 15 30 35 30 65L40 70L50 60L60 70L70 65C70 35 50 15 50 15Z" fill="${primaryColor}"/>
      <circle cx="50" cy="40" r="8" fill="${secondaryColor}"/>
      <path d="M45 70L50 85L55 70Z" fill="${secondaryColor}"/>
      <path d="M30 65L20 75L35 72Z" fill="${primaryColor}"/>
      <path d="M70 65L80 75L65 72Z" fill="${primaryColor}"/>
    `);
  }

  // 3. Code / Dev / Terminal / Programming
  if (p.includes('code') || p.includes('dev') || p.includes('terminal') || p.includes('script') || p.includes('kód') || p.includes('program')) {
    return wrapSvg(`
      <rect x="15" y="20" width="70" height="60" rx="8" fill="${primaryColor}"/>
      <path d="M30 40L42 50L30 60" stroke="${secondaryColor}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <line x1="48" y1="60" x2="68" y2="60" stroke="${secondaryColor}" stroke-width="6" stroke-linecap="round"/>
    `);
  }

  // 4. Star / Favorite / Rating / Sparkle
  if (p.includes('star') || p.includes('hviezda') || p.includes('favorite') || p.includes('sparkle') || p.includes('glow')) {
    return wrapSvg(`
      <polygon points="50,15 61,38 85,41 68,58 72,82 50,70 28,82 32,58 15,41 39,38" fill="${primaryColor}"/>
      <polygon points="50,25 58,40 73,42 62,54 65,70 50,62 35,70 38,54 27,42 42,40" fill="${secondaryColor}"/>
    `);
  }

  // 5. Shield / Security / Lock / Key
  if (p.includes('shield') || p.includes('security') || p.includes('lock') || p.includes('štít') || p.includes('zámok') || p.includes('kľúč')) {
    return wrapSvg(`
      <path d="M50 15L25 25V45C25 65 50 85 50 85C50 85 75 65 75 45V25L50 15Z" fill="${primaryColor}"/>
      <rect x="40" y="45" width="20" height="18" rx="3" fill="${secondaryColor}"/>
      <path d="M44 45V38C44 34.7 46.7 32 50 32C53.3 32 56 34.7 56 38V45" stroke="${secondaryColor}" stroke-width="4" fill="none"/>
    `);
  }

  // 6. Bolt / Zap / Energy / Power / Lightning
  if (p.includes('bolt') || p.includes('zap') || p.includes('energy') || p.includes('power') || p.includes('blesk')) {
    return wrapSvg(`
      <polygon points="55,10 25,55 45,55 35,90 75,45 55,45" fill="${primaryColor}"/>
      <polygon points="53,20 33,52 48,52 40,78 67,48 51,48" fill="${secondaryColor}"/>
    `);
  }

  // 7. Globe / Web / Net / Browser
  if (p.includes('globe') || p.includes('web') || p.includes('net') || p.includes('world') || p.includes('internet') || p.includes('prehliad')) {
    return wrapSvg(`
      <circle cx="50" cy="50" r="35" fill="${primaryColor}"/>
      <ellipse cx="50" cy="50" rx="35" ry="14" fill="none" stroke="${secondaryColor}" stroke-width="4"/>
      <ellipse cx="50" cy="50" rx="14" ry="35" fill="none" stroke="${secondaryColor}" stroke-width="4"/>
      <line x1="15" y1="50" x2="85" y2="50" stroke="${secondaryColor}" stroke-width="4"/>
    `);
  }

  // 8. User / Profile / Avatar / Person
  if (p.includes('user') || p.includes('profile') || p.includes('avatar') || p.includes('person') || p.includes('profil')) {
    return wrapSvg(`
      <circle cx="50" cy="35" r="18" fill="${primaryColor}"/>
      <path d="M20 80C20 62 33 52 50 52C67 52 80 62 80 80Z" fill="${primaryColor}"/>
      <circle cx="50" cy="35" r="10" fill="${secondaryColor}"/>
    `);
  }

  // 9. Fire / Flame / Burn / Hot
  if (p.includes('fire') || p.includes('flame') || p.includes('burn') || p.includes('oheň')) {
    return wrapSvg(`
      <path d="M50 15C50 15 65 35 65 55C65 70 58 80 48 82C38 84 25 75 25 55C25 40 38 25 50 15Z" fill="${primaryColor}"/>
      <path d="M50 40C50 40 58 52 58 64C58 72 53 77 47 78C41 79 33 73 33 60C33 50 42 45 50 40Z" fill="${secondaryColor}"/>
    `);
  }

  // 10. Gear / Settings / Tool
  if (p.includes('gear') || p.includes('settings') || p.includes('tool') || p.includes('nastaven') || p.includes('nástroj')) {
    return wrapSvg(`
      <circle cx="50" cy="50" r="30" fill="${primaryColor}"/>
      <path d="M50 10L50 20M50 80L50 90M10 50L20 50M80 50L90 50M22 22L29 29M71 71L78 78M22 78L29 71M71 22L78 29" stroke="${secondaryColor}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="15" fill="${secondaryColor}"/>
    `);
  }

  // Default fallback monogram based on prompt
  const cleanedText = prompt.replace(/Generate a modern, clean (circle|square|rounded) icon for a /i, '').trim();
  const letter = (cleanedText[0] || 'I').toUpperCase();
  return wrapSvg(`
    <rect x="20" y="20" width="60" height="60" rx="16" fill="${primaryColor}"/>
    <circle cx="50" cy="50" r="24" fill="none" stroke="${secondaryColor}" stroke-width="4" stroke-dasharray="8 4"/>
    <text x="50" y="61" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="900" text-anchor="middle" fill="${secondaryColor}">${letter}</text>
  `);
}

// Generate SVG endpoint with dual API support (Gemini, Mistral) and custom fallback engine
app.post('/api/generate-svg', async (req, res): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Extract colors from the prompt string using regular expressions
    const primaryMatch = prompt.match(/primary color:\s*(#[0-9a-fA-F]{6}|rgba?\(.*?\))/i);
    const secondaryMatch = prompt.match(/secondary color:\s*(#[0-9a-fA-F]{6}|rgba?\(.*?\))/i);
    const primaryColor = primaryMatch ? primaryMatch[1] : '#ce1c72';
    const secondaryColor = secondaryMatch ? secondaryMatch[1] : '#ffffff';

    let svgCode = '';

    // 1. Try Gemini API first if configured
    if (process.env['GEMINI_API_KEY']) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env['GEMINI_API_KEY'] });
        const geminiPrompt = `${prompt}\nIMPORTANT: Return ONLY valid responsive SVG XML markup code starting with <svg> and ending with </svg>. Do not wrap in markdown or include text.`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: geminiPrompt
        });
        if (response.text && response.text.includes('<svg')) {
          svgCode = response.text;
        }
      } catch (err) {
        console.error('Gemini SVG generation failed:', err);
      }
    }

    // 2. Try Mistral API if Gemini was not used or failed
    if (!svgCode && process.env['MISTRAL_API_KEY']) {
      try {
        const mistralPrompt = `${prompt}\nIMPORTANT: Return ONLY valid responsive SVG XML markup code starting with <svg> and ending with </svg>. Do not wrap in markdown or include text.`;
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env['MISTRAL_API_KEY']}`
          },
          body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: mistralPrompt }],
            temperature: 0.1
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          const content = data.choices?.[0]?.message?.content || '';
          if (content.includes('<svg')) {
            svgCode = content;
          }
        } else {
          console.error('Mistral API request failed:', response.statusText);
        }
      } catch (err) {
        console.error('Mistral SVG generation failed:', err);
      }
    }

    // 3. Fallback to smart local prompt-aware SVG engine if no API succeeded or is configured
    if (!svgCode) {
      svgCode = generateSmartSvg(prompt, primaryColor, secondaryColor);
    }

    res.json({ svgCode });
  } catch (error: any) {
    console.error('Error in /api/generate-svg:', error);
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

