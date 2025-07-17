const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const router = express.Router();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelName = "gemini-2.5-flash";

const SYSTEMINSTRUCTIONS = `You are DuggyBuggy, a debugging-focused programming mentor.

ERROR DETECTION PRIORITY:
- ALWAYS identify bugs, errors, and mistakes first
- Point out syntax errors, logic errors, runtime errors
- Identify incorrect algorithms, wrong indexing, off-by-one errors
- Highlight missing edge cases, null checks, bounds checking
- Focus on what's broken or incorrect, not general improvements

RESPONSE REQUIREMENTS:
- text_hint: Maximum 400 characters - MUST describe the main error/mistake
- code_hint: Maximum 800 characters - copy and paste the code from the user input and add a comment in the lines which you found the error. Format the code correctly according to the programming language used.
- problem_description: Maximum 200 characters TOTAL
- clarification_request: Maximum 300 characters TOTAL
- Be specific about bugs, not general advice
- Always provide valid, complete JSON responses

Your primary goal: Find and explain errors in the code.`;

// Helper function to truncate long text fields
function truncateText(text, maxLength) {
  if (!text || typeof text !== "string") return text;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

// Helper function to clean and validate response
function cleanAndValidateResponse(responseText) {
  try {
    // First, try to parse as-is
    let parsed = JSON.parse(responseText);

    // Truncate overly long text fields to prevent issues
    if (parsed.text_hint) {
      parsed.text_hint = truncateText(parsed.text_hint, 400);
    }
    if (parsed.code_hint) {
      parsed.code_hint = truncateText(parsed.code_hint, 1000);
    }
    if (parsed.solution) {
      parsed.solution = truncateText(parsed.solution, 2000);
    }
    if (parsed.problem_description) {
      parsed.problem_description = truncateText(
        parsed.problem_description,
        400
      );
    }
    if (parsed.clarification_request) {
      parsed.clarification_request = truncateText(
        parsed.clarification_request,
        400
      );
    }
    if (parsed.test_message) {
      parsed.test_message = truncateText(parsed.test_message, 200);
    }
    if (parsed.feedback_message) {
      parsed.feedback_message = truncateText(parsed.feedback_message, 500);
    }

    return parsed;
  } catch (parseError) {
    console.log(
      "Initial JSON parse failed, attempting to fix...",
      parseError.message
    );

    // Try to fix common JSON issues
    let fixedText = responseText;

    // Remove any trailing incomplete JSON
    const lastBraceIndex = fixedText.lastIndexOf("}");
    if (lastBraceIndex > 0) {
      fixedText = fixedText.substring(0, lastBraceIndex + 1);
    }

    // Try to parse the fixed text
    try {
      let parsed = JSON.parse(fixedText);
      return cleanAndValidateResponse(JSON.stringify(parsed)); // Re-clean the fixed response
    } catch (secondError) {
      console.log("Could not fix JSON, creating fallback response");

      // Create a fallback response that matches common schemas
      return {
        needs_clarification: true,
        clarification_request:
          "I had trouble analyzing your code. Could you provide more context about what you're trying to achieve?",
        text_hint: "",
        code_hint: "",
        solution: "",
        problem_description: "",
        key_concepts: [],
        test_message: "Fallback response due to parsing error",
        test_successful: false,
      };
    }
  }
}

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
      if (
        key === "type" &&
        typeof value === "string" &&
        value.startsWith("Type.")
      ) {
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
    available_prompts: prompts.prompts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
    })),
  });
});

// Get all available prompts
router.get("/prompts", (req, res) => {
  res.json({
    prompts: prompts.prompts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      tags: p.tags,
    })),
    metadata: prompts.metadata,
  });
});

// Get specific prompt by ID
router.get("/prompts/:id", (req, res) => {
  const promptId = req.params.id;
  const prompt = prompts.prompts.find((p) => p.id === promptId);

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
    const selectedPrompt = prompts.prompts.find((p) => p.id === promptId);

    if (!selectedPrompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    console.log("Selected prompt:", selectedPrompt.name);
    console.log("User input:", userInput);

    const fullPrompt = `${selectedPrompt.prompt}

CRITICAL REQUIREMENTS - ERROR DETECTION FOCUS:
- text_hint: Maximum 400 characters - MUST identify the main bug/error/mistake
- code_hint: Maximum 800 characters - show how to fix the specific error
- problem_description: Maximum 200 characters
- clarification_request: Maximum 300 characters

DEBUGGING PRIORITY:
1. Look for syntax errors, logic errors, runtime errors first
2. Check for off-by-one errors, wrong indexing, bounds issues
3. Identify incorrect algorithms or missing edge cases
4. Point out specific mistakes, not general improvements
5. If no errors found, then mention potential improvements

User Input: ${userInput}`;

    // Convert the response schema for Gemini API
    const convertedSchema = convertSchema(selectedPrompt.responseSchema);

    console.log("Converted schema:", JSON.stringify(convertedSchema, null, 2));

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEMINSTRUCTIONS,
    });

    console.log("Making request to Gemini API...");

    // The actual API call
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: convertedSchema,
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    console.log("Received response from Gemini API");

    const response = result.response;
    const text = response.text();

    // Limit log output to prevent console spam
    console.log(
      "Raw response text:",
      text.length > 500 ? text.substring(0, 500) + "..." : text
    );

    let parsedResponse;
    try {
      parsedResponse = cleanAndValidateResponse(text);
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      console.error(
        "Raw response that failed to parse:",
        text.substring(0, 500) + "..."
      );
      return res.status(500).json({
        error: "Failed to parse model response",
        parse_error: parseError.message,
        // Provide a basic fallback
        needs_clarification: true,
        clarification_request:
          "I encountered a technical issue. Please try again.",
      });
    }

    console.log("Successfully parsed response:", parsedResponse);

    // Return just the parsed JSON response
    res.json(parsedResponse);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: "Failed to generate content from the model.",
      details: error.message,
      error_type: error.name,
    });
  }
});

module.exports = router;
