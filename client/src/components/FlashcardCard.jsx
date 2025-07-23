import clsx from "clsx";
import pythonLogo from "/src/assets/python-logo.png";
import jsLogo from "/src/assets/js-logo.png";
import { Link } from "react-router-dom";

const languageIcons = {
  python: pythonLogo,
  javascript: jsLogo,
};

export default function FlashcardCard({
  _id,
  prompt,
  task_name,
  language,
  hintsUsedOverall = 0,
  status,
  nextReviewDate,
  attempts = 0,
  successfulReviews = 0,
  difficultyFactor = 2.5,
  color = "border-purple-500",
}) {
  const getDaysUntilReview = () => {
    if (!nextReviewDate || status !== "Done") return null;
    const days = Math.ceil(
      (new Date(nextReviewDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const daysUntilReview = getDaysUntilReview();

  const formatReviewInfo = () => {
    if (status !== "Done" || !nextReviewDate) {
      return `${hintsUsedOverall} hints${
        attempts > 0 ? ` • ${attempts} attempts` : ""
      }`;
    }

    if (daysUntilReview === null) return "Review date unknown";
    if (daysUntilReview <= 0) return "🔥 Due now!";
    if (daysUntilReview === 1) return "📅 Tomorrow";
    if (daysUntilReview <= 7) return `📅 In ${daysUntilReview} days`;
    if (daysUntilReview <= 30)
      return `📅 ${Math.ceil(daysUntilReview / 7)} weeks`;
    return `📅 ${Math.ceil(daysUntilReview / 30)} months`;
  };

  const getStatusStyling = () => {
    if (status === "Done" && daysUntilReview !== null) {
      if (daysUntilReview <= 0)
        return "text-red-400 font-semibold animate-pulse";
      if (daysUntilReview <= 3) return "text-yellow-400 font-medium";
      return "text-green-400 font-medium";
    }
    return "text-zinc-400 font-medium";
  };

  const getDifficultyIndicator = () => {
    if (status !== "Done" || !difficultyFactor) return null;

    let indicator = "";
    let colorClass = "";

    if (difficultyFactor >= 4.0) {
      indicator = "⭐⭐⭐"; // Mastered
      colorClass = "text-green-400";
    } else if (difficultyFactor >= 3.0) {
      indicator = "⭐⭐"; // Good
      colorClass = "text-yellow-400";
    } else if (difficultyFactor >= 2.0) {
      indicator = "⭐"; // Learning
      colorClass = "text-orange-400";
    } else {
      indicator = "🔄"; // Needs practice
      colorClass = "text-red-400";
    }

    return (
      <span
        className={`text-xs ${colorClass}`}
        title={`Difficulty: ${difficultyFactor.toFixed(1)}`}
      >
        {indicator}
      </span>
    );
  };

  // Drag-and-drop: Callback für Drag-Start und Drag-End
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", _id);
    if (typeof window.setFlashcardDraggedId === "function")
      window.setFlashcardDraggedId(_id);
  };

  const handleDragEnd = () => {
    if (typeof window.setFlashcardDraggedId === "function")
      window.setFlashcardDraggedId(null);
  };

  return (
    <div draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Link to={`/trainer/${_id}`} className="block">
        <div
          className={clsx(
            "rounded-2xl border-2 p-5 bg-gradient-to-br from-zinc-950/90 via-purple-950/80 to-zinc-900/80 text-white flex justify-between items-start gap-3 shadow-xl hover:scale-[1.02] hover:shadow-fuchsia-700/30 transition-all duration-200",
            color,
            status === "Done" &&
              daysUntilReview !== null &&
              daysUntilReview <= 0 &&
              "ring-2 ring-red-400/60 shadow-red-400/20"
          )}
        >
          <div className="flex flex-col gap-1 flex-grow">
            <h3 className="font-bold text-base leading-snug mb-1 text-fuchsia-200 drop-shadow">
              {prompt}
            </h3>
            {task_name && (
              <p className="text-sm font-normal text-zinc-300 -mt-1">
                {task_name}
              </p>
            )}
            {/* Main info line */}
            <p className={`text-xs ${getStatusStyling()}`}>
              {formatReviewInfo()}
            </p>
            {/* Additional info for completed cards */}
            {status === "Done" && (
              <div className="flex items-center gap-2 mt-1">
                {getDifficultyIndicator()}
                {successfulReviews > 0 && (
                  <span className="text-xs text-cyan-400">
                    {successfulReviews} reviews
                  </span>
                )}
              </div>
            )}
          </div>
          {/* Language icon */}
          {language && languageIcons[language.toLowerCase()] && (
            <img
              src={languageIcons[language.toLowerCase()]}
              alt={language}
              className="w-7 h-7 mt-1 drop-shadow-lg border-2 border-fuchsia-500/40 rounded-full bg-zinc-900 flex-shrink-0"
            />
          )}
        </div>
      </Link>
    </div>
  );
}
