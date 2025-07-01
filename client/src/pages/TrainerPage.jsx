import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Editor from "@/components/Editor";

// Logos
import pythonLogo from "/src/assets/python-logo.png";
import jsLogo from "/src/assets/js-logo.png";
import duggyLogo from "/src/assets/duggy-logo.png";

import Navbar from "@/components/Navbar";

export default function HomePage() {
  const [language, setLanguage] = useState("python");

  const task_text = " \"\"\" TASK: Implement Bubble Sort \n\n You are given a list of integers. \n Your task is to sort the list in ascending order using the Bubble Sort algorithm. \n\n Do NOT use Python's built-in sort functions (e.g., sorted(), list.sort()). \n Implement the sorting manually using the Bubble Sort technique. \n\n Function Signature: \n def bubble_sort(arr: list[int]) -> list[int]: \n\n Example: \n Input: [5, 1, 4, 2, 8] \n Output: [1, 2, 4, 5, 8] \n\n \"\"\" \n\n def bubble_sort(arr: list[int]) -> list[int]:\n    # TODO: Implement Bubble Sort here\n    pass\n\n# === Test cases ===\nprint(bubble_sort([5, 1, 4, 2, 8]))      # Expected: [1, 2, 4, 5, 8]\nprint(bubble_sort([64, 34, 25, 12, 22])) # Expected: [12, 22, 25, 34, 64]";

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

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900 text-white">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="p-6 h-[calc(100vh-80px)] flex flex-col gap-4">
        <div className="flex mb-4">
          
          {/* Left Side */}
          <div className="w-2/5 h-full">
            {/* Language Indicator */}
            <div className="mb-4">
              <button className="flex items-center gap-2 bg-zinc-950 border border-purple-500 rounded-full px-4 py-2">
                <img
                  src={getLanguageLabel().logo}
                  alt={language}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-white">
                  {getLanguageLabel().name}
                </span>
              </button>
            </div>

            {/* Task */}
            <div className="h-3/5 flex gap-4">
              <Editor language={language} code={task_text} editable={false}/>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="flex items-start mt-4"
            >
              {/* Duggy Logo */}
              <div >
                <img src={duggyLogo} alt="Duggy Logo" className="scale-x-[-1] w-24 h-24" />
              </div>
              {/* Duggy Messages */}
              <div className="flex bg-purple-900/40 mt-4 p-4 rounded-xl relative r-transparent before:content-[''] before:absolute before:top-5 before:-left-2 before:border-8 before:border-transparent before:border-r-purple-900/40">
                <p className="leading-relaxed text-left">
                  Feel free to check your code when you're ready 😎
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side */}
          <div className="w-3/5 h-full flex flex-col gap-4">
            {/* Editor */}
            <div className="pl-12 gap-4">
              <Editor language={language} editable={true}/>
            </div>
            {/* Check Button */}
            <div className="flex ml-auto mb-4">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold px-6 py-2 rounded-full hover:opacity-90 transition-all">
                Check
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
