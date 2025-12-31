"use server";

import { db } from "@/lib/db";
import { snippet, collection } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { sanitizeText } from "@/lib/utils";
import {
  updateSnippetSchema,
  type UpdateSnippetInput,
} from "@/lib/validation";
import { eq, and } from "drizzle-orm";
import { generateEmbedding } from "@/lib/openai/embeddings";

type ActionResult =
  | { success: true; embeddingFailed?: boolean }
  | { success: false; error: string };

export async function updateSnippet(
  input: UpdateSnippetInput
): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    const parsed = updateSnippetSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { id, title, description, code, language, tags, collectionId, isPublic } =
      parsed.data;

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

    // sanitize inputs
    const sanitizedTitle = sanitizeText(title);
    const sanitizedDescription = description
      ? sanitizeText(description)
      : null;
    const sanitizedTags = tags?.map((tag) => sanitizeText(tag)) ?? null;

    // regenerate embedding if title or description changed
    let embedding = existing.embedding;
    let embeddingFailed = false;
    if (
      existing.title !== sanitizedTitle ||
      existing.description !== sanitizedDescription
    ) {
      const embeddingText = `${sanitizedTitle} ${sanitizedDescription ?? ""}`.trim();
      const newEmbedding = await generateEmbedding(embeddingText);
      if (newEmbedding) {
        embedding = newEmbedding;
      } else {
        embeddingFailed = true;
      }
    }

    await db
      .update(snippet)
      .set({
        title: sanitizedTitle,
        description: sanitizedDescription,
        code,
        language,
        tags: sanitizedTags,
        collectionId,
        isPublic: isPublic ?? false,
        embedding,
      })
      .where(and(eq(snippet.id, id), eq(snippet.userId, session.user.id)));

    return { success: true, embeddingFailed };
  } catch (error) {
    console.error("Failed to update snippet:", error);
    return { success: false, error: "Failed to update snippet" };
  }
}
