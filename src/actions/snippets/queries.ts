"use server";

import { db } from "@/lib/db";
import { snippet, collection, user } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { eq, desc, and, ilike, or, sql } from "drizzle-orm";

export async function getUserSnippets(options?: {
  collectionId?: string;
  language?: string;
  limit?: number;
}) {
  const session = await requireAuth();

  const conditions = [eq(snippet.userId, session.user.id)];

  if (options?.collectionId) {
    conditions.push(eq(snippet.collectionId, options.collectionId));
  }

  if (options?.language) {
    conditions.push(eq(snippet.language, options.language));
  }

  const snippets = await db
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
      updatedAt: snippet.updatedAt,
    })
    .from(snippet)
    .leftJoin(collection, eq(snippet.collectionId, collection.id))
    .where(and(...conditions))
    .orderBy(desc(snippet.updatedAt))
    .limit(options?.limit ?? 100);

  return snippets;
}

export async function getUserSnippetStats() {
  const session = await requireAuth();

  const [total, publicCount] = await Promise.all([
    db.$count(snippet, eq(snippet.userId, session.user.id)),
    db.$count(
      snippet,
      and(eq(snippet.userId, session.user.id), eq(snippet.isPublic, true))
    ),
  ]);

  return { total, public: publicCount };
}

export async function getSnippetCountsByCollection() {
  const session = await requireAuth();

  const counts = await db
    .select({
      collectionId: snippet.collectionId,
      count: sql<number>`count(*)::int`,
    })
    .from(snippet)
    .where(eq(snippet.userId, session.user.id))
    .groupBy(snippet.collectionId);

  return counts.reduce(
    (acc, { collectionId, count }) => {
      acc[collectionId] = count;
      return acc;
    },
    {} as Record<string, number>
  );
}

export async function getSnippetById(id: string) {
  const session = await requireAuth();

  const [result] = await db
    .select({
      id: snippet.id,
      userId: snippet.userId,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      isPublic: snippet.isPublic,
      collectionId: snippet.collectionId,
      collectionName: collection.name,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    })
    .from(snippet)
    .leftJoin(collection, eq(snippet.collectionId, collection.id))
    .where(and(eq(snippet.id, id), eq(snippet.userId, session.user.id)));

  return result ?? null;
}

export async function searchSnippetsText(
  query: string,
  options?: {
    collectionId?: string;
    language?: string;
    isPublic?: boolean;
  }
) {
  const session = await requireAuth();

  const searchPattern = `%${query}%`;

  const conditions = [
    eq(snippet.userId, session.user.id),
    or(
      ilike(snippet.title, searchPattern),
      ilike(snippet.description, searchPattern),
      ilike(snippet.code, searchPattern),
      sql`${snippet.tags}::text ILIKE ${searchPattern}`
    ),
  ];

  if (options?.collectionId) {
    conditions.push(eq(snippet.collectionId, options.collectionId));
  }

  if (options?.language) {
    conditions.push(eq(snippet.language, options.language));
  }

  if (options?.isPublic !== undefined) {
    conditions.push(eq(snippet.isPublic, options.isPublic));
  }

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
      updatedAt: snippet.updatedAt,
    })
    .from(snippet)
    .leftJoin(collection, eq(snippet.collectionId, collection.id))
    .where(and(...conditions))
    .orderBy(desc(snippet.updatedAt))
    .limit(50);

  return results;
}

// get a public snippet by ID
export async function getPublicSnippetById(id: string) {
  const [result] = await db
    .select({
      id: snippet.id,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      isPublic: snippet.isPublic,
      createdAt: snippet.createdAt,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(snippet)
    .leftJoin(user, eq(snippet.userId, user.id))
    .where(and(eq(snippet.id, id), eq(snippet.isPublic, true)));

  return result ?? null;
}

// get public snippets for the explore page
export async function getPublicSnippets(options?: {
  language?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [eq(snippet.isPublic, true)];

  if (options?.language) {
    conditions.push(eq(snippet.language, options.language));
  }

  const snippets = await db
    .select({
      id: snippet.id,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      isPublic: snippet.isPublic,
      createdAt: snippet.createdAt,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(snippet)
    .leftJoin(user, eq(snippet.userId, user.id))
    .where(and(...conditions))
    .orderBy(desc(snippet.createdAt))
    .limit(options?.limit ?? 20)
    .offset(options?.offset ?? 0);

  return snippets;
}

// get total count of public snippets
export async function getPublicSnippetsCount(options?: {
  language?: string;
}) {
  const conditions = [eq(snippet.isPublic, true)];

  if (options?.language) {
    conditions.push(eq(snippet.language, options.language));
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(snippet)
    .where(and(...conditions));

  return result?.count ?? 0;
}

export async function searchPublicSnippetsText(
  query: string,
  options?: {
    language?: string;
  }
) {
  const searchPattern = `%${query}%`;

  const conditions = [
    eq(snippet.isPublic, true),
    or(
      ilike(snippet.title, searchPattern),
      ilike(snippet.description, searchPattern),
      ilike(snippet.code, searchPattern),
      sql`${snippet.tags}::text ILIKE ${searchPattern}`
    ),
  ];

  if (options?.language) {
    conditions.push(eq(snippet.language, options.language));
  }

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
      authorName: user.name,
      authorImage: user.image,
    })
    .from(snippet)
    .leftJoin(user, eq(snippet.userId, user.id))
    .where(and(...conditions))
    .orderBy(desc(snippet.createdAt))
    .limit(50);

  return results;
}
