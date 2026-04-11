interface IdleViewProps {
  onScan: () => void;
  settingsPrompt?: boolean;
}

export function IdleView({ onScan, settingsPrompt }: IdleViewProps) {
  return (
    <div className="bg-white h-full flex flex-col">
      {/* Mini brand header */}
      <div className="flex items-center justify-center gap-1.5 pt-5 pb-1">
        <span className="text-gray-900 font-bold text-xl">Chrónan</span>
        <CartIcon />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 pb-8 text-center">
        <img src="/icons/icon128.png" alt="" className="w-36 h-36" />
        <div>
          <h2 className="text-gray-900 font-bold text-2xl mb-2">
            {settingsPrompt ? "Setup required" : "No recipe detected"}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            {settingsPrompt
              ? "Configure your AI provider and Krónan token in Settings before using Chrónan."
              : "Navigate to a recipe page and click the button below to extract ingredients."}
          </p>
        </div>

        {settingsPrompt ? (
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="px-8 py-2.5 bg-green-500 hover:bg-green-400 text-white font-medium rounded-full text-sm transition-colors"
          >
            Open Settings
          </button>
        ) : (
          <button
            onClick={onScan}
            className="px-8 py-2.5 bg-green-500 hover:bg-green-400 text-white font-medium rounded-full text-sm transition-colors"
          >
            Scan this page
          </button>
        )}
      </div>
    </div>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
