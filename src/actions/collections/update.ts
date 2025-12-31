"use server";

import { db } from "@/lib/db";
import { collection } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { sanitizeText } from "@/lib/utils";
import {
  updateCollectionSchema,
  type UpdateCollectionInput,
} from "@/lib/validation";
import { eq, and } from "drizzle-orm";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function updateCollection(
  input: UpdateCollectionInput
): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    const parsed = updateCollectionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { id, name } = parsed.data;
    const sanitizedName = sanitizeText(name);

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
      return { success: false, error: "Cannot rename the default collection" };
    }

    await db
      .update(collection)
      .set({ name: sanitizedName })
      .where(and(eq(collection.id, id), eq(collection.userId, session.user.id)));

    return { success: true };
  } catch (error) {
    console.error("Failed to update collection:", error);

    if (
      error instanceof Error &&
      error.message.includes("unique constraint")
    ) {
      return {
        success: false,
        error: "A collection with this name already exists",
      };
    }

    return { success: false, error: "Failed to update collection" };
  }
}
