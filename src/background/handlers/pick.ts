import { getAIProvider } from "@/lib/ai";
import type { MsgPickProducts, MsgPickResult } from "@/types/messages";

export async function handlePickProducts(
  msg: MsgPickProducts
): Promise<MsgPickResult> {
  try {
    const provider = await getAIProvider();
    const picks = await provider.pickProducts(
      msg.recipeTitle,
      msg.recipeUrl,
      msg.allIngredientNames,
      msg.items
    );
    return { type: "PICK_RESULT", picks };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { type: "PICK_RESULT", picks: [], error };
  }
}
