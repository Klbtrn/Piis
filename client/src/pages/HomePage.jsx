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
import { Link } from "react-router-dom";

// Logos
import pythonLogo from "/src/assets/python-logo.png";
import jsLogo from "/src/assets/js-logo.png";
import duggyLogo from "/src/assets/duggy-logo.png";

import Navbar from "@/components/Navbar";

export default function HomePage() {
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

  const makeTestApiCall = async (baseUrl) => {
    try {
      console.log('Making test API call...');
      const response = await fetch(`${baseUrl}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: 'concept_explanation',
          userInput: 'Explain what variables are in programming'
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
          const errorBody = await response.text();
          console.log('Error response body:', errorBody);
          const errorJson = JSON.parse(errorBody);
          errorDetails = errorJson.error || errorJson.details || errorDetails;
          if (errorJson.details) {
            errorDetails += ` - ${errorJson.details}`;
          }
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      console.log('Test API response:', data);
      setTestApiResponse(data);
      return data;
    } catch (error) {
      console.error('Test API call failed:', error);
      setTestApiResponse({
        error: `Test API call failed: ${error.message}`
      });
      return null;
    }
  };

  const testPromptsEndpoint = async (baseUrl) => {
    try {
      const response = await fetch(`${baseUrl}/prompts`);
      if (response.ok) {
        const data = await response.json();
        console.log('Prompts endpoint working:', data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Prompts endpoint failed:', error);
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

  useEffect(() => {
    // Fetch API status and available prompts
    const fetchApiStatus = async () => {
      try {
        // Try different possible API endpoints
        const possibleUrls = [
          'http://localhost:5000/api/llm',
          '/api/llm',
          '/api/llm/',
          'http://localhost:3000/api/llm'
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
          throw new Error(lastError?.message || 'All connection attempts failed');
        }
        
        const data = await response.json();
        setApiData(data);

        if (successUrl) {
          setTimeout(async () => {
            setShowTyping3(true);
            
            const promptsWork = await testPromptsEndpoint(successUrl);
            console.log('Prompts endpoint test result:', promptsWork);
            
            await makeTestApiCall(successUrl);
            
            setTimeout(() => {
              setShowTyping3(false);
              setShowMessage3(true);
            }, 1500);
          }, 1000);
        }
        
      } catch (error) {
        console.error('Failed to fetch API status:', error);
        setApiData({ 
          message: "Unable to connect to DuggyBuggy API - Please check that your server is running",
          available_prompts: []
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
      'programming': '💻',
      'code-review': '🔍',
      'education': '📚',
      'debugging': '🐛',
      'flashcards': '🎴',
      'project-planning': '📋',
      'error-help': '❗',
      'best-practices': '⭐'
    };
    return emojiMap[category] || '🔧';
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
            <p className="text-yellow-400 font-medium">🔧 Troubleshooting Tips:</p>
            <ul className="text-gray-300 space-y-1">
              <li>• Check if GEMINI_API_KEY is set in your environment</li>
              <li>• Verify your backend server is running on the correct port</li>
              <li>• Check browser console for detailed error logs</li>
              <li>• Ensure prompts.json file is accessible</li>
            </ul>
            
            <div className="pt-2 mt-2 border-t border-gray-600">
              <button 
                onClick={retryTest}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs transition-colors"
              >
                🔄 Retry Test
              </button>
              <button 
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="ml-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
              >
                {showDebugInfo ? '🔽' : '🔼'} Debug Info
              </button>
            </div>
            
            {showDebugInfo && (
              <div className="mt-2 p-2 bg-zinc-900 rounded text-xs">
                <p className="text-gray-400">API Base URL: {apiBaseUrl}</p>
                <p className="text-gray-400">Available Prompts: {apiData?.available_prompts?.length || 0}</p>
                <p className="text-gray-400">Test Endpoint: {apiBaseUrl}/prompt</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div>
          <p className="text-green-400 font-medium">✅ Test API Call Successful!</p>
          <p className="text-sm text-gray-300">Asked: "Explain what variables are in programming"</p>
        </div>
        
        <div className="bg-zinc-800 p-3 rounded-lg text-sm space-y-2">
          <div>
            <span className="text-purple-300 font-medium">Concept:</span>
            <p className="text-gray-200">{testApiResponse.concept_name || 'N/A'}</p>
          </div>
          
          <div>
            <span className="text-purple-300 font-medium">Simple Explanation:</span>
            <p className="text-gray-200">{testApiResponse.simple_explanation || 'N/A'}</p>
          </div>
          
          {testApiResponse.real_world_analogy && (
            <div>
              <span className="text-purple-300 font-medium">Analogy:</span>
              <p className="text-gray-200">{testApiResponse.real_world_analogy}</p>
            </div>
          )}
          
          {testApiResponse.key_takeaways && testApiResponse.key_takeaways.length > 0 && (
            <div>
              <span className="text-purple-300 font-medium">Key Points:</span>
              <ul className="text-gray-200 text-xs mt-1 space-y-1">
                {testApiResponse.key_takeaways.slice(0, 3).map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
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
          🎉 DuggyBuggy AI is working perfectly! Ready to help you learn.
        </p>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900 text-white">
      {/* Navigation */}
      <Navbar />

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
                    Hi, welcome to DuggyBuggy! 👋
                    <br />
                    I'm Duggy, your friendly programming mentor.
                    <br />
                    Let me check my systems...
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
                  {isLoading ? (
                    <p className="leading-relaxed text-left">
                      Connecting to my learning modules...
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="leading-relaxed text-left">
                          <span className="text-green-400">✅ System Status:</span> {apiData?.message || "Connected successfully!"}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-purple-300 font-medium mb-2">Available Learning Modes:</p>
                        <div className="space-y-1 text-sm">
                          {apiData?.available_prompts?.map((prompt, index) => (
                            <div key={prompt.id} className="flex items-center gap-2 text-gray-300">
                              <span>{getCategoryEmoji(prompt.category)}</span>
                              <span className="font-medium text-purple-200">{prompt.name}</span>
                            </div>
                          )) || (
                            <p className="text-red-400">No learning modes available</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-purple-800/50">
                        <p className="text-sm leading-relaxed">
                          Now let me test my AI capabilities...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {showTyping3 && (
              <div className="flex items-start gap-2">
                <img
                  src={duggyLogo}
                  alt="Duggy"
                  className="w-8 h-8 mt-1 scale-x-[-1]"
                />
                <div className="bg-purple-900/30 px-4 py-2 rounded-xl italic text-sm text-purple-300 animate-pulse">
                  Testing AI capabilities...
                </div>
              </div>
            )}

            {showMessage3 && (
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
                  {renderTestApiResponse()}
                  <div className="mt-4 pt-3 border-t border-purple-800/50">
                    <p className="text-sm leading-relaxed">
                      Paste your code in the editor and click <span className="text-purple-300 font-medium">Analyze</span> to get started! 
                      I'm ready to help you learn and improve your programming skills. 🚀
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}