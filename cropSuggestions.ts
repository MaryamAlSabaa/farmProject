// import {z} from "zod";

// const cropSchema = z.object({
//     emergeDay: z.number(),
//     plantSpacing: z.number(),
//     rowSpacing: z.number(),
//     plantingDepth: z.number(),
//     avgHeight: z.number(),
//     startMethod: z.string(),
//     GerminationRate: z.number(),
//     seedsPerHole: z.number(),
//     soilConditions: z.string(),
//     flower: z.number(),
//     fertilizer: z.string(),
//     irrigation: z.string(),
//     maturity: z.number(),
//     harvestWindow: z.number(),
//     lossRate: z.number(),
//     harvestUnit: z.string(),
//     expYield: z.number(),
//     hecYield: z.number(),
//     estRev: z.number(),
//     lightProfile: z.string()
//   });
//   `
//     You are a farm management assistant.
//     Return ONLY a valid JSON object following this schema:
//     (emergeDay, plantSpacing, rowSpacing, plantingDepth, avgHeight, startMethod, GerminationRate, seedsPerHole, soilConditions, flower, fertilizer, irrigation, maturity, harvestWindow, lossRate, harvestUnit, expYield, hecYield, estRev, lightProfile)
//     Make values realistic for the crop {$crop}.
//     No explanations, no markdown, return only JSON.
//     All text fields must be in language: ${lang === "ar" ? "Arabic" : "English"}.
//     Numbers must be bare numbers (no units in the value).
//     `;

//     "Give me tomato farming details including avgerage Height, start Method of planting, Germination Rate, number of seeds Per Hole:  in JSON"

//     // const userMsg =
//     //   `Crop: ${crop}
//     //     Return ONLY the JSON object, nothing else.`;
//     // // const chatbaseResponse = await fetch("")
  