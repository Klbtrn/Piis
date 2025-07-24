import { useState, useEffect } from "react";
import beautify from "js-beautify";
// Hilfsfunktion: Formatiert Code je nach Sprache
async function formatCodeByLanguage(code, lang) {
  if (!code) return "";
  if (lang === "javascript") {
    try {
      const formatted = beautify.js(code, {
        indent_size: 2,
        space_in_empty_paren: true,
      });
      console.log("[Formatter] JavaScript-Formatierung aktiv");
      return formatted;
    } catch (e) {
      console.log("[Formatter] JavaScript-Formatierung Fehler", e);
      return code;
    }
  }
  if (lang === "python") {
    try {
      const response = await fetch("http://localhost:5000/api/format/python", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error("Backend-Formatierung fehlgeschlagen");
      const data = await response.json();
      console.log("[Formatter] Python-Formatierung aktiv (Backend)");
      return data.formatted || code;
    } catch (e) {
      console.log("[Formatter] Python-Formatierung Fehler (Backend)", e);
      return code;
    }
  }
  console.log(
    "[Formatter] Keine Formatierung angewendet (Sprache: ",
    lang,
    ")"
  );
  return code;
}
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Editor from "@/components/Editor";
import SpacedRepetitionSystem from "@/lib/SpacedRepetitionSystem";

// Logos
import pythonLogo from "/src/assets/python-logo.png";
import jsLogo from "/src/assets/js-logo.png";
import duggyLogo from "/src/assets/duggy-logo.png";

import Navbar from "@/components/Navbar";

export default function TrainerPage() {
  const { id } = useParams();
  const [flashcard, setFlashcard] = useState(null);
  const [apiBaseUrl, setApiBaseUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [duggyMessage, setDuggyMessage] = useState(null);
  const [taskEditorContent, setTaskEditorContent] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [cardCompleted, setCardCompleted] = useState(false);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [solutionUsed, setSolutionUsed] = useState(false);
  const [buttonsDeactivated, setButtonsDeactivated] = useState({ examMode: false, textHint: false, codeHint: false , analyze: false, solution: false });
  const [examMode, setExamMode] = useState(false);
  const [showBackToFlashcard, setShowBackToFlashcard] = useState(false);

  // Load flashcard data
  useEffect(() => {
    const fetchFlashcard = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/flashcards/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received flashcard data:', data);
        setFlashcard({ ...data, status: "InProgress" });
        
        // Set initial content immediately after receiving data
        const formattedTaskCode = await formatCodeByLanguage(data.taskCode, data.language);
        setTaskEditorContent(formattedTaskCode || "No task code available");
        setDuggyMessage(data.taskText || "No task text available");
      } catch (err) {
        console.error("Error fetching flashcard:", err);
        setDuggyMessage("Error loading flashcard 😢");
      }
    };

    fetchFlashcard();
  }, [id]);

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
      } catch (error) {
        console.error("Failed to fetch API status:", error);
      }
    };

    fetchApiStatus();
  }, []);

  const getLanguageLabel = () => {
    switch (flashcard?.language) {
      case "python":
        return { name: "Python", logo: pythonLogo };
      case "javascript":
        return { name: "JavaScript", logo: jsLogo };
      default:
        return { name: "Unknown", logo: null };
    }
  };

  const handleTextHint = () => {
    setDuggyMessage(flashcard?.hintText || "No text hint available");
    setHintsUsedCount((prev) => prev + 1);
    setButtonsDeactivated((prev) => ({ ...prev, textHint: true }));
    console.log("Text hint requested");
  };

  const handleCodeHint = async () => {
    const formattedCodeHint = await formatCodeByLanguage(flashcard?.hintCode, flashcard?.language);
    setTaskEditorContent(formattedCodeHint || "No code hint available");
    setHintsUsedCount((prev) => prev + 1);
    setButtonsDeactivated((prev) => ({ ...prev, codeHint: true }));
    console.log("Code hint requested");
  };

  const handleCardCompletion = async () => {
    if (!flashcard || cardCompleted) return;

    try {
      // Process through spaced repetition system
      const updatedCard = SpacedRepetitionSystem.processCardCompletion({
        ...flashcard,
        hintsUsed: hintsUsedCount,
        hintCount: flashcard.hintCount || 2,
      });

      // Save updated card to database
      const response = await fetch(
        `http://localhost:5000/api/flashcards/${flashcard._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCard),
        }
      );

      if (response.ok) {
        const performanceScore =
          SpacedRepetitionSystem.calculatePerformanceScore(
            hintsUsedCount,
            flashcard.hintCount || 2,
            (flashcard.attempts || 0) + 1
          );

        const completionMessage = `🎉 Excellent work! This card will return for review in ${updatedCard.currentInterval} days. ` +
            `Performance score: ${(performanceScore * 100).toFixed(0)}%`
        setDuggyMessage(completionMessage);
        setCardCompleted(true);
      }
    } catch (error) {
      console.error("Failed to update card:", error);
      setDuggyMessage(
        "Oops! I couldn't save your progress. But great job solving it! 🎉"
      );
    }
  };

  const handleSolution = async () => {
    const formattedSolution = await formatCodeByLanguage(flashcard?.solution, flashcard?.language);
    setTaskEditorContent(formattedSolution || "No solution available");
    setButtonsDeactivated((prev) => ({ ...prev, textHint: true, codeHint: true, analyze: true, solution: true }));
    setSolutionUsed(true);

    if (flashcard?.status !== 'Done') {
      const updatedCard = { ...flashcard, status: 'Repeat' };
      setFlashcard(updatedCard);
      console.log(`updating flashcard because solution was pressed: ${updatedCard}`);
      try {
        // Save updated card to database
        const response = await fetch(
          `http://localhost:5000/api/flashcards/${flashcard._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCard)
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update card status:" + response.statusText);
        }
      } catch (error) {
        console.error("Failed to update card:", error);
        setDuggyMessage(
          "Oops! I couldn't save your progress. 😖"
        );
      }
    }
    setCardCompleted(true);
    setDuggyMessage("I've revealed the solution. Take your time to understand it thoroughly! This card will be up for another try to ensure mastery. 💪");
    console.log("Solution requested");
  };

  const handleAnalysis = async () => {
    console.log("Analysis requested");
    if (!editorContent.trim()) {
      setDuggyMessage(
        "I don't see any code to analyze! Please paste your code in the editor first. 🤔"
      );
      return;
    }

    setIsAnalyzing(true);
    setDuggyMessage("Analyzing your code... ⏳");

    try {
      const response = await fetch(`${apiBaseUrl}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: "trainer_analyse_prompt",
          userInput: `Please analyze this code and compare it to this solution:${flashcard?.solution}\n\ncode:\n\n${editorContent}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setIsAnalyzing(false);

      setTimeout(() => {
        if (result?.needs_clarification) {
          setDuggyMessage(`${result.clarification_request}`);
        } else {
          // setDuggyMessage(`${result.feedback_message}`);   Commented out to avoid double Message
          if (examMode && result.mastered) {
            flashcard.status = 'Done';
            setFlashcard((prev) => ({...prev, status: 'Done'}));
            handleCardCompletion();
          } else if (!examMode && result.mastered) {
            flashcard.status = 'InProgress';
            setFlashcard((prev) => ({...prev, status: 'InProgress'}));
            handleCardCompletion();
          } else if (!result.mastered) {
            const updatedCard = { ...flashcard, hintsUsedOverall: (flashcard.hintsUsedOverall || 0) + hintsUsedCount, attempts: (flashcard.attempts || 0) + 1, status: 'InProgress' };
            setFlashcard(updatedCard);
            console.log(`updating flashcard because analyze was pressed but the given code wrong: ${updatedCard}`);
            const updateCardStatus = async () => {
              try {
                // Save updated card to database
                const response = await fetch(
                  `http://localhost:5000/api/flashcards/${flashcard._id}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedCard)
                  }
                );
                if (!response.ok) {
                  throw new Error("Failed to update card status:" + response.statusText);
                }
              } catch (error) {
                console.error("Failed to update card:", error);
                setDuggyMessage(
                  "Oops! I couldn't save your progress. 😖"
                );
              }
            };
            updateCardStatus();
            setShowBackToFlashcard(true);
            setExamMode(false);
            setButtonsDeactivated({ ...buttonsDeactivated, examMode: true });
            setDuggyMessage(result.feedback_message || "Your code has some issues. Please review the feedback and try again!");
          }
        }
      }, 1500);
    } catch (error) {
      console.error("Analysis failed:", error);
      setDuggyMessage(
        `Oops! I had trouble analyzing your code: ${error.message}. Please try again! 😅`
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#18181b] via-[#232136] to-zinc-900 text-white relative overflow-x-hidden">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="p-8 pt-4 flex flex-col gap-3 max-w-[1800px] mx-auto items-stretch">
        <section className="flex flex-col gap-3">
          {/* Language Indicator über die ganze Seite */}
          <div className="w-full flex justify-between mt-3">
            <button className="flex items-center gap-2 bg-zinc-950 border border-purple-500 rounded-full px-5 py-2 shadow-md">
              {getLanguageLabel().logo && (
                <img
                  src={getLanguageLabel().logo}
                  alt={flashcard?.language}
                  className="w-5 h-5"
                />
              )}
              <span className="text-sm font-medium text-white">
                {getLanguageLabel().name}
              </span>
            </button>
            <Button
              className="flex items-center bg-gradient-to-r from-purple-600/20 via-fuchsia-500/20 to-purple-400/20 border border-purple-500 rounded-full px-5 py-2 shadow-md hover:scale-105 hover:shadow-xl transition-all"
              onClick={() => setExamMode(true)}
              disabled={ cardCompleted || examMode || hintsUsedCount > 0 || solutionUsed || buttonsDeactivated.examMode }
            >
              { examMode ? <p>🟢</p> : <p>🔴</p> }
              <span className="text-sm font-medium text-white">Exam Mode</span>
            </Button>
          </div>
          {/* Editoren nebeneinander */}
          <div className="flex flex-row gap-12 items-start w-full">
            {/* Task Editor */}
            <div className="flex-1 flex flex-col">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="flex-1 flex items-center justify-center relative"
                style={{ minHeight: "48vh" }}
              >
                <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl bg-white/10 backdrop-blur-lg border border-purple-500 rounded-2xl shadow-2xl transition-all hover:shadow-[0_0_32px_4px_rgba(168,85,247,0.5)] p-4 mt-2 relative">
                  <span className="absolute top-4 right-6 bg-purple-700/80 text-white px-3 py-1 rounded-full text-xs font-semibold shadow border border-purple-500/40 z-10">
                    Task
                  </span>
                  <Editor
                    height="48vh"
                    language={flashcard?.language}
                    value={taskEditorContent}
                    editable={false}
                  />
                </div>
              </motion.div>
            </div>
            {/* Solution Editor */}
            <div className="flex-1 flex flex-col">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="flex-1 flex items-center justify-center"
                style={{ minHeight: "48vh" }}
              >
                <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl bg-white/10 backdrop-blur-lg border border-purple-500 rounded-2xl shadow-2xl transition-all hover:shadow-[0_0_32px_4px_rgba(168,85,247,0.5)] p-4 mt-2 relative">
                  <span className="absolute top-4 right-6 bg-purple-700/80 text-white px-3 py-1 rounded-full text-xs font-semibold shadow border border-purple-500/40 z-10">
                    Your Solution
                  </span>
                  <Editor
                    height="48vh"
                    language={flashcard?.language}
                    editable={true}
                    onChange={(val) => {
                      setEditorContent(val);
                    }}
                  />
                </div>
              </motion.div>
              {/* Buttons unter dem Editor */}
              <div
                className="flex flex-row gap-3 mt-4 justify-end items-start"
                style={{ minHeight: "48px" }}
              >
                <Button
                  variant="outline"
                  className="border-purple-700 text-purple-200 hover:bg-purple-900/40 rounded-full px-4 py-1 text-xs font-semibold shadow-sm"
                  onClick={handleTextHint}
                  disabled={buttonsDeactivated.textHint || cardCompleted || examMode}
                >
                  💡 Text Hint
                </Button>
                <Button
                  variant="outline"
                  className="border-fuchsia-700 text-fuchsia-200 hover:bg-fuchsia-900/40 rounded-full px-4 py-1 text-xs font-semibold shadow-sm"
                  onClick={handleCodeHint}
                  disabled={buttonsDeactivated.codeHint || cardCompleted || examMode}
                >
                  🔧 Code Hint
                </Button>
                <Button
                  className="px-4 py-1 rounded-full font-bold text-white text-xs bg-gradient-to-r from-fuchsia-600 via-purple-500 to-fuchsia-400 shadow-2xl border-2 border-fuchsia-300 transition-all z-20 ml-2 animate-pulse hover:scale-105 hover:shadow-fuchsia-500/50"
                  onClick={handleSolution}
                  disabled={buttonsDeactivated.solution || cardCompleted || examMode}
                >
                  🎯 Solution
                </Button>

                {/* Add back to flashcards button */}
                {(cardCompleted || solutionUsed || showBackToFlashcard) && (
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all"
                    onClick={() => window.history.back()}
                  >
                    🏠 Back to Flashcards
                  </Button>
                )}

                <Button
                  className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-400 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all"
                  onClick={handleAnalysis}
                  disabled={buttonsDeactivated.analyze || cardCompleted}
                >
                  Analyze
                </Button>
              </div>
            </div>
          </div>
          {/* Duggy Messages unter den Editoren */}
          <div className="flex flex-row gap-12 items-start w-full">
            <div className="flex-1 flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="flex items-start"
                style={{ minHeight: "64px" }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-900 via-purple-900 to-zinc-800 flex items-center justify-center shadow-lg border-2 border-purple-700">
                      <img
                        src={duggyLogo}
                        alt="Duggy Logo"
                        className="w-12 h-12 object-contain scale-x-[-1]"
                      />
                    </div>
                    <span className="mt-2 text-xs font-semibold text-purple-300 tracking-wide">
                      Duggy
                    </span>
                  </div>
                  <div className="relative flex flex-col">
                    <div className="bg-gradient-to-br from-purple-900 via-fuchsia-900 to-purple-700 text-white px-6 py-4 rounded-2xl shadow-xl border border-purple-500/40 min-w-[180px] max-w-xl relative">
                      <span className="absolute -left-2 top-5 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-purple-900"></span>
                      <p className="leading-relaxed text-left whitespace-pre-line font-medium">
                        {duggyMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
