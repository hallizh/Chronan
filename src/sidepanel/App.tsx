import { useEffect, useState } from "react";
import { useRecipeStore } from "./stores/useRecipeStore";
import { IdleView } from "./views/IdleView";
import { ExtractingView } from "./views/ExtractingView";
import { IngredientReview } from "./views/IngredientReview";
import { CartConfirmation } from "./views/CartConfirmation";
import { SavedRecipes } from "./views/SavedRecipes";
import { Header } from "./components/Header";
import type {
  ContentMessage,
  MsgRecipeFound,
  MsgNoRecipe,
  MsgExtractResult,
  MsgSearchResult,
  MsgPickProducts,
  MsgPickResult,
} from "@/types/messages";

/**
 * Strip leading quantity + unit from a raw ingredient line so we have a
 * recognisable product name even without AI.
 * "1½ pounds boneless skinless chicken breasts" → "chicken breasts"
 */
function stripMeasurement(raw: string): string {
  // Remove leading fraction/number + optional unit
  let s = raw
    .replace(/^[\s\d¼½¾⅓⅔⅛⅜⅝⅞.,/-]+\s*(?:pound|lb|ounce|oz|gram|g|kg|ml|l|liter|litre|cup|tablespoon|tbsp|teaspoon|tsp|clove|can|bunch|head|stalk|slice|piece|pkg|package)s?\.?\s*/i, "")
    .replace(/^[\s\d¼½¾⅓⅔⅛⅜⅝⅞.,/-]+\s+/, ""); // bare numbers with no unit
  // Strip common cooking descriptors
  s = s.replace(/\b(?:boneless|skinless|lean|fresh|dried|frozen|chopped|diced|minced|sliced|grated|shredded|cooked|uncooked|raw|large|medium|small|extra|virgin|unsalted|salted|whole|ground|crushed|peeled|seedless|pitted|finely|roughly|thinly|halved)\b/gi, "");
  s = s.replace(/\s+/g, " ").trim();
  // Take the first 3 meaningful words to keep it concise
  return s.split(/\s+/).slice(0, 3).join(" ") || raw;
}
import type { MatchedIngredient } from "@/types/recipe";

