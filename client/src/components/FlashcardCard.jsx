import clsx from "clsx";
import pythonLogo from "/src/assets/python-logo.png";
import jsLogo from "/src/assets/js-logo.png";
import { Link } from "react-router-dom";
// import cLogo from "/src/assets/c-logo.png";
// import haskellLogo from "/src/assets/haskell-logo.png";

const languageIcons = {
  python: pythonLogo,
  javascript: jsLogo,
  // c: cLogo,
  // haskell: haskellLogo,
};

export default function FlashcardCard({
  _id,
  prompt,
  task_name,
  language,
  hintCount,
  hintsUsed,
  color = "border-purple-500",
}) {
  // Glassmorphism und modernes Card-Design wie HomePage
  return (
    <Link to={`/trainer/${_id}`} className="block">
      <div
        className={clsx(
          "rounded-2xl border-2 p-5 bg-gradient-to-br from-zinc-950/90 via-purple-950/80 to-zinc-900/80 text-white flex justify-between items-start gap-3 shadow-xl hover:scale-[1.02] hover:shadow-fuchsia-700/30 transition-all duration-200",
          color
        )}
      >
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-base leading-snug mb-1 text-fuchsia-200 drop-shadow">
            {prompt}
          </h3>
          <p className="text-xs text-zinc-400 font-medium">
            {hintsUsed} of {hintCount} hints
          </p>
        </div>
        {language && languageIcons[language.toLowerCase()] && (
          <img
            src={languageIcons[language.toLowerCase()]}
            alt={language}
            className="w-7 h-7 mt-1 drop-shadow-lg border-2 border-fuchsia-500/40 rounded-full bg-zinc-900"
          />
        )}
      </div>
    </Link>
  );
}
