"use server";

import { db } from "@/lib/db";
import { snippet } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { deleteSnippetSchema, type DeleteSnippetInput } from "@/lib/validation";
import { eq, and } from "drizzle-orm";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteSnippet(
  input: DeleteSnippetInput
): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    const parsed = deleteSnippetSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { id } = parsed.data;

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
      .delete(snippet)
      .where(and(eq(snippet.id, id), eq(snippet.userId, session.user.id)));

    return { success: true };
  } catch (error) {
    console.error("Failed to delete snippet:", error);
    return { success: false, error: "Failed to delete snippet" };
  }
}
