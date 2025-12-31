"use server";

import { db } from "@/lib/db";
import { snippet, collection } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { generateId, sanitizeText } from "@/lib/utils";
import {
  createSnippetSchema,
  type CreateSnippetInput,
} from "@/lib/validation";
import { eq, and } from "drizzle-orm";
import { generateEmbedding } from "@/lib/openai/embeddings";

type ActionResult =
  | { success: true; data: { id: string; embeddingFailed?: boolean } }
  | { success: false; error: string };

export async function createSnippet(
  input: CreateSnippetInput
): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    const parsed = createSnippetSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { title, description, code, language, tags, collectionId, isPublic } =
      parsed.data;

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

    // generate embedding from title + description
    const embeddingText = `${sanitizedTitle} ${sanitizedDescription ?? ""}`.trim();
    const embedding = await generateEmbedding(embeddingText);

    const id = generateId();

    await db.insert(snippet).values({
      id,
      userId: session.user.id,
      collectionId,
      title: sanitizedTitle,
      description: sanitizedDescription,
      code,
      language,
      tags: sanitizedTags,
      isPublic: isPublic ?? false,
      embedding,
    });

    return { success: true, data: { id, embeddingFailed: embedding === null } };
  } catch (error) {
    console.error("Failed to create snippet:", error);
    return { success: false, error: "Failed to create snippet" };
  }
}
