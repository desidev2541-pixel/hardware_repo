import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI client server-side lazily
  let aiClient: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not configured.');
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Hardware Factory ERP' });
  });

  // AI Production & Bottleneck Advisor endpoint
  app.post('/api/ai/advisor', async (req, res) => {
    try {
      const { erpSummary, query } = req.body;
      const ai = getAiClient();

      const prompt = `You are the Lead Hardware Manufacturing AI Operations Advisor for a high-precision door hardware factory (manufacturing brass handles, mortise locks, cabinet knobs, hinges, and component parts).

Current Factory Context:
${JSON.stringify(erpSummary, null, 2)}

User Question / Goal:
${query || 'Provide an executive summary of current production bottlenecks, component readiness, quality risks, and top 3 immediate action items for shop floor supervisors.'}

Please analyze the 12-stage production pipeline, component dependencies, and inventory stock levels. Give a direct, structured, highly professional response with:
1. Executive Bottleneck Assessment (identifying exact part-level delays e.g., in Polishing or Electroplating)
2. Assembly Readiness Analysis (which purchase orders are blocked by missing sub-components)
3. Actionable Shop Floor Directives (specific machine line shift, re-inspection, or material reorder recommendations)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      res.json({
        success: true,
        advice: response.text || 'No response generated from AI model.',
      });
    } catch (err: any) {
      console.error('Error calling Gemini AI in server:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to generate AI advice.',
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hardware Factory ERP Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
