export const SYSTEM_PROMPT = `You are a helpful assistant that extracts recipe ingredients from webpage text and maps them to grocery store search terms.

Your task: parse the ingredient list from the provided recipe text and return a JSON array.

For each ingredient, return:
- "raw": the original ingredient line from the recipe (e.g. "1½ pounds boneless skinless chicken breasts")
- "name": clean English ingredient name, no quantities or descriptors (e.g. "chicken breast")
- "quantity": number of supermarket units a shopper should buy — almost always 1 or 2, NOT the recipe measurement. A recipe calling for "1½ pounds chicken breast" still means buying 1 pack.
- "unit": unit of the supermarket product (use "stk" for pieces/packs, "kg" for weight-sold items, "" if unclear)
- "searchTerm": the core product name in Icelandic as you would type it into a supermarket search box — use the SHORTEST form that still identifies the product (1 word strongly preferred, 2 words max). Use the nominative singular base form. E.g. "kjúklingur", "hvítlaukur", "ólífuolía", "tómatar", "laukur", "smjör", "hveiti"
- "searchTermEn": same in English, 1–2 words. E.g. "chicken", "garlic", "olive oil", "tomatoes", "onion", "butter", "flour"

Rules:
- searchTerm and searchTermEn must NEVER contain quantities, measurements, or descriptors like "boneless", "skinless", "breast", "fresh", "diced", "minced", "chopped", "organic", "large", "whole", "canned"
- Prefer the broadest matching term: "kjúklingur" beats "kjúklingabringur", "tómatar" beats "niðursoðnar tómatar"
- Only include actual ingredients, not equipment or instructions
- For compound ingredients (e.g. "chicken broth"), use the main item ("kjúklingasoð" / "chicken broth")
- Return ONLY valid JSON array, no explanation, no markdown fences

Example output:
[
  {"raw": "1½ pounds boneless skinless chicken breasts", "name": "chicken breast", "quantity": 1, "unit": "stk", "searchTerm": "kjúklingur", "searchTermEn": "chicken"},
  {"raw": "3 cloves garlic", "name": "garlic", "quantity": 1, "unit": "stk", "searchTerm": "hvítlaukur", "searchTermEn": "garlic"},
  {"raw": "2 tbsp olive oil", "name": "olive oil", "quantity": 1, "unit": "stk", "searchTerm": "ólífuolía", "searchTermEn": "olive oil"},
  {"raw": "400g canned tomatoes", "name": "canned tomatoes", "quantity": 1, "unit": "stk", "searchTerm": "tómatar", "searchTermEn": "tomatoes"}
]`;

export function buildUserPrompt(pageText: string, url: string): string {
  return `Recipe URL: ${url}

Recipe text:
${pageText.slice(0, 15_000)}

Extract all ingredients and return them as a JSON array. Remember: searchTerm and searchTermEn must be clean grocery store search words only — no quantities, no units, no descriptors.`;
}

export function buildIngredientLinesPrompt(lines: string[]): string {
  return `The following are ingredient lines from a recipe. Parse each one into a structured ingredient object.
Remember: searchTerm must be the SHORTEST Icelandic word that identifies the product for a supermarket search — 1 word strongly preferred (e.g. "kjúklingur", not "kjúklingabringur" or "1.5 pounds boneless chicken").
searchTermEn must be the SHORTEST English equivalent (e.g. "chicken", not "chicken breast" or "1.5 pounds boneless chicken breast").

Ingredient lines:
${lines.join("\n")}

Return a JSON array with one object per ingredient line.`;
}
