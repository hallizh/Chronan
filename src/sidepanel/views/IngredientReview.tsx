import { useRecipeStore } from "../stores/useRecipeStore";
import { IngredientRow } from "../components/IngredientRow";
import type { MsgCartResult } from "@/types/messages";

interface IngredientReviewProps {
  onManualSearch: (ingredientId: string, query: string) => void;
}

export function IngredientReview({ onManualSearch }: IngredientReviewProps) {
  const {
    recipeTitle,
    ingredients,
    setView,
    setError,
    setSuccess,
    errorMessage,
  } = useRecipeStore();

  const activeIngredients = ingredients.filter((i) => !i.skipped && i.selectedSku);
  const skippedCount = ingredients.filter((i) => i.skipped).length;
  const searchingCount = ingredients.filter((i) => i.status === "searching").length;

  const totalPrice = ingredients
    .filter((i) => !i.skipped && i.selectedSku)
    .reduce((sum, ing) => {
      const product = ing.matches.find((p) => p.sku === ing.selectedSku);
      return sum + (product ? product.price * ing.selectedQuantity : 0);
    }, 0);

  async function handleAdd(target: "note" | "cart") {
    setView("adding");
    try {
      const lines = activeIngredients.map((ing) => ({
        sku: ing.selectedSku!,
        quantity: ing.selectedQuantity,
      }));

      const result = await chrome.runtime.sendMessage({
        type: target === "note" ? "ADD_TO_NOTE" : "ADD_TO_CART",
        lines,
      }) as MsgCartResult;

      if (result.success) {
        setSuccess(lines.length);
      } else {
        setError(result.error ?? "Failed to add items");
        if (result.error?.startsWith("AUTH_ERROR")) {
          setView("settings_prompt");
        } else {
          setView("reviewing");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setView("reviewing");
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0b1526]">
      {/* Recipe title card */}
      <div className="mx-3 mt-3 mb-1 bg-[#132035] rounded-xl px-4 py-3">
        <p className="text-white text-sm font-medium leading-snug truncate">
          {recipeTitle || "Recipe ingredients"}
        </p>
        {(searchingCount > 0 || skippedCount > 0) && (
          <p className="text-gray-500 text-xs mt-0.5">
            {searchingCount > 0 && `Searching ${searchingCount}…`}
            {searchingCount > 0 && skippedCount > 0 && " · "}
            {skippedCount > 0 && `${skippedCount} skipped`}
          </p>
        )}
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="mx-3 mt-2 p-2.5 bg-red-900/30 border border-red-800 rounded-xl text-xs text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Ingredient list */}
      <div className="flex-1 overflow-y-auto">
        {ingredients.map((ing) => (
          <IngredientRow key={ing.id} ingredient={ing} onManualSearch={onManualSearch} />
        ))}
      </div>

      {/* Footer */}
      <div className="bg-[#0b1526] px-4 pt-3 pb-4 border-t border-[#1e2d42]">
        {totalPrice > 0 && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">
              Estimated total
              {searchingCount > 0 && (
                <span className="text-gray-600 text-xs ml-1">(loading…)</span>
              )}
            </span>
            <span className="text-white font-bold text-base">
              {totalPrice.toLocaleString("is-IS")} kr
            </span>
          </div>
        )}

        <button
          onClick={() => handleAdd("cart")}
          disabled={activeIngredients.length === 0}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors"
        >
          <span>Add to Krónan Cart</span>
          <CartIcon />
        </button>
      </div>
    </div>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
