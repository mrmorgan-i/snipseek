"use server";

import { db } from "@/lib/db";
import { collection, snippet } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { deleteCollectionSchema, type DeleteCollectionInput } from "@/lib/validation";
import { eq, and } from "drizzle-orm";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteCollection(
  input: DeleteCollectionInput
): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    const parsed = deleteCollectionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { id } = parsed.data;

    // verify ownership and not default collection
    const [existing] = await db
      .select()
      .from(collection)
      .where(eq(collection.id, id));

    if (!existing) {
      return { success: false, error: "Collection not found" };
    }

    if (existing.userId !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    if (existing.isDefault) {
      return { success: false, error: "Cannot delete the default collection" };
    }

    // get the default collection to move snippets to
    const [defaultCollection] = await db
      .select()
      .from(collection)
      .where(
        and(
          eq(collection.userId, session.user.id),
          eq(collection.isDefault, true)
        )
      );

    if (!defaultCollection) {
      return { success: false, error: "Default collection not found" };
    }

    // move all snippets to the default collection
    await db
      .update(snippet)
      .set({ collectionId: defaultCollection.id })
      .where(eq(snippet.collectionId, id));

    // delete the collection
    await db
      .delete(collection)
      .where(and(eq(collection.id, id), eq(collection.userId, session.user.id)));

    return { success: true };
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return { success: false, error: "Failed to delete collection" };
  }
}
