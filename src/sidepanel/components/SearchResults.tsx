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
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container overflow-hidden">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="px-3 py-2.5 border-b border-outline-variant/20">
        <div className="flex items-center gap-2 bg-surface-container-high rounded-lg px-3 py-1.5">
          <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0" style={{ fontSize: "14px" }}>
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Krónan..."
            className="flex-1 text-xs bg-transparent text-on-surface placeholder-on-surface-variant/50 focus:outline-none"
          />
          {isSearching && (
            <span className="inline-block w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
          )}
        </div>
      </form>

      {/* Product list */}
      {isSearching ? (
        <div className="py-4 text-xs text-on-surface-variant text-center">Searching…</div>
      ) : products.length === 0 ? (
        <div className="px-3 py-3 text-xs text-on-surface-variant">
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
                    isSelected
                      ? "bg-primary/10"
                      : "hover:bg-surface-container-high"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: "16px" }}>
                        grocery
                      </span>
                    )}
                  </div>
                  <span className="flex-1 text-xs text-on-surface truncate">{p.name}</span>
                  <span className="text-xs font-semibold text-primary flex-shrink-0">
                    {p.price.toLocaleString("is-IS")} kr.
                  </span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
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
