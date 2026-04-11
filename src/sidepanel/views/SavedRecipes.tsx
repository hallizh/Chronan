import { useEffect, useState } from "react";
import type { Recipe } from "@/types/recipe";
import type { MsgRecipesList } from "@/types/messages";

export function SavedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.runtime
      .sendMessage({ type: "GET_RECIPES" })
      .then((res: MsgRecipesList) => {
        setRecipes(res.recipes);
        setLoading(false);
      });
  }, []);

  async function deleteRecipe(id: string) {
    await chrome.runtime.sendMessage({ type: "DELETE_RECIPE", id });
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) {
    return (
      <div className="h-full bg-surface flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="h-full bg-surface flex flex-col items-center justify-center px-6 text-center gap-4">
        <span
          className="material-symbols-outlined text-5xl text-on-surface-variant/40"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 48" }}
        >
          bookmarks
        </span>
        <p className="text-sm text-on-surface-variant">
          No saved recipes yet. After adding ingredients to Krónan, you can save the recipe here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-full">
      <div className="px-5 py-6">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Saved Recipes</h1>
        <p className="text-xs text-on-surface-variant mt-1">{recipes.length} saved</p>
      </div>

      <div className="space-y-3 px-5 pb-8">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-surface-container-low rounded-xl p-4 flex gap-3">
            {recipe.imageUrl && (
              <img
                src={recipe.imageUrl}
                alt=""
                className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <a
                href={recipe.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-on-surface hover:text-primary transition-colors truncate block leading-tight"
              >
                {recipe.title}
              </a>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {recipe.ingredients.length} ingredients ·{" "}
                {new Date(recipe.savedAt).toLocaleDateString("is-IS")}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {recipe.ingredients.slice(0, 4).map((ing) => (
                  <span
                    key={ing.id}
                    className="text-[10px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full"
                  >
                    {ing.name}
                  </span>
                ))}
                {recipe.ingredients.length > 4 && (
                  <span className="text-[10px] text-on-surface-variant/60">
                    +{recipe.ingredients.length - 4} more
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => deleteRecipe(recipe.id)}
              className="text-on-surface-variant/40 hover:text-error transition-colors flex-shrink-0 p-1"
              title="Delete recipe"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
