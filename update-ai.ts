import fs from 'fs';

let content = fs.readFileSync('src/routes/ai.ts', 'utf8');

const analyzePhotoRoute = `
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

    const base64Data = imageBase64.replace(/^data:image\\/\\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Analyze this building damage photo. Categorize the severity as "Rusak Ringan", "Rusak Sedang", or "Rusak Berat". Also identify any cracks and provide a confidence score.' },
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
`;

content = content.replace('export const aiRouter = router;', analyzePhotoRoute + '\nexport const aiRouter = router;');
fs.writeFileSync('src/routes/ai.ts', content);

