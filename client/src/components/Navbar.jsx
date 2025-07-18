import { Link, useLocation } from "react-router-dom";
import duggyLogo from "/src/assets/duggy-logo.png";

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 border-b border-purple-600">
      <div className="flex items-center space-x-3">
        <img src={duggyLogo} alt="DuggyBuggy Logo" className="w-10 h-10" />
        <span className="text-xl font-bold text-purple-400">DUGGYBUGGY</span>
      </div>
      <ul className="flex space-x-6 text-sm font-medium">
        <li>
          <Link
            to="/"
            className={`hover:text-purple-300 ${
              isActive("/") ? "text-purple-400" : ""
            }`}
          >
            HELPER
          </Link>
        </li>
        <li>
          <Link
            to="/statistics"
            className={`hover:text-purple-300 ${
              isActive("/statistics") ? "text-purple-400" : ""
            }`}
          >
            STATISTICS
          </Link>
        </li>
        <li>
          <Link
            to="/flashcards"
            className={`hover:text-purple-300 ${
              isActive("/flashcards") ? "text-purple-400" : ""
            }`}
          >
            FLASHCARDS
          </Link>
        </li>
      </ul>
    </nav>
  );
}
