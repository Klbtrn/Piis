import clsx from "clsx";
import pythonLogo from "/src/assets/python-logo.png";
import jsLogo from "/src/assets/js-logo.png";
// import cLogo from "/src/assets/c-logo.png";
// import haskellLogo from "/src/assets/haskell-logo.png";

const languageIcons = {
  python: pythonLogo,
  javascript: jsLogo,
  // c: cLogo,
  // haskell: haskellLogo,
};

export default function FlashcardCard({
  prompt,
  language,
  hintCount,
  hintsUsed,
  color = "border-purple-500",
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border-2 p-4 bg-zinc-950 text-white flex justify-between items-start gap-2 hover:shadow-lg transition",
        color
      )}
    >
      <div>
        <h3 className="font-semibold text-sm leading-snug mb-1">{prompt}</h3>
        <p className="text-xs text-zinc-400">
          {hintsUsed} of {hintCount} hints
        </p>
      </div>
      {language && languageIcons[language.toLowerCase()] && (
        <img
          src={languageIcons[language.toLowerCase()]}
          alt={language}
          className="w-5 h-5 mt-1"
        />
      )}
    </div>
  );
}
