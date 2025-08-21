import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const port = 3000;
app.use(cors());

app.use(bodyParser.json());
const API_KEY = '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';
const schema = {
  emergeDay: 'number',
  plantSpacing: 'number',
  rowSpacing: 'number',
  plantingDepth: 'number',
  avgHeight: 'number',
  startMethod: 'string',
  GerminationRate: 'number',
  seedsPerHole: 'number',
  soilConditions: 'string',
  dayToflower: 'number',
  fertilizer: 'string',
  irrigationNeed: 'string',
  dayTomaturity: 'number',
  harvestWindow: 'number',
  lossRate: 'number',
  harvestUnit: 'string',
  expYieldPer3048cm: 'number',
  expYieldHec: 'number',
  estRev: 'number',
  lightProfile: 'string'
};

const client = new OpenAI({
  // apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: API_KEY,
});

app.post("/api/crop", async (req, res) => {
  console.log("Received request:", req.body);
  try {
    const { cropType, cropSubType } = req.body;

    const prompt = `You are a farm management assistant. Return ONLY valid JSON matching this schema: ${JSON.stringify(schema)}. 
    Make values realistic for the crop: ${cropType} (${cropSubType}). No explanations, no markdown, no extra text.`;
    const completion = await client.chat.completions.create({
      model:"openai/gpt-oss-20b:free",
      messages: [{ role: 'user', content: prompt }],
    });
    const content = completion.choices[0].message.content; 
    console.log("completion: ", content);

    let parsed = {};
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse JSON from model:", content);
    }
    res.json(parsed);
    }catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
