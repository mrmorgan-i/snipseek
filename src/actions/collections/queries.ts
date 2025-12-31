"use server";

import { db } from "@/lib/db";
import { collection } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { eq, asc, and } from "drizzle-orm";

export async function getUserCollections() {
  const session = await requireAuth();

  const collections = await db
    .select()
    .from(collection)
    .where(eq(collection.userId, session.user.id))
    .orderBy(asc(collection.name));

  return collections;
}

export async function getUserCollectionsCount() {
  const session = await requireAuth();
  return db.$count(collection, eq(collection.userId, session.user.id));
}

export async function getCollectionById(id: string) {
  const session = await requireAuth();

  const [result] = await db
    .select()
    .from(collection)
    .where(and(eq(collection.id, id), eq(collection.userId, session.user.id)));

  return result ?? null;
}

export async function getDefaultCollection() {
  const session = await requireAuth();

  const [result] = await db
    .select()
    .from(collection)
    .where(
      and(
        eq(collection.userId, session.user.id),
        eq(collection.isDefault, true)
      )
    );

  return result ?? null;
}
