import { useRecipeStore } from "../stores/useRecipeStore";
import { KRONAN_SITE_URL } from "@/constants";
import type { MsgCartResult } from "@/types/messages";

export function CartConfirmation() {
  const {
    successItemCount,
    recipeTitle,
    recipeUrl,
    recipeImageUrl,
    ingredients,
    reset,
  } = useRecipeStore();

  async function saveRecipe() {
    const result = await chrome.runtime.sendMessage({
      type: "SAVE_RECIPE",
      recipe: {
        url: recipeUrl,
        title: recipeTitle,
        ingredients: ingredients.map((i) => ({
          id: i.id,
          raw: i.raw,
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          searchTerm: i.searchTerm,
          searchTermEn: i.searchTermEn,
        })),
        imageUrl: recipeImageUrl,
      },
    }) as MsgCartResult;
    return result.success;
  }

  return (
    <div className="h-full bg-surface flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="w-20 h-20 rounded-full bg-primary-container/30 flex items-center justify-center">
        <span
          className="material-symbols-outlined text-5xl text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
      </div>

      <div>
        <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-2">Added to Krónan!</h2>
        <p className="text-sm text-on-surface-variant">
          {successItemCount} item{successItemCount !== 1 ? "s" : ""} added to your shopping note.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <a
          href={KRONAN_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-gradient-to-r from-primary-container to-surface-tint text-on-primary font-headline font-extrabold text-sm py-4 rounded-xl shadow-[0_8px_24px_-4px_rgba(63,229,108,0.35)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
            open_in_new
          </span>
          Open Krónan
        </a>

        <button
          onClick={saveRecipe}
          className="w-full py-3.5 rounded-xl border border-outline-variant/50 text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">bookmark_add</span>
          Save recipe
        </button>

        <button
          onClick={reset}
          className="text-xs text-on-surface-variant hover:text-on-surface transition-colors mt-1"
        >
          Scan another recipe
        </button>
      </div>
    </div>
  );
}
