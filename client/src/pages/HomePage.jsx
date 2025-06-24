import { useState, useEffect } from "react";
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

// Logos
import pythonLogo from "/src/assets/python-logo.png";
import jsLogo from "/src/assets/js-logo.png";
import duggyLogo from "/src/assets/duggy-logo.png";

export default function HomePage() {
  const [language, setLanguage] = useState("python");
  const [showTyping1, setShowTyping1] = useState(true);
  const [showMessage1, setShowMessage1] = useState(false);
  const [showTyping2, setShowTyping2] = useState(false);
  const [showMessage2, setShowMessage2] = useState(false);

  useEffect(() => {
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

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900 text-white">
      {/* Navigation */}
      <nav className="w-full flex items-center justify-between px-8 py-4 border-b border-purple-600">
        <div className="flex items-center space-x-3">
          <img src={duggyLogo} alt="DuggyBuggy Logo" className="w-10 h-10" />
          <span className="text-xl font-bold text-purple-400">DUGGYBUGGY</span>
        </div>
        <ul className="flex space-x-6 text-sm font-medium">
          <li className="hover:text-purple-300 cursor-pointer text-purple-400">
            HOME
          </li>
          <li className="hover:text-purple-300 cursor-pointer">STATISTICS</li>
          <li className="hover:text-purple-300 cursor-pointer">FLASHCARDS</li>
          <li className="hover:text-purple-300 cursor-pointer">TRAINING</li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="p-6 h-[calc(100vh-80px)] flex gap-6">
        {/* Editor Panel */}
        <div className="w-1/2 h-full flex flex-col gap-4">
          <div className="flex justify-between">
            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 bg-zinc-950 border border-purple-500 rounded-full px-4 py-2 hover:bg-zinc-800 transition">
                  <img
                    src={getLanguageLabel().logo}
                    alt={language}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-white">
                    {getLanguageLabel().name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-purple-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border border-purple-700 text-white">
                <DropdownMenuItem onClick={() => setLanguage("python")}>
                  <img src={pythonLogo} alt="Python" className="w-4 h-4 mr-2" />
                  Python
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("javascript")}>
                  <img src={jsLogo} alt="JavaScript" className="w-4 h-4 mr-2" />
                  JavaScript
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mode Indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-sm">Mistakes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-gray-300 rounded-full" />
                <span className="text-sm">Formatting</span>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-grow">
            <Editor language={language} />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold px-6 py-2 rounded-full hover:opacity-90 transition-all">
              Analyze
            </Button>
            <Button
              variant="outline"
              className="border-purple-600 text-purple-400 hover:bg-purple-900/40 rounded-full"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-1/2 h-full overflow-y-auto bg-zinc-900 rounded-xl p-4 border border-purple-800">
          <div className="space-y-4">
            {showTyping1 && (
              <div className="flex items-start gap-2">
                <img
                  src={duggyLogo}
                  alt="Duggy"
                  className="w-8 h-8 mt-1 scale-x-[-1]"
                />
                <div className="bg-purple-900/30 px-4 py-2 rounded-xl italic text-sm text-purple-300 animate-pulse">
                  Duggy is typing...
                </div>
              </div>
            )}

            {showMessage1 && (
              <motion.div
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
                <div className="bg-purple-900/40 p-4 rounded-xl relative before:content-[''] before:absolute before:top-4 before:-left-2 before:border-8 before:border-transparent before:border-r-purple-900/40">
                  <p className="leading-relaxed text-left">
                    Hi, welcome to DuggyBuggy 👋
                    <br />
                    I am Duggy and I will help you
                    <br />
                    getting better at programming
                  </p>
                </div>
              </motion.div>
            )}

            {showTyping2 && (
              <div className="flex items-start gap-2">
                <img
                  src={duggyLogo}
                  alt="Duggy"
                  className="w-8 h-8 mt-1 scale-x-[-1]"
                />
                <div className="bg-purple-900/30 px-4 py-2 rounded-xl italic text-sm text-purple-300 animate-pulse">
                  Duggy is typing...
                </div>
              </div>
            )}

            {showMessage2 && (
              <motion.div
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
                <div className="bg-purple-900/40 p-4 rounded-xl relative before:content-[''] before:absolute before:top-4 before:-left-2 before:border-8 before:border-transparent before:border-r-purple-900/40">
                  <p className="leading-relaxed text-left">
                    Just copy & paste your code in the
                    <br />
                    editor on the left, and I will analyze
                    <br />
                    it based on your choice 👨‍💻
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
