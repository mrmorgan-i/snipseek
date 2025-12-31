"use server";

import { db } from "@/lib/db";
import { snippet, collection, user } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { searchSchema, type SearchInput } from "@/lib/validation";
import { eq, and, sql } from "drizzle-orm";
import { generateEmbedding } from "@/lib/openai/embeddings";
import { searchSnippetsText, searchPublicSnippetsText } from "./queries";

type SearchResult = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[] | null;
  isPublic: boolean;
  collectionId?: string;
  collectionName?: string | null;
  createdAt: Date;
  similarity?: number;
  authorName?: string | null;
  authorImage?: string | null;
};

type ActionResult =
  | { success: true; data: SearchResult[]; mode: "text" | "semantic" }
  | { success: false; error: string };

// search user's own snippets
export async function searchSnippets(
  input: SearchInput
): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    const parsed = searchSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { query, mode, language, collectionId, isPublic } = parsed.data;

    // text search
    if (mode === "text") {
      const results = await searchSnippetsText(query, {
        collectionId: collectionId ?? undefined,
        language: language ?? undefined,
        isPublic: isPublic ?? undefined,
      });

      return { success: true, data: results, mode: "text" };
    }

    // semantic search
    const queryEmbedding = await generateEmbedding(query);

    // fallback to text search if embedding fails
    if (!queryEmbedding) {
      const results = await searchSnippetsText(query, {
        collectionId: collectionId ?? undefined,
        language: language ?? undefined,
        isPublic: isPublic ?? undefined,
      });

      return { success: true, data: results, mode: "text" };
    }

    const conditions = [
      eq(snippet.userId, session.user.id),
      sql`${snippet.embedding} IS NOT NULL`,
    ];

    if (collectionId) {
      conditions.push(eq(snippet.collectionId, collectionId));
    }

    if (language) {
      conditions.push(eq(snippet.language, language));
    }

    if (isPublic !== undefined && isPublic !== null) {
      conditions.push(eq(snippet.isPublic, isPublic));
    }

    const embeddingVector = `[${queryEmbedding.join(",")}]`;

    const results = await db
      .select({
        id: snippet.id,
        title: snippet.title,
        description: snippet.description,
        code: snippet.code,
        language: snippet.language,
        tags: snippet.tags,
        isPublic: snippet.isPublic,
        collectionId: snippet.collectionId,
        collectionName: collection.name,
        createdAt: snippet.createdAt,
        similarity: sql<number>`1 - (${snippet.embedding} <=> ${embeddingVector}::vector)`,
      })
      .from(snippet)
      .leftJoin(collection, eq(snippet.collectionId, collection.id))
      .where(and(...conditions))
      .orderBy(sql`${snippet.embedding} <=> ${embeddingVector}::vector`)
      .limit(50);

    // filter by similarity threshold
    const filteredResults = results.filter(
      (r) => r.similarity !== null && r.similarity >= 0.2
    );

    return { success: true, data: filteredResults, mode: "semantic" };
  } catch (error) {
    console.error("Search failed:", error);
    return { success: false, error: "Search failed" };
  }
}

// search public snippets
export async function searchPublicSnippets(
  input: Omit<SearchInput, "collectionId" | "isPublic">
): Promise<ActionResult> {
  try {
    const parsed = searchSchema.safeParse({
      ...input,
      isPublic: true,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { query, mode, language } = parsed.data;

    if (mode === "text") {
      const results = await searchPublicSnippetsText(query, {
        language: language ?? undefined,
      });

      return { success: true, data: results, mode: "text" };
    }

    const queryEmbedding = await generateEmbedding(query);

    if (!queryEmbedding) {
      const results = await searchPublicSnippetsText(query, {
        language: language ?? undefined,
      });

      return { success: true, data: results, mode: "text" };
    }

    const conditions = [
      eq(snippet.isPublic, true),
      sql`${snippet.embedding} IS NOT NULL`,
    ];

    if (language) {
      conditions.push(eq(snippet.language, language));
    }

    const embeddingVector = `[${queryEmbedding.join(",")}]`;

    const results = await db
      .select({
        id: snippet.id,
        title: snippet.title,
        description: snippet.description,
        code: snippet.code,
        language: snippet.language,
        tags: snippet.tags,
        isPublic: snippet.isPublic,
        createdAt: snippet.createdAt,
        similarity: sql<number>`1 - (${snippet.embedding} <=> ${embeddingVector}::vector)`,
        authorName: user.name,
        authorImage: user.image,
      })
      .from(snippet)
      .leftJoin(user, eq(snippet.userId, user.id))
      .where(and(...conditions))
      .orderBy(sql`${snippet.embedding} <=> ${embeddingVector}::vector`)
      .limit(50);

    const filteredResults = results.filter(
      (r) => r.similarity !== null && r.similarity >= 0.2
    );

    return { success: true, data: filteredResults, mode: "semantic" };
  } catch (error) {
    console.error("Public search failed:", error);
    return { success: false, error: "Search failed" };
  }
}
