import { useState } from "react";
import type { MatchedIngredient } from "@/types/recipe";
import { SearchResults } from "./SearchResults";
import { QuantityInput } from "./QuantityInput";
import { useRecipeStore } from "../stores/useRecipeStore";

interface IngredientRowProps {
  ingredient: MatchedIngredient;
  onManualSearch: (ingredientId: string, query: string) => void;
}

export function IngredientRow({ ingredient: ing, onManualSearch }: IngredientRowProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isManualSearching, setIsManualSearching] = useState(false);
  const { selectProduct, setQuantity, toggleSkipped } = useRecipeStore();

  const selectedProduct = ing.matches.find((p) => p.sku === ing.selectedSku);
  const linePrice = selectedProduct ? selectedProduct.price * ing.selectedQuantity : null;

  async function handleSearch(query: string) {
    setIsManualSearching(true);
    await onManualSearch(ing.id, query);
    setIsManualSearching(false);
    setShowPicker(true);
  }

  return (
    <div className={`px-3 py-3 border-b border-[#1e2d42] transition-opacity ${ing.skipped ? "opacity-40" : ""}`}>
      <div className="flex items-start gap-3">
        {/* Custom checkbox */}
        <button
          onClick={() => toggleSkipped(ing.id)}
          className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-colors ${
            ing.skipped ? "border-2 border-[#2a3d55] bg-transparent" : "bg-green-500"
          }`}
        >
          {!ing.skipped && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Product image */}
        <div className="w-11 h-11 bg-white rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
          {selectedProduct?.imageUrl ? (
            <img src={selectedProduct.imageUrl} alt="" className="w-full h-full object-contain" />
          ) : ing.status === "searching" ? (
            <div className="w-full h-full bg-gray-700 animate-pulse" />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>

        {/* Info column */}
        <div className="flex-1 min-w-0">
          {/* Name + quantity row */}
          <div className="flex items-start gap-2">
            <span className="flex-1 text-white font-medium text-sm leading-tight">{ing.name}</span>
            {!ing.skipped && ing.status === "found" && selectedProduct && (
              <div className="flex-shrink-0">
                <QuantityInput value={ing.selectedQuantity} onChange={(n) => setQuantity(ing.id, n)} />
              </div>
            )}
          </div>

          {/* Product description + price */}
          {!ing.skipped && ing.status === "found" && selectedProduct && (
            <>
              <div className="flex items-baseline justify-between gap-2 mt-0.5">
                <p className="text-gray-400 text-xs truncate flex-1">{selectedProduct.name}</p>
                {linePrice !== null && (
                  <span className="text-white font-bold text-sm flex-shrink-0">
                    {linePrice.toLocaleString("is-IS")} kr
                  </span>
                )}
              </div>
              {ing.matches.length > 0 && (
                <button
                  onClick={() => setShowPicker((v) => !v)}
                  className="text-green-400 text-xs mt-1 hover:underline"
                >
                  {showPicker ? "Hide options ↑" : `Change (${ing.matches.length} options)`}
                </button>
              )}
            </>
          )}

          {/* Searching state */}
          {!ing.skipped && ing.status === "searching" && (
            <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
              <span className="inline-block w-3 h-3 border-2 border-gray-600 border-t-green-400 rounded-full animate-spin" />
              Searching Krónan…
            </div>
          )}

          {/* Not found / error state */}
          {!ing.skipped && (ing.status === "not_found" || ing.status === "error") && !isManualSearching && (
            <div className="mt-1 space-y-1.5">
              <p className="text-amber-400 text-xs">
                {ing.status === "not_found" ? "No product found" : "Search failed"}
              </p>
              <InlineSearch onSearch={handleSearch} />
            </div>
          )}

          {!ing.skipped && (ing.status === "not_found" || ing.status === "error") && isManualSearching && (
            <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
              <span className="inline-block w-3 h-3 border-2 border-gray-600 border-t-green-400 rounded-full animate-spin" />
              Searching…
            </div>
          )}

          {/* Picker dropdown */}
          {!ing.skipped && showPicker && ing.status === "found" && (
            <div className="mt-2">
              <SearchResults
                products={isManualSearching ? [] : ing.matches}
                selectedSku={ing.selectedSku}
                onSelect={(sku) => { selectProduct(ing.id, sku); setShowPicker(false); }}
                onClose={() => setShowPicker(false)}
                onSearch={handleSearch}
                isSearching={isManualSearching}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InlineSearch({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) onSearch(q);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-1.5">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Krónan…"
        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-[#132035] text-white placeholder-gray-500 border border-[#2a3d55] focus:outline-none focus:border-green-500"
      />
      <button
        type="submit"
        disabled={!query.trim()}
        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-xs rounded-lg transition-colors"
      >
        →
      </button>
    </form>
  );
}
