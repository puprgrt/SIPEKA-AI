import { Router } from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Initialize the Gen AI Client
let aiClient: GoogleGenAI | null = null;
const getAiClient = () => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing. AI features will not work.');
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

const puprSystemInstruction = `Anda adalah Asisten AI Teknis Ahli Evaluasi Kerusakan Bangunan dari Kementerian Pekerjaan Umum dan Perumahan Rakyat (PUPR) Republik Indonesia. 
Tugas utama Anda adalah menganalisis deskripsi dan/atau foto kerusakan infrastruktur (bangunan gedung, fasilitas publik, dll) secara objektif, komprehensif, dan sangat teknis sesuai dengan manual dan pedoman evaluasi fisik PUPR.

Gunakan terminologi teknik sipil dan arsitektur yang presisi. Anda harus mengevaluasi kerusakan berdasarkan 7 tingkat kategori kerusakan PUPR berikut:
- Tingkat 1: Tidak Rusak (0%)
- Tingkat 2: Sangat Ringan (1-20%) - Kerusakan kosmetik/arsitektural minor.
- Tingkat 3: Ringan (21-35%) - Retak rambut, kerusakan non-struktural yang tidak membahayakan.
- Tingkat 4: Sedang (36-50%) - Kerusakan struktural minor dan arsitektural mayor yang masih bisa diperbaiki.
- Tingkat 5: Berat (51-70%) - Kerusakan struktural mayor yang membutuhkan penanganan darurat/rehabilitasi berat.
- Tingkat 6: Sangat Berat (71-85%) - Struktur hampir runtuh, bahaya keselamatan tinggi.
- Tingkat 7: Hancur / Tidak Sesuai (>85%) - Runtuh total atau tidak layak pakai sama sekali.

Dalam analisis Anda:
1. Identifikasi komponen struktural (kolom, balok, pondasi, plat), arsitektural (dinding, atap, lantai, fasad), dan utilitas yang terdampak.
2. Hitung estimasi persentase kerusakan dengan cermat berdasarkan kondisi yang terlihat/dideskripsikan.
3. Berikan rekomendasi penanganan teknis yang spesifik (misal: perkuatan struktur dengan FRP, injeksi epoksi untuk retak struktural, pembongkaran total, dsb).`;

router.post('/analyze-damage', requireAuth, async (req, res) => {
  try {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({ error: 'AI Service Unavailable (Missing API Key)' });
    }

    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Analisis deskripsi kerusakan bangunan berikut: ${description}` }],
        },
      ],
      config: {
        systemInstruction: puprSystemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            damageLevel: { type: "STRING" },
            percentage: { type: "NUMBER" },
            recommendations: { type: "STRING" }
          },
          required: ["damageLevel", "percentage", "recommendations"]
        }
      }
    });

    if (response.text) {
        res.json(JSON.parse(response.text));
    } else {
        res.status(500).json({ error: "Failed to parse AI response" });
    }
  } catch (error) {
    console.error('Error analyzing damage:', error);
    res.status(500).json({ error: 'Failed to analyze damage' });
  }
});

router.post('/analyze-photo', requireAuth, async (req, res) => {
  try {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({ error: 'AI Service Unavailable (Missing API Key)' });
    }

    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Analisis foto kerusakan bangunan ini. Identifikasi secara detail setiap retakan, patahan, atau kerusakan elemen bangunan (struktural maupun non-struktural) dan hitung persentasenya secara akurat. Berikan skor confidence (0-100).' },
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg'
              }
            }
          ]
        },
      ],
      config: {
        systemInstruction: puprSystemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            severity: { type: "STRING" },
            confidence: { type: "NUMBER" },
            description: { type: "STRING" },
            cracks: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  label: { type: "STRING" },
                  severity: { type: "STRING" },
                  widthMm: { type: "NUMBER" },
                  lengthCm: { type: "NUMBER" }
                }
              }
            }
          },
          required: ["severity", "confidence", "description", "cracks"]
        }
      }
    });

    if (response.text) {
        res.json(JSON.parse(response.text));
    } else {
        res.status(500).json({ error: "Failed to parse AI response" });
    }
  } catch (error) {
    console.error('Error analyzing photo:', error);
    res.status(500).json({ error: 'Failed to analyze photo' });
  }
});

export const aiRouter = router;
