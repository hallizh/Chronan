interface IdleViewProps {
  onScan: () => void;
  settingsPrompt?: boolean;
}

export function IdleView({ onScan, settingsPrompt }: IdleViewProps) {
  return (
    <div className="h-full bg-surface flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
        <span
          className="material-symbols-outlined text-5xl text-on-surface-variant"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 48" }}
        >
          {settingsPrompt ? "settings" : "search"}
        </span>
      </div>

      <div>
        <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-2">
          {settingsPrompt ? "Setup required" : "No recipe detected"}
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
          {settingsPrompt
            ? "Configure your AI provider and Krónan token in Settings before using Chrónan."
            : "Navigate to a recipe page and click Scan to extract ingredients automatically."}
        </p>
      </div>

      {settingsPrompt ? (
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-container to-surface-tint text-on-primary font-headline font-extrabold text-sm py-4 px-8 rounded-xl shadow-[0_8px_24px_-4px_rgba(63,229,108,0.3)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            settings
          </span>
          Open Settings
        </button>
      ) : (
        <button
          onClick={onScan}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-container to-surface-tint text-on-primary font-headline font-extrabold text-sm py-4 px-8 rounded-xl shadow-[0_8px_24px_-4px_rgba(63,229,108,0.3)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            center_focus_strong
          </span>
          Scan this page
        </button>
      )}
    </div>
  );
}
