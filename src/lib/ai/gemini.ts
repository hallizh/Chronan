import type { AIProvider, PickInput, PickOutput } from "./types";
import type { Ingredient } from "@/types/recipe";
import { SYSTEM_PROMPT, PICK_SYSTEM_PROMPT, buildUserPrompt, buildIngredientLinesPrompt, buildPickPrompt } from "./prompt";
import { parseAIResponse, parsePickResponse } from "./parse";

export class GeminiProvider implements AIProvider {
  private model: string;
  private apiKey: string;

  constructor(opts: { model: string; apiKey: string }) {
    this.model = opts.model;
    this.apiKey = opts.apiKey;
  }

  private async callApi(systemPrompt: string, userPrompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error ${res.status}: ${err}`);
    }

    const data = await res.json() as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };
    return data.candidates[0]?.content.parts[0]?.text ?? "[]";
  }

  extractIngredients(pageText: string, url: string): Promise<Ingredient[]> {
    return this.callApi(SYSTEM_PROMPT, buildUserPrompt(pageText, url)).then(parseAIResponse);
  }

  parseIngredientLines(lines: string[]): Promise<Ingredient[]> {
    return this.callApi(SYSTEM_PROMPT, buildIngredientLinesPrompt(lines)).then(parseAIResponse);
  }

  async pickProducts(
    recipeTitle: string,
    recipeUrl: string,
    allIngredientNames: string[],
    items: PickInput[]
  ): Promise<PickOutput[]> {
    const content = await this.callApi(PICK_SYSTEM_PROMPT, buildPickPrompt(recipeTitle, recipeUrl, allIngredientNames, items));
    return parsePickResponse(content);
  }
}
