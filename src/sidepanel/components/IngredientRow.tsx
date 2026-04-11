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
    <div className={`group transition-opacity ${ing.skipped ? "opacity-40" : ""}`}>
      {/* Row header: ingredient name + toggle */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <button
          onClick={() => toggleSkipped(ing.id)}
          className={`text-sm font-semibold text-left transition-colors ${
            ing.skipped ? "line-through text-on-surface-variant" : "text-on-surface"
          }`}
        >
          {ing.name}
        </button>
        {ing.status === "found" && ing.matches.length > 0 && (
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider hover:text-primary transition-colors flex-shrink-0"
          >
            {showPicker ? "Hide Options" : `${ing.matches.length} Options`}
          </button>
        )}
      </div>

      {/* Card */}
      {!ing.skipped && (
        <>
          {ing.status === "searching" && (
            <div className="bg-surface-container-low rounded-xl p-3 flex gap-4 animate-pulse">
              <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex-shrink-0" />
              <div className="flex-grow flex flex-col justify-between py-1">
                <div className="space-y-2">
                  <div className="h-3.5 bg-surface-container-high rounded w-3/4" />
                  <div className="h-3 bg-surface-container-high rounded w-1/2" />
                </div>
                <div className="h-3.5 bg-surface-container-high rounded w-1/4" />
              </div>
            </div>
          )}

          {ing.status === "found" && selectedProduct && (
            <div className="bg-surface-container-low rounded-xl p-3 flex gap-4 transition-all hover:bg-surface-container-high">
              {/* Product image */}
              <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex-shrink-0 overflow-hidden">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-on-surface-variant/40">
                      grocery
                    </span>
                  </div>
                )}
              </div>

              {/* Product details */}
              <div className="flex-grow flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-bold text-on-surface leading-tight truncate">
                      {selectedProduct.name}
                    </h3>
                    <button
                      onClick={() => setShowPicker((v) => !v)}
                      className="text-primary-fixed-dim hover:text-primary transition-colors flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-lg">swap_horiz</span>
                    </button>
                  </div>
                  {selectedProduct.onSale && selectedProduct.originalPrice && (
                    <span className="text-xs text-error line-through">
                      {selectedProduct.originalPrice.toLocaleString("is-IS")} kr.
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-primary font-bold text-sm">
                    {linePrice !== null
                      ? `${linePrice.toLocaleString("is-IS")} kr.`
                      : `${selectedProduct.price.toLocaleString("is-IS")} kr.`}
                  </span>
                  <QuantityInput
                    value={ing.selectedQuantity}
                    onChange={(n) => setQuantity(ing.id, n)}
                  />
                </div>
              </div>
            </div>
          )}

          {(ing.status === "not_found" || ing.status === "error") && (
            <div className="bg-surface-container-low rounded-xl p-3 space-y-3">
              <div className="flex items-center gap-2 text-xs text-error">
                <span className="material-symbols-outlined text-sm">search_off</span>
                {ing.status === "not_found" ? "No product found" : "Search failed"}
              </div>
              <InlineSearch onSearch={handleSearch} isSearching={isManualSearching} />
            </div>
          )}

          {/* Options picker */}
          {showPicker && (
            <div className="mt-2">
              <SearchResults
                products={isManualSearching ? [] : ing.matches}
                selectedSku={ing.selectedSku}
                onSelect={(sku) => {
                  selectProduct(ing.id, sku);
                  setShowPicker(false);
                }}
                onClose={() => setShowPicker(false)}
                onSearch={handleSearch}
                isSearching={isManualSearching}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InlineSearch({
  onSearch,
  isSearching,
}: {
  onSearch: (query: string) => void;
  isSearching: boolean;
}) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) onSearch(q);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Krónan…"
        className="flex-1 text-xs px-3 py-2 rounded-lg bg-surface-container text-on-surface placeholder-on-surface-variant/50 border border-outline-variant/40 focus:outline-none focus:border-primary/60"
      />
      <button
        type="submit"
        disabled={!query.trim() || isSearching}
        className="px-3 py-2 bg-primary-container text-on-primary text-xs rounded-lg font-bold disabled:opacity-40 transition-colors hover:brightness-110 flex items-center gap-1"
      >
        {isSearching ? (
          <span className="inline-block w-3 h-3 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
        ) : (
          <span className="material-symbols-outlined text-sm">search</span>
        )}
      </button>
    </form>
  );
}
