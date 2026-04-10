import { searchProducts } from "@/lib/kronan/client";
import type { MsgSearchProducts, MsgSearchResult } from "@/types/messages";

export async function handleSearchProducts(
  msg: MsgSearchProducts
): Promise<MsgSearchResult> {
  try {
    // Try Icelandic term first
    console.log(`[Chronan search] Icelandic: "${msg.query}"`);
    let products = await searchProducts(msg.query);
    console.log(`[Chronan search] "${msg.query}" → ${products.length} results`);

    // If no results, fall back to English term
    if (products.length === 0 && msg.queryEn && msg.queryEn !== msg.query) {
      console.log(`[Chronan search] fallback English: "${msg.queryEn}"`);
      products = await searchProducts(msg.queryEn);
      console.log(`[Chronan search] "${msg.queryEn}" → ${products.length} results`);
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
