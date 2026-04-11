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
    <div className="mt-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Choose product
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Manual search input */}
      <form onSubmit={handleSubmit} className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex gap-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Krónan…"
            className="flex-1 text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-xs rounded"
          >
            {isSearching ? (
              <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "🔍"
            )}
          </button>
        </div>
      </form>

      {/* Product list */}
      {isSearching ? (
        <div className="px-3 py-4 text-xs text-gray-400 text-center flex items-center justify-center gap-2">
          <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
          Searching…
        </div>
      ) : products.length === 0 ? (
        <div className="px-3 py-3 text-xs text-gray-400">
          No products found. Try a different search.
        </div>
      ) : (
        <ul className="max-h-56 overflow-y-auto">
          {products.map((p) => (
            <li key={p.sku}>
              <button
                onClick={() => {
                  onSelect(p.sku);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  p.sku === selectedSku ? "bg-green-50 dark:bg-green-900/30" : ""
                }`}
              >
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="w-10 h-10 object-contain rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {p.name}
                  </div>
                  {p.onSale && p.originalPrice && (
                    <div className="text-xs text-red-400 line-through">
                      {p.originalPrice.toLocaleString("is-IS")} kr
                    </div>
                  )}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">
                  {p.price.toLocaleString("is-IS")} kr
                </div>
                {p.sku === selectedSku && (
                  <span className="text-green-600 text-sm">✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
