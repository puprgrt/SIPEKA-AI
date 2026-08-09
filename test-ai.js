import { GoogleGenAI, ThinkingLevel } from '@google/genai';
const ai = new GoogleGenAI({apiKey: '123'});
try {
  const req = {
      model: 'gemini-3.1-pro-preview',
      contents: [{role: 'user', parts: [{text: 'hi'}]}],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
  };
  console.log("Ready to call", req);
} catch (e) {
  console.error("Error:", e);
}
