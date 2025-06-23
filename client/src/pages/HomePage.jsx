import Editor from "@/components/Editor";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function HomePage() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900 text-white">
      <nav className="w-full flex items-center justify-between px-8 py-4 border-b border-purple-600">
        <div className="flex items-center space-x-3">
          <img
            src="/src/assets/duggy-logo.png"
            alt="DuggyBuggy Logo"
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-purple-400">DUGGYBUGGY</span>
        </div>
        <ul className="flex space-x-6 text-sm font-medium">
          <li className="hover:text-purple-300 cursor-pointer">HOME</li>
          <li className="hover:text-purple-300 cursor-pointer">STATISTICS</li>
          <li className="hover:text-purple-300 cursor-pointer">FLASHCARDS</li>
          <li className="hover:text-purple-300 cursor-pointer">TRAINING</li>
        </ul>
      </nav>

      <main className="p-6 h-[calc(100vh-80px)] flex gap-6">
        <div className="w-1/2 h-full flex flex-col gap-4">
          <div className="flex justify-between">
            <ToggleGroup
              type="single"
              className="rounded-full border border-purple-500 p-1"
            >
              <ToggleGroupItem
                value="python"
                className="data-[state=on]:bg-purple-600 rounded-full px-4 py-1 cursor-pointer"
              >
                Python
              </ToggleGroupItem>
              <ToggleGroupItem
                value="javascript"
                className="data-[state=on]:bg-purple-600 rounded-full px-4 py-1 cursor-pointer"
              >
                JavaScript
              </ToggleGroupItem>
            </ToggleGroup>
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

          <div className="flex-grow">
            <Editor />
          </div>

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

        <div className="w-1/2 h-full overflow-y-auto bg-zinc-900 rounded-xl p-4 border border-purple-800">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-2">
              <img
                src="/src/assets/duggy-logo.png"
                alt="DuggyBuggy Logo"
                className="w-6 h-6 mt-1"
              />
              <div className="bg-purple-900/40 p-4 rounded-xl">
                <p className="leading-relaxed">
                  Hi, welcome to DuggyBuggy 👋
                  <br />
                  I am Duggy and I will help you
                  <br />
                  getting better at programming
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <img
                src="/src/assets/duggy-logo.png"
                alt="DuggyBuggy Logo"
                className="w-6 h-6 mt-1"
              />
              <div className="bg-purple-900/40 p-4 rounded-xl">
                <p className="leading-relaxed">
                  Just copy & paste your code in the
                  <br />
                  Editor on the Left and I will analyze
                  <br />
                  it based on your choice 👨‍💻
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
