import { useState, useEffect } from "react";
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
  const [duggyMessage, setDuggyMessage] = useState("Look at the Task in the editor above and try to solve it. If you are stuck feel free to take a hint. And when your code is ready, analyze it 😎");
  const [taskEditorContent, setTaskEditorContent] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [cardCompleted, setCardCompleted] = useState(false);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [completionMessage, setCompletionMessage] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/flashcards/${id}`)
      .then(res => res.json())
      .then(data => {
        setFlashcard(data);
        setTaskEditorContent(data?.task);
      })
      .catch(err => console.error("Error fetching flashcard:", err));
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
        return { name: "Unknown", logo: "" };
    }
  };

  const handleTextHint = () => {
    setDuggyMessage(flashcard?.hintText || "No text hint available");
    setHintsUsedCount(prev => prev + 1);
    console.log("Text hint requested");
  }

  const handleCodeHint = () => {
    setTaskEditorContent(flashcard?.hintCode || "No code hint available");
    setHintsUsedCount(prev => prev + 1);
    console.log("Code hint requested");
  }

   const handleCardCompletion = async () => {
    if (!flashcard || cardCompleted) return;
    
    try {
      // Process through spaced repetition system
      const updatedCard = SpacedRepetitionSystem.processCardCompletion({
        ...flashcard,
        hintsUsed: hintsUsedCount,
        hintCount: flashcard.hintCount || 2
      });
      
      // Save updated card to database
      const response = await fetch(`http://localhost:5000/api/flashcards/${flashcard._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCard)
      });
      
      if (response.ok) {
        setCardCompleted(true);
        const performanceScore = SpacedRepetitionSystem.calculatePerformanceScore(
          hintsUsedCount, 
          flashcard.hintCount || 2, 
          (flashcard.attempts || 0) + 1
        );
        
        setCompletionMessage(
          `🎉 Excellent work! This card will return for review in ${updatedCard.currentInterval} days. ` +
          `Performance score: ${(performanceScore * 100).toFixed(0)}%`
        );
        setDuggyMessage(completionMessage);
      }
    } catch (error) {
      console.error('Failed to update card:', error);
      setDuggyMessage("Oops! I couldn't save your progress. But great job solving it! 🎉");
    }
  };

  const handleSolution = () => {
    setTaskEditorContent(flashcard?.solution || "No solution available");
    console.log("Solution requested");
  }

  const handleAnalysis = async () => {
    console.log("Analysis requested");
    if (!editorContent.trim()) {
      setDuggyMessage("I don't see any code to analyze! Please paste your code in the editor first. 🤔");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: "trainer_analyse_prompt",
          userInput: `Please analyze this code:\n\n${taskEditorContent}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setTimeout(() => {

        if (result?.needs_clarification) {
          setDuggyMessage(`${result.clarification_request}`);
        } else {
          setDuggyMessage(`${result.feedback_message}`);
          // const session = new HelperSession({
          //   initialEditorContent: editorContent,
          //   textHint: result.text_hint,
          //   codeHint: result.code_hint,
          //   solution: result.solution,
          //   problemDescription: result.problem_description,
          //   keyConcepts: result.key_concepts,
          // });

          // setHelperSession(session);
          // setIsHelperMode(true);

          // addHelperMessage({
          //   text: `Great! I can see you're working on: ${result.problem_description}\n\nI'm ready to help you solve this step by step. You can use the hint buttons below, or keep editing your code and click "Re-Analyze" for updated guidance! 💪`,
          //   showControls: true,
          // });
        }
      }, 1500);
    } catch (error) {
      console.error("Analysis failed:", error);
      setDuggyMessage(`Oops! I had trouble analyzing your code: ${error.message}. Please try again! 😅`);
    }
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900 text-white">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="p-6 h-[calc(100vh-80px)] flex flex-row">

        {/* Left Side */}
        <div className="w-2/5 h-full">
          {/* Language Indicator */}
          <div className="mb-4">
            <button className="flex items-center gap-2 bg-zinc-950 border border-purple-500 rounded-full px-4 py-2">
              <img
                src={getLanguageLabel().logo}
                alt={flashcard?.language}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium text-white">
                {getLanguageLabel().name}
              </span>
            </button>
          </div>

          {/* Task */}
          <div className="h-[55vh] flex">
            <Editor height="55vh" language={flashcard?.language} value={taskEditorContent} editable={false}/>
          </div>

          {/* Duggy Messages */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex items-start"
          >
            {/* Duggy Logo */}
            <div >
              <img src={duggyLogo} alt="Duggy Logo" className="scale-x-[-1] w-24 h-24" />
            </div>
            {/* Duggy Messages */}
            <div className="flex w-fit bg-purple-900/40 mt-4 p-4 rounded-xl relative r-transparent before:content-[''] before:absolute before:top-5 before:-left-2 before:border-8 before:border-transparent before:border-r-purple-900/40">
              <p className="leading-relaxed text-left">
                {duggyMessage}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side */}
        <div className="w-3/5 h-full flex flex-col gap-4">
          {/* Editor */}
          <div className="pl-8 gap-4">
            <Editor 
              height="80vh" 
              language={flashcard?.language} 
              editable={true}
              onChange={(val) => {
                  setEditorContent(val);
              }}
            />
          </div>
          {/* Buttons */}
          <div className="flex flex-row">
            <Button
              variant="outline"
              className="ml-8 border-purple-600 text-purple-400 hover:bg-purple-900/40 rounded-full"
              onClick={handleTextHint}
              disabled={cardCompleted}
            >
              💡 Text Hint
            </Button>
            <Button
              variant="outline"
              className="ml-4 border-purple-600 text-purple-400 hover:bg-purple-900/40 rounded-full"
              onClick={handleCodeHint}
              disabled={cardCompleted}
            >
              🔧 Code Hint
            </Button>
            <Button 
              className="ml-4 bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold px-6 py-2 rounded-full hover:opacity-90 transition-all"
              onClick={handleSolution}
              disabled={cardCompleted}
            >
              🎯 Solution
            </Button>
            
            {/* Add completion button */}
            {!cardCompleted ? (
              <Button 
                className="ml-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-full transition-all"
                onClick={handleCardCompletion}
              >
                ✅ Mark Complete
              </Button>
            ) : (
              <Button 
                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full transition-all"
                onClick={() => window.history.back()}
              >
                🏠 Back to Flashcards
              </Button>
            )}
            
            <Button className="ml-auto bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold px-6 py-2 rounded-full hover:opacity-90 transition-all"
              onClick={handleAnalysis}
              disabled={cardCompleted}
            >
              Analyze
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}