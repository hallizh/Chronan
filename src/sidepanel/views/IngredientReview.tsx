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
  const searchingCount = ingredients.filter((i) => i.status === "searching").length;

  const totalPrice = ingredients
    .filter((i) => !i.skipped && i.selectedSku)
    .reduce((sum, ing) => {
      const product = ing.matches.find((p) => p.sku === ing.selectedSku);
      return sum + (product ? product.price * ing.selectedQuantity : 0);
    }, 0);

  async function handleAdd() {
    setView("adding");
    try {
      const lines = activeIngredients.map((ing) => ({
        sku: ing.selectedSku!,
        quantity: ing.selectedQuantity,
      }));

      const result = await chrome.runtime.sendMessage({
        type: "ADD_TO_NOTE",
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
    <div className="h-full overflow-y-auto pb-44 bg-surface">
      {/* Recipe header */}
      <header className="px-5 py-6">
        <span className="text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-2 block">
          {searchingCount > 0 ? `Searching ${searchingCount} products…` : "Recipe Ingredients"}
        </span>
        <h1 className="font-headline text-2xl font-extrabold leading-tight tracking-tight text-on-surface">
          {recipeTitle || "Untitled recipe"}
        </h1>
        <div className="flex items-center gap-2 mt-3">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "16px" }}>restaurant</span>
          <span className="text-on-surface-variant text-xs font-medium">
            {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""} detected
          </span>
        </div>
      </header>

      {/* Error banner */}
      {errorMessage && (
        <div className="mx-5 mb-4 p-3 bg-error-container/20 border border-error/30 rounded-xl text-xs text-error flex items-start gap-2">
          <span className="material-symbols-outlined text-sm flex-shrink-0">error</span>
          {errorMessage}
        </div>
      )}

      {/* Ingredients feed */}
      <section className="space-y-4 px-5">
        {ingredients.map((ing) => (
          <IngredientRow key={ing.id} ingredient={ing} onManualSearch={onManualSearch} />
        ))}
      </section>

      {/* Fixed floating footer */}
      <div className="fixed bottom-0 left-0 w-full z-40">
        <div className="absolute inset-0 bg-surface/85 backdrop-blur-xl border-t border-outline-variant/20" />
        <div className="relative px-5 pt-4 pb-6">
          <div className="flex justify-between items-baseline mb-4">
            <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">
              Estimated Total
            </span>
            <div className="text-right">
              <span className="text-2xl font-black text-on-surface">
                {totalPrice > 0 ? `${totalPrice.toLocaleString("is-IS")} kr.` : "—"}
              </span>
              {totalPrice > 0 && (
                <p className="text-[10px] text-on-surface-variant">Price may vary in store</p>
              )}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={activeIngredients.length === 0}
            className="w-full bg-gradient-to-r from-primary-container to-surface-tint text-on-primary font-headline font-extrabold text-sm py-4 rounded-xl shadow-[0_8px_24px_-4px_rgba(63,229,108,0.35)] hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              playlist_add
            </span>
            Add to Shopping Note
          </button>
        </div>
      </div>
    </div>
  );
}
