"use server";

import { db } from "@/lib/db";
import { snippet } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import {
  toggleSnippetVisibilitySchema,
  type ToggleSnippetVisibilityInput,
} from "@/lib/validation";
import { eq, and } from "drizzle-orm";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function toggleSnippetVisibility(
  input: ToggleSnippetVisibilityInput
): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    const parsed = toggleSnippetVisibilitySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { id, isPublic } = parsed.data;

    // verify ownership
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

    await db
      .update(snippet)
      .set({ isPublic })
      .where(and(eq(snippet.id, id), eq(snippet.userId, session.user.id)));

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle snippet visibility:", error);
    return { success: false, error: "Failed to update visibility" };
  }
}
