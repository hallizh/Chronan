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
  const linePrice = selectedProduct
    ? selectedProduct.price * ing.selectedQuantity
    : null;

  async function handleSearch(query: string) {
    setIsManualSearching(true);
    await onManualSearch(ing.id, query);
    setIsManualSearching(false);
    setShowPicker(true);
  }

  return (
    <div
      className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 ${
        ing.skipped ? "opacity-40" : ""
      }`}
    >
      {/* Top row: checkbox + ingredient name */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={!ing.skipped}
          onChange={() => toggleSkipped(ing.id)}
          className="mt-0.5 flex-shrink-0 accent-green-600"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {ing.name}
          </div>
          <div className="text-xs text-gray-400 truncate">{ing.raw}</div>
        </div>
      </div>

      {/* Product match area */}
      {!ing.skipped && (
        <div className="mt-2 ml-6">
          {ing.status === "searching" && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
              Searching Krónan…
            </div>
          )}

          {(ing.status === "not_found" || ing.status === "error") && !isManualSearching && (
            <div className="space-y-1">
              <div className="text-xs text-amber-600 dark:text-amber-400">
                {ing.status === "not_found" ? "No product found" : "Search failed"}
              </div>
              <InlineSearch onSearch={handleSearch} />
            </div>
          )}

          {(ing.status === "not_found" || ing.status === "error") && isManualSearching && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
              Searching…
            </div>
          )}

          {ing.status === "found" && selectedProduct && (
            <div className="flex items-center gap-2">
              {selectedProduct.imageUrl && (
                <img
                  src={selectedProduct.imageUrl}
                  alt=""
                  className="w-8 h-8 object-contain rounded flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {selectedProduct.name}
                </div>
                {selectedProduct.onSale && selectedProduct.originalPrice && (
                  <div className="text-xs text-red-500 line-through">
                    {selectedProduct.originalPrice.toLocaleString("is-IS")} kr
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <QuantityInput
                  value={ing.selectedQuantity}
                  onChange={(n) => setQuantity(ing.id, n)}
                />
                {linePrice !== null && (
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-16 text-right">
                    {linePrice.toLocaleString("is-IS")} kr
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Change button + picker (for found products) */}
          {ing.status === "found" && ing.matches.length > 0 && (
            <div className="mt-1">
              <button
                onClick={() => setShowPicker((v) => !v)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showPicker
                  ? "Hide options"
                  : ing.matches.length > 1
                  ? `Change (${ing.matches.length} options)`
                  : "Change"}
              </button>
              {showPicker && (
                <SearchResults
                  products={isManualSearching ? [] : ing.matches}
                  selectedSku={ing.selectedSku}
                  onSelect={(sku) => selectProduct(ing.id, sku)}
                  onClose={() => setShowPicker(false)}
                  onSearch={handleSearch}
                  isSearching={isManualSearching}
                />
              )}
            </div>
          )}
        </div>
      )}
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
    <form onSubmit={handleSubmit} className="flex gap-1">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Krónan…"
        className="flex-1 text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <button
        type="submit"
        disabled={!query.trim()}
        className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-xs rounded"
      >
        🔍
      </button>
    </form>
  );
}
