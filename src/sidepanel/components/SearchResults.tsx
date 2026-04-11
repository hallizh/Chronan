import { useState } from "react";
import type { KronanProduct } from "@/types/kronan";

interface SearchResultsProps {
  products: KronanProduct[];
  selectedSku: string | null;
  onSelect: (sku: string) => void;
  onClose: () => void;
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export function SearchResults({
  products,
  selectedSku,
  onSelect,
  onClose,
  onSearch,
  isSearching = false,
}: SearchResultsProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) onSearch(q);
  }

  return (
    <div className="rounded-xl border border-[#1e2d42] bg-[#0a1322] overflow-hidden">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="px-3 py-2 border-b border-[#1e2d42]">
        <div className="flex items-center gap-2 bg-[#132035] rounded-lg px-3 py-1.5">
          <SearchIcon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Krónan..."
            className="flex-1 text-xs bg-transparent text-white placeholder-gray-500 focus:outline-none"
          />
          {isSearching && (
            <span className="inline-block w-3 h-3 border-2 border-gray-600 border-t-green-400 rounded-full animate-spin flex-shrink-0" />
          )}
        </div>
      </form>

      {/* Product list */}
      {isSearching ? (
        <div className="py-4 text-xs text-gray-500 text-center">Searching…</div>
      ) : products.length === 0 ? (
        <div className="px-3 py-3 text-xs text-gray-500">
          No products found. Try a different search.
        </div>
      ) : (
        <ul className="max-h-52 overflow-y-auto">
          {products.map((p) => {
            const isSelected = p.sku === selectedSku;
            return (
              <li key={p.sku}>
                <button
                  onClick={() => {
                    onSelect(p.sku);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                    isSelected ? "bg-[#0f3a1a]" : "hover:bg-[#132035]"
                  }`}
                >
                  <div className="w-8 h-8 bg-white rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <span className="flex-1 text-xs text-white truncate">{p.name}</span>
                  <span className="text-xs text-gray-300 flex-shrink-0">
                    {p.price.toLocaleString("is-IS")} kr
                  </span>
                  {isSelected && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" className="flex-shrink-0">
                      <path d="M1 5L4.5 8.5L11 1" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M11 11L14 14" strokeLinecap="round" />
    </svg>
  );
}
