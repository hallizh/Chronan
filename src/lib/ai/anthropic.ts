import type { AIProvider, PickInput, PickOutput } from "./types";
import type { Ingredient } from "@/types/recipe";
import { SYSTEM_PROMPT, PICK_SYSTEM_PROMPT, buildUserPrompt, buildIngredientLinesPrompt, buildPickPrompt } from "./prompt";
import { parseAIResponse, parsePickResponse } from "./parse";

export class AnthropicProvider implements AIProvider {
  private model: string;
  private apiKey: string;

  constructor(opts: { model: string; apiKey: string }) {
    this.model = opts.model;
    this.apiKey = opts.apiKey;
  }

  private async callApi(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic error ${res.status}: ${err}`);
    }

    const data = await res.json() as {
      content: Array<{ type: string; text: string }>;
    };
    return data.content.find((b) => b.type === "text")?.text ?? "[]";
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
