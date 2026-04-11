import { searchProducts } from "@/lib/kronan/client";
import type { KronanProduct } from "@/types/kronan";
import type { MsgSearchProducts, MsgSearchResult } from "@/types/messages";

/** Split "avókadóolía eða ólífuolía" or "X or Y" into ["avókadóolía", "ólífuolía"] */
function splitAlternatives(term: string): string[] {
  return term
    .split(/\s+eða\s+|\s+or\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Search each alternative in order, merge all results (deduped by SKU) */
async function searchWithAlternatives(term: string): Promise<KronanProduct[]> {
  const terms = splitAlternatives(term);
  const seen = new Set<string>();
  const results: KronanProduct[] = [];

  for (const t of terms) {
    const products = await searchProducts(t);
    console.log(`[Chronan search] "${t}" → ${products.length} results`);
    for (const p of products) {
      if (!seen.has(p.sku)) {
        seen.add(p.sku);
        results.push(p);
      }
    }
  }

  return results;
}

export async function handleSearchProducts(
  msg: MsgSearchProducts
): Promise<MsgSearchResult> {
  try {
    console.log(`[Chronan search] Icelandic: "${msg.query}"`);
    let products = await searchWithAlternatives(msg.query);

    // If no results, fall back to English term
    if (products.length === 0 && msg.queryEn && msg.queryEn !== msg.query) {
      console.log(`[Chronan search] fallback English: "${msg.queryEn}"`);
      products = await searchWithAlternatives(msg.queryEn);
    }

    return { type: "SEARCH_RESULT", ingredientId: msg.ingredientId, products };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      type: "SEARCH_RESULT",
      ingredientId: msg.ingredientId,
      products: [],
      error,
    };
  }
}
