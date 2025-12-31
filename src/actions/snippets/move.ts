"use server";

import { db } from "@/lib/db";
import { snippet, collection } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { moveSnippetSchema, type MoveSnippetInput } from "@/lib/validation";
import { eq, and } from "drizzle-orm";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function moveSnippet(
  input: MoveSnippetInput
): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    const parsed = moveSnippetSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { id, collectionId } = parsed.data;

    // verify snippet ownership
    const [existing] = await db
      .select()
      .from(snippet)
      .where(eq(snippet.id, id));

    if (!existing) {
      return { success: false, error: "Snippet not found" };
    }

    if (existing.userId !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    // verify collection ownership
    const [targetCollection] = await db
      .select()
      .from(collection)
      .where(
        and(
          eq(collection.id, collectionId),
          eq(collection.userId, session.user.id)
        )
      );

    if (!targetCollection) {
      return { success: false, error: "Collection not found" };
    }

    await db
      .update(snippet)
      .set({ collectionId })
      .where(and(eq(snippet.id, id), eq(snippet.userId, session.user.id)));

    return { success: true };
  } catch (error) {
    console.error("Failed to move snippet:", error);
    return { success: false, error: "Failed to move snippet" };
  }
}