export default function App() {
  const { view, setView, setRecipe, setIngredients, updateIngredientMatches, applyAIPicks, setError } =
    useRecipeStore();

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => {
    loadCurrentPage();
  }, []);

  async function loadCurrentPage() {
    setView("extracting");

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) {
        setView("idle");
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "GET_RECIPE_DATA",
      } satisfies ContentMessage);

      const msg = response as MsgRecipeFound | MsgNoRecipe;

      if (msg.type === "RECIPE_FOUND") {
        setRecipe(msg.title, msg.url);
        const rawIngredients = msg.recipe.recipeIngredient ?? [];
        // Convert schema ingredients to MatchedIngredient with searching status
        // AI will be used to enrich them
        if (rawIngredients.length > 0) {
          await processIngredientLines(rawIngredients, msg.url, msg.title);
        } else {
          setView("idle");
        }
      } else if (msg.type === "NO_RECIPE") {
        setRecipe(msg.title, msg.url);
        // Use AI to extract ingredients from raw page text
        const result = await chrome.runtime.sendMessage({
          type: "EXTRACT_WITH_AI",
          pageText: msg.pageText,
          url: msg.url,
        }) as MsgExtractResult;

        if (result.error) {
          setError(result.error);
          setView("settings_prompt");
          return;
        }

        if (result.ingredients.length === 0) {
          setView("idle");
          return;
        }

        bootstrapIngredients(result.ingredients.map((ing) => ({
          ...ing,
          status: "searching" as const,
          matches: [],
          selectedSku: null,
          selectedQuantity: ing.quantity,
          skipped: false,
        })));
      }
    } catch (err) {
      console.error("[Chronan] Error loading page:", err);
      setView("idle");
    }
  }

  async function processIngredientLines(
    lines: string[],
    _url: string,
    _title: string
  ) {
    // Use the dedicated ingredient-lines parser so AI knows it's getting
    // already-extracted lines, not full page text
    const result = await chrome.runtime.sendMessage({
      type: "PARSE_INGREDIENT_LINES",
      lines,
    }) as MsgExtractResult;

    if (result.error || result.ingredients.length === 0) {
      // Fallback: strip leading quantity + unit so the search term is at least
      // a recognisable product name, not "1½ pounds boneless skinless chicken"
      const fallback: MatchedIngredient[] = lines.map((raw, i) => {
        const cleaned = stripMeasurement(raw);
        return {
          id: `ing_${i}`,
          raw,
          name: cleaned,
          quantity: 1,
          unit: "",
          searchTerm: cleaned,
          searchTermEn: cleaned,
          status: "searching",
          matches: [],
          selectedSku: null,
          selectedQuantity: 1,
          skipped: false,
        };
      });
      bootstrapIngredients(fallback);
      return;
    }

    bootstrapIngredients(
      result.ingredients.map((ing) => ({
        ...ing,
        status: "searching" as const,
        matches: [],
        selectedSku: null,
        selectedQuantity: ing.quantity,
        skipped: false,
      }))
    );
  }

  function bootstrapIngredients(ingredients: MatchedIngredient[]) {
    setIngredients(ingredients);
    setView("reviewing");

    // Fire off parallel product searches, collect all promises
    const searchPromises = ingredients.map((ing) =>
      chrome.runtime
        .sendMessage({
          type: "SEARCH_PRODUCTS",
          query: ing.searchTerm,
          queryEn: ing.searchTermEn,
          ingredientId: ing.id,
        })
        .then((result: MsgSearchResult) => {
          updateIngredientMatches(
            result.ingredientId,
            result.products,
            result.products.length > 0 ? "found" : "not_found"
          );
          return result;
        })
        .catch(() => {
          updateIngredientMatches(ing.id, [], "error");
          return { type: "SEARCH_RESULT" as const, ingredientId: ing.id, products: [] } as MsgSearchResult;
        })
    );

    // After all searches complete, run AI product selection round
    Promise.all(searchPromises).then((results) => {
      const itemsForPick = results
        .filter((r) => r.products.length > 0)
        .map((r) => {
          const ing = ingredients.find((i) => i.id === r.ingredientId)!;
          return {
            ingredientId: r.ingredientId,
            name: ing.name,
            products: r.products.map((p) => ({
              sku: p.sku,
              name: p.name,
              price: p.price,
              inStock: p.inStock,
            })),
          };
        });

      if (itemsForPick.length === 0) return;

      const { recipeTitle, recipeUrl } = useRecipeStore.getState();

      chrome.runtime
        .sendMessage({
          type: "PICK_PRODUCTS",
          recipeTitle,
          recipeUrl,
          allIngredientNames: ingredients.map((i) => i.name),
          items: itemsForPick,
        } satisfies MsgPickProducts)
        .then((result: MsgPickResult) => {
          if (!result.error && result.picks.length > 0) {
            applyAIPicks(result.picks);
          }
        })
        .catch(() => {}); // pick failure is non-critical
    });
  }

  async function manualSearch(ingredientId: string, query: string) {
    const { setIngredientSearching, updateIngredientMatches } = useRecipeStore.getState();
    setIngredientSearching(ingredientId);
    try {
      const result = await chrome.runtime.sendMessage({
        type: "SEARCH_PRODUCTS",
        query,
        queryEn: query,
        ingredientId,
      }) as MsgSearchResult;
      updateIngredientMatches(
        result.ingredientId,
        result.products,
        result.products.length > 0 ? "found" : "not_found"
      );
    } catch {
      updateIngredientMatches(ingredientId, [], "error");
    }
  }

  return (
    <div className="flex flex-col h-screen bg-surface text-on-surface font-body antialiased">
      <Header theme={theme} onThemeToggle={toggleTheme} />
      <main className="flex-1 min-h-0">
        {view === "idle" && <IdleView onScan={loadCurrentPage} />}
        {view === "extracting" && <ExtractingView />}
        {view === "reviewing" && <IngredientReview onManualSearch={manualSearch} />}
        {view === "adding" && <ExtractingView label="Adding to Krónan…" />}
        {view === "success" && <CartConfirmation />}
        {view === "saved_recipes" && <SavedRecipes />}
        {view === "settings_prompt" && <IdleView onScan={loadCurrentPage} settingsPrompt />}
      </main>
    </div>
  );
}
