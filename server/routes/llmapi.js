const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const router = express.Router();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set.");
}

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

const modelName = "gemini-1.5-flash-latest";

const SYSTEMINSTRUCTIONS = `You are DuggyBuggy, a friendly and encouraging programming mentor designed to help new software developers learn and grow. Your primary goals are:

EDUCATIONAL APPROACH:
- Always explain concepts in beginner-friendly terms
- Break down complex problems into smaller, manageable steps
- Focus on teaching WHY something works, not just HOW
- Encourage learning through understanding rather than memorization
- Provide multiple solution approaches when possible to broaden learning

CODE ANALYSIS PHILOSOPHY:
- Treat every code review as a learning opportunity
- Point out both strengths and areas for improvement
- Explain the reasoning behind best practices
- Connect code patterns to fundamental programming concepts
- Help developers understand the impact of their coding decisions

COMMUNICATION STYLE:
- Be supportive and encouraging, never condescending
- Use clear, jargon-free explanations with technical terms explained
- Provide practical examples that relate to real-world scenarios
- Acknowledge that making mistakes is part of the learning process
- Celebrate good practices and progress

FLASHCARD INTEGRATION:
- Structure explanations and hints in a way that's conducive to spaced repetition learning
- Highlight key concepts that would benefit from flashcard review
- Provide memorable explanations that stick with learners
- Connect new concepts to previously learned material

Remember: Every interaction is a chance to build confidence and deepen understanding in aspiring developers.`;

// Load prompts from JSON file
let prompts;
try {
  const promptsPath = path.join(__dirname, "prompts.json");
  const promptsData = fs.readFileSync(promptsPath, "utf8");
  prompts = JSON.parse(promptsData);
} catch (error) {
  console.error("Error loading prompts.json:", error);
  throw new Error("Failed to load prompts configuration");
}

// Convert Type strings to actual Type objects for Gemini API
const convertSchema = (schema) => {
  if (typeof schema === "string") {
    return schema.replace("Type.", "");
  }
  
  if (Array.isArray(schema)) {
    return schema.map(convertSchema);
  }
  
  if (typeof schema === "object" && schema !== null) {
    const converted = {};
    for (const [key, value] of Object.entries(schema)) {
      if (key === "type" && typeof value === "string" && value.startsWith("Type.")) {
        converted[key] = value.replace("Type.", "");
      } else {
        converted[key] = convertSchema(value);
      }
    }
    return converted;
  }
  
  return schema;
};

router.get("/", (req, res) => {
  res.json({ 
    message: `LLM API is running with model: ${modelName}`,
    available_prompts: prompts.prompts.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category
    }))
  });
});

// Get all available prompts
router.get("/prompts", (req, res) => {
  res.json({
    prompts: prompts.prompts.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      tags: p.tags
    })),
    metadata: prompts.metadata
  });
});

// Get specific prompt by ID
router.get("/prompts/:id", (req, res) => {
  const promptId = req.params.id;
  const prompt = prompts.prompts.find(p => p.id === promptId);
  
  if (!prompt) {
    return res.status(404).json({ error: "Prompt not found" });
  }
  
  res.json(prompt);
});

// Generate content using a specific prompt
router.post("/prompt", async (req, res) => {
  try {
    const { promptId, userInput } = req.body;

    if (!promptId) {
      return res.status(400).json({ error: "promptId is required" });
    }

    if (!userInput) {
      return res.status(400).json({ error: "userInput is required" });
    }

    // Find the prompt by ID
    const selectedPrompt = prompts.prompts.find(p => p.id === promptId);
    
    if (!selectedPrompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    // Prepare the full prompt with user input
    const fullPrompt = `${selectedPrompt.prompt}\n\nUser Input: ${userInput}`;
    
    // Convert the response schema for Gemini API
    const convertedSchema = convertSchema(selectedPrompt.responseSchema);
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEMINSTRUCTIONS,
    });

    // The actual API call
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: convertedSchema,
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      return res.status(500).json({ 
        error: "Failed to parse model response",
        raw_response: text 
      });
    }

    // Return just the parsed JSON response
    res.json(parsedResponse);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ 
      error: "Failed to generate content from the model.",
      details: error.message 
    });
  }
});

module.exports = router;