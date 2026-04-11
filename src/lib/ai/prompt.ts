import type { PickInput } from "./types";

export const SYSTEM_PROMPT = `You are a helpful assistant that extracts recipe ingredients from webpage text and maps them to grocery store search terms.

Your task: parse the ingredient list from the provided recipe text and return a JSON array.

For each ingredient, return:
- "raw": the original ingredient line from the recipe (e.g. "1½ pounds boneless skinless chicken breasts")
- "name": clean English ingredient name, no quantities or descriptors (e.g. "chicken breast")
- "quantity": number of supermarket units a shopper should buy — almost always 1 or 2, NOT the recipe measurement. A recipe calling for "1½ pounds chicken breast" still means buying 1 pack.
- "unit": unit of the supermarket product (use "stk" for pieces/packs, "kg" for weight-sold items, "" if unclear)
- "searchTerm": the core product name in Icelandic as you would type it into a supermarket search box — strip ALL quantities, units, and cooking descriptors. 1–3 words max. E.g. "kjúklingabringur", "hvítlaukur", "ólífuolía", "niðursoðnar tómatar"
- "searchTermEn": same in English. E.g. "chicken breast", "garlic", "olive oil", "canned tomatoes"

Rules:
- searchTerm and searchTermEn must NEVER contain quantities, measurements, or descriptors like "boneless", "skinless", "fresh", "diced", "minced", "chopped", "organic", "large", "whole"
- searchTerm and searchTermEn must NEVER use "eða", "or", or "/" — if an ingredient lists alternatives ("X or Y"), pick the first/most common one only
- For "lettuce" with no specified type, use "eisberg" as searchTerm and "iceberg lettuce" as searchTermEn
- Only include actual ingredients, not equipment or instructions
- For compound ingredients (e.g. "chicken broth"), use the main item ("kjúklingasoð" / "chicken broth")
- Return ONLY valid JSON array, no explanation, no markdown fences

Example output:
[
  {"raw": "1½ pounds boneless skinless chicken breasts", "name": "chicken breast", "quantity": 1, "unit": "stk", "searchTerm": "kjúklingabringur", "searchTermEn": "chicken breast"},
  {"raw": "3 cloves garlic", "name": "garlic", "quantity": 1, "unit": "stk", "searchTerm": "hvítlaukur", "searchTermEn": "garlic"},
  {"raw": "2 tbsp olive oil", "name": "olive oil", "quantity": 1, "unit": "stk", "searchTerm": "ólífuolía", "searchTermEn": "olive oil"},
  {"raw": "400g canned tomatoes", "name": "canned tomatoes", "quantity": 1, "unit": "stk", "searchTerm": "niðursoðnar tómatar", "searchTermEn": "canned tomatoes"}
]`;

export function buildUserPrompt(pageText: string, url: string): string {
  return `Recipe URL: ${url}

Recipe text:
${pageText.slice(0, 15_000)}

Extract all ingredients and return them as a JSON array. Remember: searchTerm and searchTermEn must be clean grocery store search words only — no quantities, no units, no descriptors.`;
}

export function buildIngredientLinesPrompt(lines: string[]): string {
  return `The following are ingredient lines from a recipe. Parse each one into a structured ingredient object.
Remember: searchTerm must be a clean Icelandic grocery store search word (e.g. "kjúklingabringur", not "1.5 pounds boneless chicken").
searchTermEn must be a clean English grocery store search word (e.g. "chicken breast", not "1.5 pounds boneless chicken breast").
Never use "eða" or "or" in searchTerm — pick one term only.

Ingredient lines:
${lines.join("\n")}

Return a JSON array with one object per ingredient line.`;
}

// ── AI product selection prompt ───────────────────────────────────────────────

export const PICK_SYSTEM_PROMPT = `You select the best Krónan grocery product for each recipe ingredient.

Rules:
- Pick the most relevant IN-STOCK product. Prefer lower price among equally relevant options.
- Use the recipe name and the full ingredient list as context (e.g. a Thai curry needs coconut milk, not dairy milk).
- If NONE of the candidates are a plausible match for this ingredient in this recipe, use null for sku.
- Return ONLY a JSON array — no explanation, no markdown fences:
[{"ingredientId":"...","sku":"..."}, ...]`;

export function buildPickPrompt(
  recipeTitle: string,
  recipeUrl: string,
  allIngredientNames: string[],
  items: PickInput[]
): string {
  return `Recipe: "${recipeTitle}"
URL: ${recipeUrl}
All ingredients in this recipe: ${allIngredientNames.join(", ")}

Select the best product for each of these ingredients:
${JSON.stringify(items)}

Return a JSON array: [{"ingredientId":"...","sku":"..."}]`;
}
