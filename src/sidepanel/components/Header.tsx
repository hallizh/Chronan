import { useRecipeStore } from "../stores/useRecipeStore";

interface HeaderProps {
  theme: "dark" | "light";
  onThemeToggle: () => void;
}

export function Header({ theme, onThemeToggle }: HeaderProps) {
  const { view, setView, reset } = useRecipeStore();

  return (
    <nav className="flex justify-between items-center w-full px-4 py-3 sticky top-0 z-50 bg-surface/90 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.3)] border-b border-outline-variant/20">
      <div className="flex items-center gap-2">
        {view !== "idle" && view !== "settings_prompt" && view !== "extracting" && view !== "reviewing" && (
          <button
            onClick={reset}
            className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors p-2 rounded-lg mr-1"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
        )}
        <span className="text-xl font-bold tracking-tighter text-primary font-headline">Chrónan</span>
      </div>
      <div className="flex gap-1">
        <button
          onClick={onThemeToggle}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors active:scale-95 duration-200 p-2 rounded-lg"
        >
          <span className="material-symbols-outlined">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>
        <button
          onClick={() => setView(view === "saved_recipes" ? "idle" : "saved_recipes")}
          title="Saved recipes"
          className="text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors active:scale-95 duration-200 p-2 rounded-lg"
        >
          <span className="material-symbols-outlined">bookmark</span>
        </button>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          title="Settings"
          className="text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors active:scale-95 duration-200 p-2 rounded-lg"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </nav>
  );
}
