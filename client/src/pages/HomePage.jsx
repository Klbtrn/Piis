import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Editor from "@/components/Editor";
import { Link } from "react-router-dom";

// Logos
import pythonLogo from "/src/assets/python-logo.png";
import jsLogo from "/src/assets/js-logo.png";
import duggyLogo from "/src/assets/duggy-logo.png";

import Navbar from "@/components/Navbar";

import HelperSession from "@/lib/HelperSession";

export default function HomePage() {
  // State
  const [language, setLanguage] = useState("python");
  const [showTyping1, setShowTyping1] = useState(true);
  const [showMessage1, setShowMessage1] = useState(false);
  const [showTyping2, setShowTyping2] = useState(false);
  const [showMessage2, setShowMessage2] = useState(false);
  const [showTyping3, setShowTyping3] = useState(false);
  const [showMessage3, setShowMessage3] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [testApiResponse, setTestApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiBaseUrl, setApiBaseUrl] = useState(null);
  const [helperSession, setHelperSession] = useState(null);
  const [isHelperMode, setIsHelperMode] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHints, setShowHints] = useState({ text: false, code: false });
  const [showSolution, setShowSolution] = useState(false);
  const [showGenerateFlashcard, setShowGenerateFlashcard] = useState(false);
  const [helperMessages, setHelperMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [codeHintContent, setCodeHintContent] = useState(""); // Für den Code-Hint-Editor
  const editorRef = useRef(null);

  // Modernes lila Farbschema und Glassmorphism-Styles
  const glassBg =
    "bg-white/10 backdrop-blur-md shadow-2xl border border-purple-400/30";
  const cardBg =
    "bg-gradient-to-br from-purple-900/80 via-purple-800/80 to-zinc-900/80";
  const accent = "from-purple-600 via-fuchsia-500 to-purple-400";
  const borderAccent = "border border-purple-500/40";
  const floatingBtn =
    "fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white p-5 rounded-full shadow-xl hover:scale-105 transition-all z-50";

  const makeTestApiCall = async (baseUrl) => {
    try {
      console.log("Making test API call with test_prompt...");
      const response = await fetch(`${baseUrl}/prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptId: "test_prompt",
          userInput:
            "Running test to verify API connectivity and prompt system",
        }),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
          const errorBody = await response.text();
          console.log("Error response body:", errorBody);
          const errorJson = JSON.parse(errorBody);
          errorDetails = errorJson.error || errorJson.details || errorDetails;
          if (errorJson.details) {
            errorDetails += ` - ${errorJson.details}`;
          }
        } catch (parseError) {
          console.log("Could not parse error response as JSON");
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      console.log("Test API response:", data);
      setTestApiResponse(data);
      return data;
    } catch (error) {
      console.error("Test API call failed:", error);
      setTestApiResponse({
        error: `Test API call failed: ${error.message}`,
      });
      return null;
    }
  };

  const testPromptsEndpoint = async (baseUrl) => {
    try {
      const response = await fetch(`${baseUrl}/prompts`);
      if (response.ok) {
        const data = await response.json();
        console.log("Prompts endpoint working:", data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Prompts endpoint failed:", error);
      return false;
    }
  };

  const retryTest = () => {
    if (apiBaseUrl) {
      setTestApiResponse(null);
      setShowTyping3(true);
      makeTestApiCall(apiBaseUrl).then(() => {
        setTimeout(() => {
          setShowTyping3(false);
          setShowMessage3(true);
        }, 1000);
      });
    }
  };

  const addHelperMessage = (message, type = "duggy") => {
    setHelperMessages((prev) => [
      ...prev,
      { ...message, type, timestamp: Date.now() },
    ]);
  };

  const handleInitialAnalysis = async () => {
    if (!editorContent.trim()) {
      addHelperMessage({
        text: "I don't see any code to analyze! Please paste your code in the editor first. 🤔",
      });
      return;
    }

    setIsAnalyzing(true);
    setIsTyping(true);

    try {
      const response = await fetch(`${apiBaseUrl}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: "helper_initial_prompt",
          userInput: `Please analyze this code:\n\n${editorContent}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setTimeout(() => {
        setIsTyping(false);

        if (result.needs_clarification) {
          addHelperMessage({
            text: result.clarification_request,
            type: "clarification",
          });
        } else {
          const session = new HelperSession({
            initialEditorContent: editorContent,
            textHint: result.text_hint,
            codeHint: result.code_hint,
            solution: result.solution,
            problemDescription: result.problem_description,
            keyConcepts: result.key_concepts,
          });

          setHelperSession(session);
          setIsHelperMode(true);

          addHelperMessage({
            text: `Great! I can see you're working on: ${result.problem_description}\n\nI'm ready to help you solve this step by step. You can use the hint buttons below, or keep editing your code and click "Re-Analyze" for updated guidance! 💪`,
            showControls: true,
          });
        }
      }, 1500);
    } catch (error) {
      console.error("Analysis failed:", error);
      setIsTyping(false);
      addHelperMessage({
        text: `Oops! I had trouble analyzing your code: ${error.message}. Please try again! 😅`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReAnalysis = async () => {
    if (!helperSession) return;

    setIsAnalyzing(true);
    setIsTyping(true);

    try {
      const response = await fetch(`${apiBaseUrl}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: "helper_analyse_prompt",
          userInput: `Current code:\n${editorContent}\n\nTarget solution:\n${helperSession.solution}\n\nOriginal problem: ${helperSession.problemDescription}`,
        }),
      });

      const result = await response.json();

      setTimeout(() => {
        setIsTyping(false);

        helperSession.updateHints(result.text_hint, result.code_hint);

        addHelperMessage({
          text: result.feedback_message,
          progress: result.progress_assessment,
          improvements: result.improvements_made,
          issues: result.issues_found,
          showControls: true,
        });

        setShowHints({ text: false, code: false });
        setHintClicked({ text: false, code: false }); // Buttons wieder aktivieren
        setCodeHintContent(""); // Code-Hint-Editor leeren
      }, 1500);
    } catch (error) {
      console.error("Re-analysis failed:", error);
      setIsTyping(false);
      addHelperMessage({
        text: `I had trouble re-analyzing your code: ${error.message}. Please try again! 😅`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Hint-Buttons: Klick-Status merken
  const [hintClicked, setHintClicked] = useState({ text: false, code: false });
  const handleShowHint = (type) => {
    if (!helperSession) return;
    if (hintClicked[type]) return; // Doppelklick verhindern
    const hint =
      type === "text" ? helperSession.textHint : helperSession.codeHint;
    setShowHints((prev) => ({ ...prev, [type]: true }));
    setHintClicked((prev) => ({ ...prev, [type]: true }));
    if (type === "text") {
      addHelperMessage({
        text: `💡 Text Hint: ${hint}`,
        type: "hint",
      });
    } else if (type === "code") {
      setCodeHintContent(hint || "");
    }
  };

  const handleShowSolution = () => {
    if (!helperSession) return;

    setShowSolution(true);
    setShowGenerateFlashcard(true);

    addHelperMessage({
      text: `Here's the complete solution:\n\n\`\`\`\n${helperSession.solution}\n\`\`\`\n\nDon't worry if you needed to see the solution - that's part of learning! 🎯`,
      type: "solution",
    });
  };

  const handleGenerateFlashcard = async () => {
    if (!helperSession) return;

    setIsTyping(true);

    try {
      const response = await fetch(`${apiBaseUrl}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: "helper_generate_flashcard_prompt",
          userInput: `Initial code:\n${
            helperSession.initialEditorContent
          }\n\nSolution:\n${helperSession.solution}\n\nProblem: ${
            helperSession.problemDescription
          }\n\nKey concepts: ${helperSession.keyConcepts.join(", ")}`,
        }),
      });

      const result = await response.json();

      setTimeout(() => {
        setIsTyping(false);
        addHelperMessage({
          text: `🎴 Perfect! I've created a flashcard for this problem. It will help you remember these concepts: ${result.key_concepts.join(
            ", "
          )}\n\nYou can find it in your flashcard collection for future practice! ✨`,
          type: "success",
        });

        // Here you would typically save the flashcard to your database
        console.log("Generated flashcard:", result);
      }, 1500);
    } catch (error) {
      console.error("Flashcard generation failed:", error);
      setIsTyping(false);
      addHelperMessage({
        text: `I had trouble creating the flashcard: ${error.message}. The learning was still valuable though! 🌟`,
      });
    }
  };

  const resetHelper = () => {
    setHelperSession(null);
    setIsHelperMode(false);
    setShowHints({ text: false, code: false });
    setHintClicked({ text: false, code: false });
    setShowSolution(false);
    setShowGenerateFlashcard(false);
    setHelperMessages([]);
    setEditorContent("");
    setCodeHintContent("");
  };

  useEffect(() => {
    // Fetch API status and available prompts
    const fetchApiStatus = async () => {
      try {
        // Try different possible API endpoints
        const possibleUrls = [
          "http://localhost:5000/api/llm",
          "/api/llm",
          "/api/llm/",
          "http://localhost:3000/api/llm",
        ];

        let response = null;
        let lastError = null;
        let successUrl = null;

        for (const url of possibleUrls) {
          try {
            console.log(`Trying to connect to: ${url}`);
            response = await fetch(url);
            if (response.ok) {
              console.log(`Successfully connected to: ${url}`);
              successUrl = url;
              setApiBaseUrl(url);
              break;
            }
          } catch (err) {
            lastError = err;
            console.log(`Failed to connect to: ${url}`, err.message);
          }
        }

        if (!response || !response.ok) {
          throw new Error(
            lastError?.message || "All connection attempts failed"
          );
        }

        const data = await response.json();
        setApiData(data);

        if (successUrl) {
          setTimeout(async () => {
            setShowTyping3(true);

            const promptsWork = await testPromptsEndpoint(successUrl);
            console.log("Prompts endpoint test result:", promptsWork);

            //await makeTestApiCall(successUrl);

            setTimeout(() => {
              setShowTyping3(false);
              setShowMessage3(true);
            }, 1500);
          }, 1000);
        }
      } catch (error) {
        console.error("Failed to fetch API status:", error);
        setApiData({
          message:
            "Unable to connect to DuggyBuggy API - Please check that your server is running",
          available_prompts: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiStatus();

    const t1 = setTimeout(() => {
      setShowTyping1(false);
      setShowMessage1(true);
      setShowTyping2(true);
    }, 1500);

    const t2 = setTimeout(() => {
      setShowTyping2(false);
      setShowMessage2(true);
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const getLanguageLabel = () => {
    switch (language) {
      case "python":
        return { name: "Python", logo: pythonLogo };
      case "javascript":
        return { name: "JavaScript", logo: jsLogo };
      default:
        return { name: "Unknown", logo: "" };
    }
  };

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      programming: "💻",
      "code-review": "🔍",
      education: "📚",
      debugging: "🐛",
      flashcards: "🎴",
      "project-planning": "📋",
      "error-help": "❗",
      "best-practices": "⭐",
      helper: "🆘",
      trainer: "🏋️",
      test: "🧪",
    };
    return emojiMap[category] || "🔧";
  };

  const renderTestApiResponse = () => {
    if (!testApiResponse) return null;

    if (testApiResponse.error) {
      return (
        <div className="space-y-3">
          <div className="text-red-400">
            <p className="font-medium">❌ Test failed:</p>
            <p className="text-sm">{testApiResponse.error}</p>
          </div>

          <div className="bg-zinc-800 p-3 rounded-lg text-xs space-y-2">
            <p className="text-yellow-400 font-medium">
              🔧 Troubleshooting Tips:
            </p>
            <ul className="text-gray-300 space-y-1">
              <li>• Check if GEMINI_API_KEY is set in your environment</li>
              <li>
                • Verify your backend server is running on the correct port
              </li>
              <li>• Check browser console for detailed error logs</li>
              <li>• Ensure prompts.json file is accessible</li>
              <li>• Verify test_prompt exists in your prompts configuration</li>
            </ul>

            <div className="pt-2 mt-2 border-t border-gray-600">
              <button
                onClick={retryTest}
                className="bg-purple-800 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs transition-colors border border-fuchsia-700/40 shadow-sm"
              >
                🔄 Retry Test
              </button>
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="ml-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
              >
                {showDebugInfo ? "🔽" : "🔼"} Debug Info
              </button>
            </div>

            {showDebugInfo && (
              <div className="mt-2 p-2 bg-zinc-900 rounded text-xs">
                <p className="text-gray-400">API Base URL: {apiBaseUrl}</p>
                <p className="text-gray-400">
                  Available Prompts: {apiData?.available_prompts?.length || 0}
                </p>
                <p className="text-gray-400">
                  Test Endpoint: {apiBaseUrl}/prompt
                </p>
                <p className="text-gray-400">Test Prompt ID: test_prompt</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div>
          <p className="text-green-400 font-medium">
            ✅ Test API Call Successful!
          </p>
          <p className="text-sm text-gray-300">
            Used test_prompt: "Running test to verify API connectivity and
            prompt system"
          </p>
        </div>

        <div className="bg-zinc-800 p-3 rounded-lg text-sm space-y-2">
          <div>
            <span className="text-purple-300 font-medium">🧪 Test Status:</span>
            <p className="text-gray-200">
              {testApiResponse.test_successful ? (
                <span className="text-green-400">✅ Test Successful</span>
              ) : (
                <span className="text-red-400">❌ Test Failed</span>
              )}
            </p>
          </div>

          <div>
            <span className="text-purple-300 font-medium">Test Message:</span>
            <p className="text-gray-200">
              {testApiResponse.test_message || "No test message received"}
            </p>
          </div>

          <div className="pt-2 mt-2 border-t border-gray-600">
            <button
              onClick={retryTest}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
            >
              🔄 Test Again
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          🎉 DuggyBuggy AI is working perfectly! The test_prompt is functioning
          correctly.
        </p>
      </div>
    );
  };

  const renderHelperMessage = (message, index) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start gap-2"
      >
        <img
          src={duggyLogo}
          alt="Duggy"
          className="w-8 h-8 mt-3 scale-x-[-1]"
        />
        <div className="bg-zinc-900/70 border border-purple-900/30 p-4 rounded-xl relative before:content-[''] before:absolute before:top-4 before:-left-2 before:border-8 before:border-transparent before:border-r-purple-900/40">
          <div className="space-y-3">
            <p className="leading-relaxed text-left whitespace-pre-line">
              {message.text}
            </p>

            {message.improvements && message.improvements.length > 0 && (
              <div className="bg-green-900/30 p-2 rounded">
                <p className="text-green-300 font-medium text-sm">
                  ✅ Great improvements:
                </p>
                <ul className="text-sm mt-1">
                  {message.improvements.map((item, i) => (
                    <li key={i} className="text-green-200">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {message.issues && message.issues.length > 0 && (
              <div className="bg-yellow-900/30 p-2 rounded">
                <p className="text-yellow-300 font-medium text-sm">
                  🔍 Areas to work on:
                </p>
                <ul className="text-sm mt-1">
                  {message.issues.map((item, i) => (
                    <li key={i} className="text-yellow-200">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Die Hint-Buttons sind jetzt oben, daher hier entfernt */}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#18181b] via-[#232136] to-zinc-900 text-white relative overflow-x-hidden">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="p-8 pt-4 h-[calc(100vh-80px)] flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
        {/* Editor Panel */}
        <section
          className={`md:w-1/2 w-full flex flex-col gap-6 ${glassBg} rounded-3xl p-8 transition-all duration-300`}
        >
          <div className="flex justify-between items-center mb-2">
            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r ${accent} shadow-md border border-purple-700/60 hover:scale-105 hover:shadow-fuchsia-700/30 transition-all`}
                >
                  <img
                    src={getLanguageLabel().logo}
                    alt={language}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-semibold text-white">
                    {getLanguageLabel().name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-purple-200" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border border-purple-800 text-white">
                <DropdownMenuItem onClick={() => setLanguage("python")}>
                  {" "}
                  <img
                    src={pythonLogo}
                    alt="Python"
                    className="w-4 h-4 mr-2"
                  />{" "}
                  Python{" "}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("javascript")}>
                  {" "}
                  <img
                    src={jsLogo}
                    alt="JavaScript"
                    className="w-4 h-4 mr-2"
                  />{" "}
                  JavaScript{" "}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* HINT BUTTONS: Sichtbar in Helper Mode */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                onClick={() => isHelperMode && handleShowHint("text")}
                className="border-purple-700 text-purple-200 hover:bg-purple-900/40 rounded-full px-4 py-1 text-xs font-semibold shadow-sm"
                disabled={!isHelperMode || hintClicked.text}
              >
                💡 Text Hint
              </Button>
              <Button
                variant="outline"
                onClick={() => isHelperMode && handleShowHint("code")}
                className="border-fuchsia-700 text-fuchsia-200 hover:bg-fuchsia-900/40 rounded-full px-4 py-1 text-xs font-semibold shadow-sm"
                disabled={!isHelperMode || hintClicked.code}
              >
                🔧 Code Hint
              </Button>
            </div>
          </div>

          {/* Mode Indicator */}
          <div className="flex items-center space-x-3">
            {isHelperMode && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-900/80 to-fuchsia-900/80 px-3 py-1 rounded-full shadow animate-pulse border border-fuchsia-700/40">
                <span className="w-3 h-3 bg-fuchsia-400 rounded-full" />
                <span className="text-xs text-fuchsia-100 font-semibold">
                  Helper Mode
                </span>
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="flex-grow rounded-2xl overflow-hidden border border-purple-800/30 shadow-lg">
            <Editor
              language={language}
              ref={editorRef}
              value={editorContent}
              onChange={setEditorContent}
            />
          </div>

          {/* Code-Hint Editor (nur sichtbar, wenn codeHintContent vorhanden) */}
          {codeHintContent && (
            <div className="mt-4">
              <label className="block mb-2 text-sm font-semibold text-fuchsia-300">
                Code Hint
              </label>
              <div className="rounded-2xl overflow-hidden border border-fuchsia-700/40 shadow-lg bg-zinc-900/60">
                <Editor
                  language={language}
                  value={codeHintContent}
                  onChange={() => {}}
                  readOnly={true}
                  options={{ readOnly: true, minimap: { enabled: false } }}
                  height="180px"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-2">
            <Button
              onClick={isHelperMode ? handleReAnalysis : handleInitialAnalysis}
              disabled={
                isAnalyzing ||
                !apiBaseUrl ||
                (isHelperMode && (!hintClicked.text || !hintClicked.code))
              }
              className="bg-gradient-to-r from-purple-700 via-fuchsia-700 to-purple-500 text-white font-semibold px-8 py-2 rounded-full shadow-xl hover:scale-105 hover:shadow-fuchsia-700/30 transition-all disabled:opacity-50"
            >
              {isAnalyzing
                ? "Analyzing..."
                : isHelperMode
                ? "Re-Analyze"
                : "Analyze"}
            </Button>
            <Button
              variant="outline"
              onClick={resetHelper}
              className="border-fuchsia-700 text-fuchsia-300 hover:bg-fuchsia-900/40 rounded-full"
            >
              Reset
            </Button>
          </div>
        </section>

        {/* Chat Panel */}
        <section
          className={`md:w-1/2 w-full flex flex-col gap-4 max-h-[80vh] overflow-y-auto ${glassBg} rounded-3xl p-8 transition-all duration-300`}
        >
          <div className="space-y-6">
            {showTyping1 && (
              <div className="flex items-start gap-3">
                <img
                  src={duggyLogo}
                  alt="Duggy"
                  className="w-9 h-9 mt-1 scale-x-[-1] drop-shadow-lg"
                />
                <div className="bg-gradient-to-r from-zinc-800/80 to-purple-900/60 px-5 py-3 rounded-2xl italic text-base text-fuchsia-200 animate-pulse shadow border border-fuchsia-800/30">
                  Duggy is typing...
                </div>
              </div>
            )}

            {showMessage1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <img
                  src={duggyLogo}
                  alt="Duggy"
                  className="w-9 h-9 mt-3 scale-x-[-1] drop-shadow-lg"
                />
                <div
                  className={`${cardBg} p-6 rounded-2xl shadow-xl border border-purple-800/40 relative before:content-[''] before:absolute before:top-6 before:-left-3 before:border-8 before:border-transparent before:border-r-purple-900/40`}
                >
                  <p className="leading-relaxed text-left text-lg font-medium">
                    Hi, welcome to{" "}
                    <span className="text-fuchsia-300 font-bold">
                      DuggyBuggy
                    </span>
                    ! 👋
                    <br />
                    I'm Duggy, your friendly programming mentor.
                    <br />
                    Let me check my systems...
                  </p>
                </div>
              </motion.div>
            )}

            {showTyping2 && (
              <div className="flex items-start gap-3">
                <img
                  src={duggyLogo}
                  alt="Duggy"
                  className="w-9 h-9 mt-1 scale-x-[-1] drop-shadow-lg"
                />
                <div className="bg-gradient-to-r from-zinc-800/80 to-purple-900/60 px-5 py-3 rounded-2xl italic text-base text-fuchsia-200 animate-pulse shadow border border-fuchsia-800/30">
                  Duggy is typing...
                </div>
              </div>
            )}

            {showMessage2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <img
                  src={duggyLogo}
                  alt="Duggy"
                  className="w-9 h-9 mt-3 scale-x-[-1] drop-shadow-lg"
                />
                <div
                  className={`${cardBg} p-6 rounded-2xl shadow-xl border border-purple-800/40 relative before:content-[''] before:absolute before:top-6 before:-left-3 before:border-8 before:border-transparent before:border-r-purple-900/40`}
                >
                  {isLoading ? (
                    <p className="leading-relaxed text-left text-lg font-medium">
                      Connecting to my learning modules...
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="leading-relaxed text-left text-lg font-medium">
                          <span className="text-green-400">
                            ✅ System Status:
                          </span>{" "}
                          {apiData?.message || "Connected successfully!"}
                        </p>
                      </div>
                      <div>
                        <p className="text-fuchsia-300 font-semibold mb-2">
                          Available Learning Modes:
                        </p>
                        <div className="space-y-1 text-base">
                          {apiData?.available_prompts?.map((prompt, index) => (
                            <div
                              key={prompt.id}
                              className="flex items-center gap-2 text-fuchsia-100"
                            >
                              <span>{getCategoryEmoji(prompt.category)}</span>
                              <span className="font-medium text-fuchsia-200">
                                {prompt.name}
                              </span>
                            </div>
                          )) || (
                            <p className="text-red-400">
                              No learning modes available
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-purple-800/50">
                        <p className="text-base leading-relaxed">
                          Now let me test my AI capabilities using the
                          test_prompt...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {showTyping3 && (
              <div className="flex items-start gap-3">
                <img
                  src={duggyLogo}
                  alt="Duggy"
                  className="w-9 h-9 mt-1 scale-x-[-1] drop-shadow-lg"
                />
                <div className="bg-gradient-to-r from-zinc-800/80 to-purple-900/60 px-5 py-3 rounded-2xl italic text-base text-fuchsia-200 animate-pulse shadow border border-fuchsia-800/30">
                  Running test_prompt to verify AI capabilities...
                </div>
              </div>
            )}

            {showMessage3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <img
                  src={duggyLogo}
                  alt="Duggy"
                  className="w-9 h-9 mt-3 scale-x-[-1] drop-shadow-lg"
                />
                <div
                  className={`${cardBg} p-6 rounded-2xl shadow-xl border border-purple-800/40 relative before:content-[''] before:absolute before:top-6 before:-left-3 before:border-8 before:border-transparent before:border-r-purple-900/40`}
                >
                  {renderTestApiResponse()}
                  <div className="mt-4 pt-3 border-t border-purple-800/50">
                    <p className="text-base leading-relaxed">
                      Paste your code in the editor and click{" "}
                      <span className="text-fuchsia-300 font-semibold">
                        Analyze
                      </span>{" "}
                      to get started! I'm ready to help you learn and improve
                      your programming skills. 🚀
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Helper Mode Messages */}
            {helperMessages.map((message, index) =>
              renderHelperMessage(message, index)
            )}

            {/* Typing indicator for helper mode */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <img
                  src={duggyLogo}
                  alt="Duggy"
                  className="w-9 h-9 mt-1 scale-x-[-1] drop-shadow-lg"
                />
                <div className="bg-gradient-to-r from-purple-800/60 to-fuchsia-800/60 px-5 py-3 rounded-2xl italic text-base text-fuchsia-200 animate-pulse shadow">
                  Duggy is analyzing your code...
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Floating Action Button für zukünftige Features (z.B. Chat öffnen) */}
        {/*
        <button className={floatingBtn} title="Chat öffnen">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          </svg>
        </button>
        */}
      </main>
    </div>
  );
}
