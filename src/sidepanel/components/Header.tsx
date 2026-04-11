import { useRecipeStore } from "../stores/useRecipeStore";

export function Header() {
  const { view, setView, reset } = useRecipeStore();

  return (
    <header className="bg-[#0b1526] px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#1e2d42]">
      <div className="flex items-center gap-2.5">
        <img src="/icons/icon48.png" alt="" className="w-10 h-10" />
        <span className="text-white font-bold text-2xl tracking-tight">Chrónan</span>
      </div>
      <nav className="flex items-center gap-0.5">
        {view !== "reviewing" && (
          <button
            onClick={reset}
            className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          onClick={() => setView(view === "saved_recipes" ? "idle" : "saved_recipes")}
          title="Saved recipes"
          className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <BookmarkIcon />
        </button>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          title="Settings"
          className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <SettingsIcon />
        </button>
      </nav>
    </header>
  );
}

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
