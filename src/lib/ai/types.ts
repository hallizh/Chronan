import type { Ingredient } from "@/types/recipe";

export interface PickInput {
  ingredientId: string;
  name: string;
  products: Array<{ sku: string; name: string; price: number; inStock: boolean }>;
}

export interface PickOutput {
  ingredientId: string;
  sku: string | null;
}

export interface AIProvider {
  extractIngredients(pageText: string, url: string): Promise<Ingredient[]>;
  parseIngredientLines(lines: string[]): Promise<Ingredient[]>;
  pickProducts(
    recipeTitle: string,
    recipeUrl: string,
    allIngredientNames: string[],
    items: PickInput[]
  ): Promise<PickOutput[]>;
}

/** Raw ingredient shape returned by the AI before we enrich with IDs */
export interface RawAIIngredient {
  name: string;
  quantity: number;
  unit: string;
  searchTerm: string; // Icelandic
  searchTermEn: string; // English fallback
  raw: string; // original recipe line
}
